// Live Task Board with comments and attachments
import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, Search as SearchIcon, FileSearch, User2 as UserIcon } from "lucide-react";
import { db } from "../../config/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const MAROON = "#6A0F14";

const COLS = [
  { key: "todo",        title: "To Do",       color: "#f0b429" },
  { key: "inprogress",  title: "In Progress", color: "#6b8f3c" },
  { key: "review",      title: "To Review",   color: "#5b8bb6" },
  { key: "missed",      title: "Missed Task", color: "#cc1f1a" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const to12h = (t) => {
  if (!t) return "";
  const [H, M] = String(t).split(":").map(Number);
  const ampm = H >= 12 ? "PM" : "AM";
  const hh = ((H + 11) % 12) + 1;
  return `${hh}:${String(M || 0).padStart(2, "0")} ${ampm}`;
};
const fmtDate = (yyyy_mm_dd) => {
  if (!yyyy_mm_dd) return "";
  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  return `${MONTHS[(m || 1) - 1]} ${Number(d || 1)}, ${y}`;
};

function ColumnHeader({ title, color }) {
  return (
    <div className="rounded-t-xl px-4 py-3 text-white font-semibold shadow-sm" style={{ backgroundColor: color }}>{title}</div>
  );
}

function TaskCard({ task, color, onOpen, onOpenAttachment }) {
  return (
    <div className="relative rounded-lg bg-white shadow-md border border-neutral-200 overflow-hidden">
      <div className="absolute left-0 top-2 bottom-2 w-2 rounded-md" style={{ backgroundColor: color }} />
      <div className="pl-4 pr-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-800">
            <UserIcon className="w-4 h-4 text-neutral-700" />
            <span className="truncate max-w-[180px]" title={task.assignee}>{task.assignee}</span>
          </div>
          <button type="button" onClick={() => onOpenAttachment(task)} className="shrink-0 p-1 rounded hover:bg-neutral-100" title="Open attachments" aria-label="Open attachments">
            <FileSearch className="w-4 h-4 text-neutral-700" />
          </button>
        </div>
        <div className="mt-2 text-[12px] text-neutral-700">
          <div className="border-t border-neutral-300/70 my-1" />
          <div>{task.chapter}</div>
          <div>{task.subtask}</div>
          <div>{task.revision}</div>
          <div className="border-t border-neutral-300/70 my-1" />
        </div>
        <div className="flex items-center gap-2 text-[12px] text-neutral-800">
          <span className="inline-block w-2 h-2 rounded-full bg-red-600" />
          <span className="font-medium">{task.due}</span>
          <button onClick={() => onOpen(task)} className="ml-auto px-2 py-0.5 text-xs rounded border border-neutral-300 hover:bg-neutral-50">View</button>
        </div>
      </div>
    </div>
  );
}

export default function MemberTasksBoard() {
  const uid = typeof window !== "undefined" ? localStorage.getItem("uid") : null;
  const [q, setQ] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null); // {task, comments, loading}
  const [commentText, setCommentText] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const cols = ["titleDefenseTasks","oralDefenseTasks","finalDefenseTasks","finalRedefenseTasks"];
        const snaps = await Promise.all(cols.map((c) => getDocs(collection(db, c))));
        const all = [];
        snaps.forEach((s) => s.forEach((dx) => all.push({ id: dx.id, ...(dx.data() || {}) })));
        const mine = all.filter((t) => Array.isArray(t.assignees) && t.assignees.some((a) => a?.uid === uid) && (t.taskManager === "Adviser" || !t.taskManager || t.taskManager === "PM" || t.taskManager === "Member"));
        const mapped = mine.map((t) => {
          const statusRaw = String(t.status || "To Do").toLowerCase();
          const missed = typeof t.dueAtMs === "number" && t.dueAtMs < Date.now() && (t.status || "") !== "Completed";
          const col = missed ? "missed" : (statusRaw.includes("progress") ? "inprogress" : (statusRaw.includes("review") ? "review" : "todo"));
          return {
            id: t.id,
            assignee: (t.assignees || []).map((a) => a?.name).filter(Boolean).join(", ") || "—",
            chapter: t.task || t.type || "Task",
            subtask: t.type || "—",
            revision: t.revision || "No Revision",
            due: fmtDate(t.dueDate || ""),
            dueTime: to12h(t.dueTime || ""),
            status: col,
            __raw: t,
          };
        });
        if (alive) setTasks(mapped);
      } catch (e) {
        console.error("Task board load failed:", e);
        if (alive) setTasks([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [uid]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tasks;
    return tasks.filter((t) =>
      [t.assignee, t.chapter, t.subtask, t.revision].filter(Boolean).some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q, tasks]);

  const grouped = useMemo(() => {
    return COLS.reduce((acc, c) => {
      acc[c.key] = filtered.filter((t) => t.status === c.key);
      return acc;
    }, /** @type {Record<string, any[]>} */ ({}));
  }, [filtered]);

  const openTask = async (task) => {
    setDetail({ task, comments: [], loading: true });
    try {
      const snap = await getDocs(collection(db, "taskComments"));
      const list = [];
      snap.forEach((d) => { const x = d.data() || {}; if (x.taskId === task.id) list.push({ id: d.id, ...x }); });
      list.sort((a,b)=> (a.createdAt?.toMillis?.()||0) - (b.createdAt?.toMillis?.()||0));
      setDetail({ task, comments: list, loading: false });
    } catch (e) { console.error(e); setDetail({ task, comments: [], loading: false }); }
  };

  const uploadAttachments = async (task) => {
    const out = [];
    try {
      const storage = getStorage();
      for (const f of files) {
        const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${task.id}/${uid}/${Date.now()}_${safe}`;
        const ref = storageRef(storage, path);
        await uploadBytes(ref, f);
        const url = await getDownloadURL(ref);
        out.push({ name: f.name, url });
      }
    } catch (e) {
      console.error("Upload failed", e);
    }
    return out;
  };

  const postComment = async () => {
    if (!detail?.task) return;
    if (!commentText.trim() && files.length === 0) return;
    const attachments = await uploadAttachments(detail.task);
    try {
      await addDoc(collection(db, "taskComments"), {
        taskId: detail.task.id,
        author: { uid, name: localStorage.getItem("name") || "Member", role: "Member" },
        text: commentText.trim(),
        attachments,
        editedOnce: false,
        createdAt: serverTimestamp(),
      });
      setCommentText("");
      setFiles([]);
      await openTask(detail.task);
    } catch (e) { console.error("Post failed", e); }
  };

  return (
    <div className=" space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[18px] font-semibold" style={{ color: MAROON }}>
          <ClipboardList className="w-5 h-5" />
          <span>Tasks Board</span>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: MAROON }} />
      </div>

      <div className="mb-2">
        <div className="relative w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {COLS.map((col) => (
          <div key={col.key} className="rounded-xl border border-neutral-200 bg-white shadow-md flex flex-col">
            <ColumnHeader title={col.title} color={col.color} />
            <div className="p-4 space-y-4 min-h-[420px]">
              {grouped[col.key]?.length ? (
                grouped[col.key].map((t) => (
                  <TaskCard key={t.id} task={t} color={col.color} onOpen={openTask} onOpenAttachment={openTask} />
                ))
              ) : (
                <div className="text-sm text-neutral-400 italic">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[860px] max-w-[95vw] bg-white rounded-2xl border border-neutral-200 shadow-2xl">
            <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: MAROON }}>
              <div className="text-white text-sm font-semibold">Task Details</div>
              <button onClick={() => setDetail(null)} className="text-white">Close</button>
            </div>
            <div className="p-5 text-sm space-y-3">
              <div className="font-semibold">{detail.task.chapter}</div>
              <div className="text-neutral-700">Assignees: {detail.task.assignee}</div>
              <div className="text-neutral-700">Due: {detail.task.due} {detail.task.dueTime}</div>
              <div className="mt-4">
                <div className="text-[13px] font-semibold mb-2">Comments</div>
                {detail.loading ? (
                  <div className="text-neutral-500 text-sm">Loading comments…</div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-auto pr-1">
                    {detail.comments.length === 0 && (<div className="text-neutral-500 text-sm">No comments yet.</div>)}
                    {detail.comments.map((c) => (
                      <div key={c.id} className="rounded-md border border-neutral-200 p-2">
                        <div className="text-xs text-neutral-600">{c.author?.name || 'User'} · {c.createdAt?.toDate?.()?.toLocaleString?.() || ''}</div>
                        <div className="mt-1 text-sm text-neutral-800 whitespace-pre-wrap">{c.text}</div>
                        {Array.isArray(c.attachments) && c.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {c.attachments.map((a, i) => (<div key={i}><a href={a.url} target="_blank" rel="noreferrer" className="text-[#1d4ed8] hover:underline">{a.name || 'file'}</a></div>))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 border-t pt-3">
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment…" className="w-full border border-neutral-300 rounded-md p-2 text-sm" rows={3} />
                <div className="mt-2 flex items-center justify-between">
                  <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-sm" />
                  <button onClick={postComment} className="px-3 py-1.5 rounded-md text-white" style={{ backgroundColor: MAROON }}>Post</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

