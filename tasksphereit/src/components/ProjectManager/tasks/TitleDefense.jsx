// src/components/ProjectManager/tasks/TitleDefense.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Trash2,
  SlidersHorizontal,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  UserCircle2,
  Paperclip,
  X,
} from "lucide-react";

/* ===== Firebase ===== */
import { auth, db } from "../../../config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

const MAROON = "#6A0F14";
const TASKS_COLLECTION = "titleDefenseTasks";

/* ---------- Options ---------- */
const DOC_TASKS = [
  "Brainstorming",
  "Data Gathering: Internet Research",
  "Title Proposal: Concepts and Layouts",
  "Interview User/Client",
  "Collect User/Client Requirements",
  "Title Proposal: Selection of Three Titles",
  "Refining Selected Title",
  "Prepare: PowerPoint Presentation",
  "Title Defense: Mock Defense",
  "Title Defense",
  "Title Re-Defense Planning",
  "Revise Based on the Title Defense Feedback.",
  "Panel-Requested Enhancements Presentation",
  "Team Request for Advisership",
  "Re-Defense: Title Gathering",
  "Re-Defense: Refining the Selected Title",
  "Feedback Gathering",
  "Prepare: Title Re-Defense PowerPoint Presentation",
  "Title Re-Defense: Mock Defense",
  "Title Re-Defense Presentation",
  "Revise Based on the Title Re-Defense Feedback.",
  "Team Request for Advisership",
];
const DISCUSS_TASKS = ["Capstone Meeting"];

