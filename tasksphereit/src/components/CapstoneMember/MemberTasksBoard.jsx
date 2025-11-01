// Live Task Board with comments and attachments
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardList,
  Search as SearchIcon,
  FileSearch,
  User2 as UserIcon,
  Paperclip,
  X as XIcon,
} from "lucide-react";
import { db } from "../../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const MAROON = "#6A0F14";

const COLS = [
  { key: "todo", title: "To Do", color: "#f0b429" },
  { key: "inprogress", title: "In Progress", color: "#6b8f3c" },
  { key: "review", title: "To Review", color: "#5b8bb6" },
  { key: "missed", title: "Missed Task", color: "#cc1f1a" },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
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
const cleanBase = (p = "") =>
  String(p).split("/").pop()?.split("?")[0] || String(p);
const humanName = (f) =>
  f?.name ||
  f?.originalName ||
  f?.fileName ||
  cleanBase(f?.path || f?.url || "");

function ColumnHeader({ title, color }) {
  return (
    <div
      className="rounded-t-xl px-4 py-3 text-white font-semibold shadow-sm"
      style={{ backgroundColor: color }}
    >
      {title}
    </div>
  );
}

function TaskCard({ task, color, onOpen, onOpenAttachment }) {
  return (
    <div className="relative rounded-lg bg-white shadow-md border border-neutral-200 overflow-hidden">
      <div
        className="absolute left-0 top-2 bottom-2 w-2 rounded-md"
        style={{ backgroundColor: color }}
      />
      <div className="pl-4 pr-3 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-800">
            <UserIcon className="w-4 h-4 text-neutral-700" />
            <span className="truncate max-w-[180px]" title={task.assignee}>
              {task.assignee}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenAttachment(task)}
            className="shrink-0 p-1 rounded hover:bg-neutral-100"
            title="Open attachments"
            aria-label="Open attachments"
          >
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
          <button
            onClick={() => onOpen(task)}
            className="ml-auto px-2 py-0.5 text-xs rounded border border-neutral-300 hover:bg-neutral-50"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MemberTasksBoard() {
  const uid =
    typeof window !== "undefined" ? localStorage.getItem("uid") : null;
  const [q, setQ] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // detail modal state
  const [detail, setDetail] = useState(
    /** @type {null | {task:any, comments:any[], loading:boolean, tab:'comments'|'attachments'}} */ (
      null
    )
  );
  const [commentText, setCommentText] = useState("");
  const [pendingFiles, setPendingFiles] = useState(/** @type {File[]} */ ([]));

  // aggregated attachments (task.fileUrl + comment attachments)
  const [aggAttachments, setAggAttachments] = useState([]);

  // ========= Load tasks =========
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const cols = [
          "titleDefenseTasks",
          "oralDefenseTasks",
          "finalDefenseTasks",
          "finalRedefenseTasks",
        ];
        const snaps = await Promise.all(
          cols.map((c) => getDocs(collection(db, c)))
        );
        const all = [];
        snaps.forEach((s) =>
          s.forEach((dx) =>
            all.push({
              id: dx.id,
              __collection: s.query._query.path.segments.slice(-1)[0],
              ...(dx.data() || {}),
            })
          )
        );
        const mine = all.filter(
          (t) =>
            Array.isArray(t.assignees) &&
            t.assignees.some((a) => a?.uid === uid) &&
            (t.taskManager === "Adviser" ||
              !t.taskManager ||
              t.taskManager === "PM" ||
              t.taskManager === "Member")
        );
        const mapped = mine.map((t) => {
          const statusRaw = String(t.status || "To Do").toLowerCase();
          const missed =
            typeof t.dueAtMs === "number" &&
            t.dueAtMs < Date.now() &&
            (t.status || "") !== "Completed";
          const col = missed
            ? "missed"
            : statusRaw.includes("progress")
            ? "inprogress"
            : statusRaw.includes("review")
            ? "review"
            : "todo";
          return {
            id: t.id,
            assignee:
              (t.assignees || [])
                .map((a) => a?.name)
                .filter(Boolean)
                .join(", ") || "—",
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
    return () => {
      alive = false;
    };
  }, [uid]);

  // ========= Filters / groups =========
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tasks;
    return tasks.filter((t) =>
      [t.assignee, t.chapter, t.subtask, t.revision]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q, tasks]);

  const grouped = useMemo(() => {
    return COLS.reduce((acc, c) => {
      acc[c.key] = filtered.filter((t) => t.status === c.key);
      return acc;
    }, /** @type {Record<string, any[]>} */ ({}));
  }, [filtered]);

  // ========= Modal open (comments + attachments live) =========
  const commentsUnsubRef = useRef(null);

  const openTask = async (task, initialTab = "comments") => {
    // reset modal
    setDetail({ task, comments: [], loading: true, tab: initialTab });

    // live comments subscription for this task
    if (commentsUnsubRef.current) {
      commentsUnsubRef.current();
      commentsUnsubRef.current = null;
    }
    const qy = query(
      collection(db, "taskComments"),
      where("taskId", "==", task.id),
      orderBy("createdAt", "asc")
    );
    commentsUnsubRef.current = onSnapshot(
      qy,
      (snap) => {
        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() || {}) }));
        // sort in case of null timestamps
        list.sort(
          (a, b) =>
            (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0)
        );
        setDetail((prev) =>
          prev ? { ...prev, comments: list, loading: false } : prev
        );
        // rebuild aggregated attachments whenever comments change
        buildAggregatedAttachments(task, list);
      },
      () => {
        setDetail((prev) =>
          prev ? { ...prev, comments: [], loading: false } : prev
        );
      }
    );

    // initial attachments build (task.fileUrl)
    buildAggregatedAttachments(task, []);
  };

  const closeTask = () => {
    if (commentsUnsubRef.current) {
      commentsUnsubRef.current();
      commentsUnsubRef.current = null;
    }
    setDetail(null);
    setPendingFiles([]);
    setCommentText("");
    setAggAttachments([]);
  };

  // ========= Build aggregated attachments =========
  const buildAggregatedAttachments = async (task, comments) => {
    const storage = getStorage();

    // From task doc's fileUrl
    const rawArr = Array.isArray(task.__raw?.fileUrl) ? task.__raw.fileUrl : [];
    const taskSide = await Promise.all(
      rawArr.map(async (f) => {
        // try to resolve a URL if only "path" present
        let url = f.url || f.publicUrl || "";
        if (!url && f.path) {
          try {
            url = await getDownloadURL(storageRef(storage, f.path));
          } catch {
            url = "";
          }
        }
        return {
          source: "task",
          name: humanName(f),
          url,
          ts:
            f.uploadedAtMs ||
            (f.uploadedAt?.toDate?.() ? f.uploadedAt.toDate().getTime() : null),
        };
      })
    );

    // From all comment attachments of this task
    const commentSide = [];
    (comments || []).forEach((c) => {
      const when =
        c.createdAt?.toMillis?.() ||
        (typeof c.createdAt === "number" ? c.createdAt : null) ||
        null;
      (Array.isArray(c.attachments) ? c.attachments : []).forEach((a) => {
        commentSide.push({
          source: "comment",
          name: humanName(a),
          url: a.url || "",
          ts: when,
        });
      });
    });

    const all = [...taskSide, ...commentSide]
      .filter((x) => x.url) // keep only linkable
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));

    setAggAttachments(all);
  };

  // ========= Upload + post comment =========
  const uploadAttachments = async (task) => {
    const out = [];
    try {
      const storage = getStorage();
      for (const f of pendingFiles) {
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
    if (!commentText.trim() && pendingFiles.length === 0) return;
    const attachments = await uploadAttachments(detail.task);
    try {
      await addDoc(collection(db, "taskComments"), {
        taskId: detail.task.id,
        author: {
          uid,
          name: localStorage.getItem("name") || "Member",
          role: "Member",
        },
        text: commentText.trim(),
        attachments,
        editedOnce: false,
        createdAt: serverTimestamp(),
      });
      setCommentText("");
      setPendingFiles([]);
      // comments list + aggregated attachments auto-refresh via onSnapshot
    } catch (e) {
      console.error("Post failed", e);
    }
  };

  return (
    <div className=" space-y-4">
      <div className="space-y-2">
        <div
          className="flex items-center gap-2 text-[18px] font-semibold"
          style={{ color: MAROON }}
        >
          <ClipboardList className="w-5 h-5" />
          <span>Tasks Board</span>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: MAROON }} />
      </div>

      <div className="mb-2">
        <div className="relative w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {COLS.map((col) => (
          <div
            key={col.key}
            className="rounded-xl border border-neutral-200 bg-white shadow-md flex flex-col"
          >
            <ColumnHeader title={col.title} color={col.color} />
            <div className="p-4 space-y-4 min-h-[420px]">
              {grouped[col.key]?.length ? (
                grouped[col.key].map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    color={col.color}
                    onOpen={(task) => openTask(task, "comments")}
                    onOpenAttachment={(task) => openTask(task, "attachments")}
                  />
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
          <div className="absolute inset-0 bg-black/40" onClick={closeTask} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-w-[95vw] bg-white rounded-2xl border border-neutral-200 shadow-2xl">
            {/* header */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ backgroundColor: MAROON }}
            >
              <div className="text-white text-sm font-semibold">
                Task Details
              </div>
              <button onClick={closeTask} className="text-white">
                Close
              </button>
            </div>

            <div className="p-5 text-sm space-y-3">
              <div className="font-semibold">{detail.task.chapter}</div>
              <div className="text-neutral-700">
                Assignees: {detail.task.assignee}
              </div>
              <div className="text-neutral-700">
                Due: {detail.task.due} {detail.task.dueTime}
              </div>

              {/* tabs */}
              <div className="mt-3 border-b flex gap-6">
                <button
                  onClick={() =>
                    setDetail((d) => (d ? { ...d, tab: "comments" } : d))
                  }
                  className={`pb-2 text-sm font-medium ${
                    detail.tab === "comments"
                      ? "border-b-2 border-neutral-800"
                      : "text-neutral-500"
                  }`}
                >
                  Comments
                </button>
                <button
                  onClick={() =>
                    setDetail((d) => (d ? { ...d, tab: "attachments" } : d))
                  }
                  className={`pb-2 text-sm font-medium ${
                    detail.tab === "attachments"
                      ? "border-b-2 border-neutral-800"
                      : "text-neutral-500"
                  }`}
                >
                  Attachments
                </button>
              </div>

              {/* COMMENTS TAB */}
              {detail.tab === "comments" && (
                <>
                  <div className="mt-2">
                    {detail.loading ? (
                      <div className="text-neutral-500 text-sm">
                        Loading comments…
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-auto pr-1">
                        {detail.comments.length === 0 && (
                          <div className="text-neutral-500 text-sm">
                            No comments yet.
                          </div>
                        )}
                        {detail.comments.map((c) => (
                          <div
                            key={c.id}
                            className="rounded-md border border-neutral-200 p-2"
                          >
                            <div className="text-xs text-neutral-600">
                              {c.author?.name || "User"} ·{" "}
                              {c.createdAt?.toDate?.()?.toLocaleString?.() ||
                                ""}
                            </div>
                            <div className="mt-1 text-sm text-neutral-800 whitespace-pre-wrap">
                              {c.text}
                            </div>
                            {Array.isArray(c.attachments) &&
                              c.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {c.attachments.map((a, i) => (
                                    <div key={i}>
                                      <a
                                        href={a.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#1d4ed8] hover:underline"
                                      >
                                        {a.name || "file"}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* composer */}
                  <div className="mt-3 border-t pt-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment…"
                      className="w-full border border-neutral-300 rounded-md p-2 text-sm"
                      rows={3}
                    />
                    {/* pending file chips */}
                    {pendingFiles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {pendingFiles.map((f, i) => (
                          <span
                            key={`${f.name}-${i}`}
                            className="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs bg-neutral-50"
                          >
                            <Paperclip className="w-3 h-3" />
                            {f.name}
                            <button
                              onClick={() =>
                                setPendingFiles((prev) =>
                                  prev.filter((_, idx) => idx !== i)
                                )
                              }
                              className="hover:text-red-600"
                              title="Remove"
                            >
                              <XIcon className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          setPendingFiles((prev) => [
                            ...prev,
                            ...Array.from(e.target.files || []),
                          ])
                        }
                        className="text-sm"
                      />
                      <button
                        onClick={postComment}
                        className="px-3 py-1.5 rounded-md text-white"
                        style={{ backgroundColor: MAROON }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ATTACHMENTS TAB */}
              {detail.tab === "attachments" && (
                <div className="rounded-lg border border-neutral-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-600">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium">
                          Attachment
                        </th>
                        <th className="text-right px-4 py-2 font-medium">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {aggAttachments.length === 0 ? (
                        <tr>
                          <td
                            className="px-4 py-6 text-center text-neutral-500"
                            colSpan={2}
                          >
                            No attachments yet.
                          </td>
                        </tr>
                      ) : (
                        aggAttachments.map((f, i) => (
                          <tr
                            key={`${f.url}-${i}`}
                            className="hover:bg-neutral-50"
                          >
                            <td className="px-4 py-3">
                              <a
                                href={f.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[15px] hover:underline cursor-pointer"
                                title={
                                  f.source === "task" ? "[task]" : "[comment]"
                                }
                              >
                                {humanName(f)}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-right text-neutral-700">
                              {f.ts ? new Date(f.ts).toLocaleString() : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