/* ---------- Small UI ---------- */
const StatusBadge = ({ value }) => {
  const map = {
    "To Do": "bg-[#D9A81E] text-white",
    "To Review": "bg-[#6FA8DC] text-white",
    "In Progress": "bg-[#7C9C3B] text-white",
    Completed: "bg-[#6A0F14] text-white",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${map[value] || "bg-neutral-200"}`}>
      {value}
    </span>
  );
};

const RevisionPill = ({ value }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-neutral-100 border border-neutral-200">
    {value}
  </span>
);

/* ================= Create Task Dialog ================= */
function CreateTaskDialog({ open, onClose, onCreated, pm, teams = [], members = [] }) {
  const [phase] = useState("Planning"); // fixed for Title Defense
  const [type, setType] = useState(""); // Documentation | Discussion & Review
  const [task, setTask] = useState("");
  const [due, setDue] = useState("");   // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:mm (24h)
  const [pickedUid, setPickedUid] = useState("");
  const [assignees, setAssignees] = useState([]); // [{uid,name}]
  const [comment, setComment] = useState("");

  // pick first team (most PMs manage exactly one team; supports multiple)
  const [teamId, setTeamId] = useState("");
  useEffect(() => {
    if (open && teams.length && !teamId) setTeamId(teams[0].id);
  }, [open, teams, teamId]);

  useEffect(() => {
    if (!open) {
      setType("");
      setTask("");
      setDue("");
      setTime("");
      setPickedUid("");
      setAssignees([]);
      setComment("");
      setTeamId(teams[0]?.id || "");
    }
  }, [open, teams]);

  const availableTasks = useMemo(() => {
    if (type === "Documentation") return DOC_TASKS;
    if (type === "Discussion & Review") return DISCUSS_TASKS;
    return [];
  }, [type]);

  const addAssignee = () => {
    if (!pickedUid) return;
    const found = members.find((m) => m.uid === pickedUid);
    if (!found) return;
    if (!assignees.some((a) => a.uid === pickedUid)) {
      setAssignees((arr) => [...arr, found]);
    }
    setPickedUid("");
  };

  const removeAssignee = (uid) => {
    setAssignees((arr) => arr.filter((a) => a.uid !== uid));
  };

  const canSave =
    teamId &&
    type &&
    task &&
    due &&
    time &&
    assignees.length > 0;

  const handleSave = async () => {
    const dueAt = new Date(`${due}T${time}:00`);
    const team = teams.find((t) => t.id === teamId);

    const payload = {
      phase,                 // "Planning"
      type,                  // "Documentation" | "Discussion & Review"
      task,                  // string
      dueDate: due,          // "YYYY-MM-DD"
      dueTime: time,         // "HH:mm"
      dueAtMs: dueAt.getTime(),
      status: "To Do",       // default
      revision: "No Revision",
      assignees: assignees.map((a) => ({ uid: a.uid, name: a.name })),
      team: team ? { id: team.id, name: team.name } : null,
      comment: comment || "",
      createdBy: pm ? { uid: pm.uid, name: pm.name, role: "Project Manager" } : null,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, TASKS_COLLECTION), payload);
    onCreated?.();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 mx-auto mt-10 w-[900px] max-w-[95vw]">
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200">
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-2 text-[16px] font-semibold" style={{ color: MAROON }}>
              <PlusCircle className="w-5 h-5" />
              <span>Create Task</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 h-[2px] w-full" style={{ backgroundColor: MAROON }} />

          {/* body */}
          <div className="p-5 space-y-5">
            {/* row A: team */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Team</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Project Phase</label>
                <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-100" value="Planning" disabled />
              </div>
            </div>

            {/* row B: cascading selects */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Task Type</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={type}
                  onChange={(e) => { setType(e.target.value); setTask(""); }}
                >
                  <option value="">Select</option>
                  <option>Documentation</option>
                  <option>Discussion & Review</option>
                </select>
              </div>

              <div className="col-span-8">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tasks</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  disabled={!type}
                >
                  <option value="">{type ? "Select task" : "Select Task Type first"}</option>
                  {availableTasks.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* row C: due date/time */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  disabled={!task}
                />
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={!due}
                />
              </div>
            </div>

            {/* row D: assignees */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Assign Members</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                    value={pickedUid}
                    onChange={(e) => setPickedUid(e.target.value)}
                    disabled={!time}
                  >
                    <option value="">{time ? "Select member" : "Set date & time first"}</option>
                    {members.map((m) => (
                      <option key={m.uid} value={m.uid}>{m.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addAssignee}
                    disabled={!pickedUid}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                  >
                    <PlusCircle className="w-4 h-4" /> Add
                  </button>
                </div>

                {/* chips */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {assignees.map((a) => (
                    <span key={a.uid} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 border border-neutral-200">
                      {a.name}
                      <button className="p-0.5 hover:bg-neutral-200 rounded-full" onClick={() => removeAssignee(a.uid)} aria-label={`Remove ${a.name}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* comment box */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Leave Comment:</label>
              <div className="rounded-xl border border-neutral-300 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <UserCircle2 className="w-5 h-5 text-neutral-600" />
                  <span className="text-sm font-semibold text-neutral-800">{pm?.name || "Project Manager"}</span>
                </div>
                <textarea
                  rows={3}
                  className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="mt-2 flex items-center justify-end">
                  <button type="button" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800" title="Attach">
                    <Paperclip className="w-4 h-4" /> Attach
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-2 px-5 pb-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
              style={{ backgroundColor: MAROON }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Main ================= */
const TitleDefense = ({ onBack }) => {
  const handleBack = () => (typeof onBack === "function" ? onBack() : window.history.back());

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const pageSize = 8;

  // current PM
  const pmUid = auth.currentUser?.uid || localStorage.getItem("uid") || "";
  const [pmProfile, setPmProfile] = useState(null); // {uid,name}

  // PM teams & members
  const [teams, setTeams] = useState([]); // [{id,name, memberUids:[], memberNames:[]}]
  const [members, setMembers] = useState([]); // [{uid,name}]

  // Tasks from Firestore
  const [tasks, setTasks] = useState([]); // [{id,...}]

  /* --- Load PM profile --- */
  useEffect(() => {
    if (!pmUid) return;
    const unsub = onSnapshot(
      query(collection(db, "users"), where("uid", "==", pmUid)),
      (snap) => {
        const d = snap.docs[0]?.data();
        if (d) setPmProfile({ uid: pmUid, name: [d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ") });
      }
    );
    return () => unsub && unsub();
  }, [pmUid]);

  /* --- Load PM team(s) and members --- */
  useEffect(() => {
    if (!pmUid) return;

    // teams where manager.uid == pmUid
    const unsubTeams = onSnapshot(
      query(collection(db, "teams"), where("manager.uid", "==", pmUid)),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeams(rows);

        // gather member uids
        const memberUids = Array.from(
          new Set(rows.flatMap((t) => t.memberUids || []))
        );
        if (memberUids.length === 0) {
          setMembers([]);
          return;
        }

        // Firestore "in" supports up to 10; chunk if needed
        const chunks = [];
        for (let i = 0; i < memberUids.length; i += 10) chunks.push(memberUids.slice(i, i + 10));

        const unsubs = chunks.map((uids) =>
          onSnapshot(
            query(collection(db, "users"), where("uid", "in", uids)),
            (s) => {
              // Merge chunks
              const list = s.docs.map((x) => {
                const d = x.data();
                const name = [d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
                return { uid: d.uid || x.id, name };
              });
              // NOTE: We’ll rebuild after all chunks fire—simplest is to refetch on any chunk:
              setMembers((prev) => {
                const map = new Map(prev.map((m) => [m.uid, m]));
                list.forEach((m) => map.set(m.uid, m));
                // Keep only those in memberUids (remove stale)
                return Array.from(map.values()).filter((m) => memberUids.includes(m.uid));
              });
            }
          )
        );

        return () => unsubs.forEach((u) => u && u());
      }
    );

    return () => unsubTeams && unsubTeams();
  }, [pmUid]);

  /* --- Load tasks created by this PM (live) --- */
  useEffect(() => {
    if (!pmUid) return;
    const unsub = onSnapshot(
      query(
        collection(db, TASKS_COLLECTION),
        where("createdBy.uid", "==", pmUid),
        orderBy("createdAt", "desc")
      ),
      (snap) => {
        const rows = snap.docs.map((d, idx) => {
          const data = d.data();
          return {
            id: d.id,
            no: idx + 1,
            assigned: (data.assignees || []).map((a) => a.name).join(", "),
            type: data.type || "",
            phase: data.phase || "Planning",
            task: data.task || "",
            created: data.createdAt?.toDate
              ? data.createdAt.toDate().toLocaleDateString()
              : "",
            due: data.dueDate || "",
            time: data.dueTime || "",
            revision: data.revision || "No Revision",
            status: data.status || "To Do",
          };
        });
        setTasks(rows);
        setPage(1);
        setSelected(new Set());
      }
    );
    return () => unsub && unsub();
  }, [pmUid]);

  /* --- Search & paging --- */
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tasks;
    return tasks.filter(
      (r) =>
        String(r.no).includes(s) ||
        r.assigned.toLowerCase().includes(s) ||
        r.type.toLowerCase().includes(s) ||
        r.task.toLowerCase().includes(s) ||
        r.created.toLowerCase().includes(s) ||
        r.due.toLowerCase().includes(s) ||
        r.time.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r.phase.toLowerCase().includes(s)
    );
  }, [q, tasks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* --- Selection & deletion --- */
  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    // delete one-by-one
    await Promise.all(ids.map((id) => deleteDoc(doc(db, TASKS_COLLECTION, id))));
    setSelected(new Set());
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex items-center justify-between gap-3 flex-nowrap">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100 cursor-pointer"
            title="Back to Tasks"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tasks
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow"
            style={{ background: MAROON }}
            onClick={() => setShowCreate(true)}
          >
            + Create Task
          </button>

          <div className="w-[360px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={deleteSelected}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
            title="Delete"
            disabled={selected.size === 0}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
            title="Filter"
            onClick={() => alert("Open Filter panel")}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] leading-tight whitespace-nowrap">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2 pl-6 pr-3 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected(new Set(pageRows.map((r) => r.id)));
                      } else setSelected(new Set());
                    }}
                    checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))}
                  />
                </th>
                <th className="py-2 pr-3 w-16">NO</th>
                <th className="py-2 pr-3">Assigned</th>
                <th className="py-2 pr-3">Task Type</th>
                <th className="py-2 pr-3">Task</th>
                <th className="py-2 pr-3">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Date Created
                  </div>
                </th>
                <th className="py-2 pr-3">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Due Date
                  </div>
                </th>
                <th className="py-2 pr-3">
                  <div className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Time
                  </div>
                </th>
                <th className="py-2 pr-3">Revision NO</th>
                <th className="py-2 pr-6">Status</th>
                <th className="py-2 pr-6">Project Phase</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, idx) => (
                <tr key={r.id} className="border-t border-neutral-200">
                  <td className="py-2 pl-6 pr-3">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </td>
                  <td className="py-2 pr-3">{(page - 1) * pageSize + idx + 1}.</td>
                  <td className="py-2 pr-3">{r.assigned}</td>
                  <td className="py-2 pr-3">{r.type}</td>
                  <td className="py-2 pr-3">{r.task}</td>
                  <td className="py-2 pr-3">{r.created}</td>
                  <td className="py-2 pr-3">{r.due}</td>
                  <td className="py-2 pr-3">{r.time}</td>
                  <td className="py-2 pr-3"><RevisionPill value={r.revision} /></td>
                  <td className="py-2 pr-6"><StatusBadge value={r.status} /></td>
                  <td className="py-2 pr-6">{r.phase}</td>
                </tr>
              ))}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-neutral-500">
                    No tasks yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-end gap-2 px-4 py-3">
          <button
            className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* modal */}
      <CreateTaskDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {}}
        pm={pmProfile || { uid: pmUid, name: "Project Manager" }}
        teams={teams}
        members={members}
      />
    </div>
  );
};

export default TitleDefense;
