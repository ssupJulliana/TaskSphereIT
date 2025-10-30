// src/components/ProjectManager/tasks/OralDefense.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  UserCircle2,
  Paperclip,
  X,
  MoreVertical,
  Loader2,
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
  updateDoc,
  where,
} from "firebase/firestore";

const MAROON = "#6A0F14";
const TASKS_COLLECTION = "oralDefenseTasks";

/* -------------------- STATUS / REVISION UI -------------------- */
const StatusBadge = ({ value }) => {
  if (!value || value === "null") return <span>null</span>;
  const map = {
    "To Do": "bg-[#D9A81E] text-white",
    "To Review": "bg-[#6FA8DC] text-white",
    "In Progress": "bg-[#7C9C3B] text-white",
    Completed: "bg-[#6A0F14] text-white",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
        map[value] || "bg-neutral-200"
      }`}
    >
      {value}
    </span>
  );
};

const RevisionPill = ({ value }) =>
  value && value !== "null" ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-neutral-100 border border-neutral-200">
      {value}
    </span>
  ) : (
    <span>null</span>
  );

/* -------------------- CASCADING OPTIONS -------------------- */
const METHODOLOGIES = ["Agile", "Rapid Application Development (RAD)", "Spiral"];

const PHASE_OPTIONS = {
  Agile: ["Analysis", "Design", "Implementation", "Development", "Testing", "Preparation"],
  "Rapid Application Development (RAD)": ["Design", "Prototyping", "Review & Iterate", "Preparation"],
  Spiral: ["Risk Analysis", "Design", "Prototype", "Evaluation", "Preparation"],
};

const TASK_SEEDS = {
  Agile: {
    Documentation: [
      "UI Design & Functionalities",
      "Prepare: Chapter 1",
      "Prepare: Chapter 2",
      "Prepare: Chapter 3 (Implementation)",
      "Prepare: Chapter 3 (Development)",
      "Prepare: Chapter 4 (Methodology/Environment/Locale/Population/Org Chart/Requirement Spec)",
      "Manuscript Final Review",
      "PowerPoint Presentation",
      "Mock Defense",
      "Manuscript Printing",
      "Oral Defense",
    ],
    "Discussion & Review": [
      "Capstone Meeting",
      "Adviser Consultation",
      "Interview User/Client",
      "Gather User/Client Feedback on Prototype Concept",
    ],
  },
  "Rapid Application Development (RAD)": {
    Documentation: [
      "UI Design",
      "Initial UI Prototype",
      "Conduct Rapid UI Feedback Session",
      "Iterate UI Prototype Based on User/Client Feedback",
      "Prepare: Chapter 1",
      "Prepare: Chapter 2",
      "Prepare: Chapter 3 (Implementation/Development)",
      "Prepare: Chapter 4 (Methodology/Environment/Locale/Population/Org Chart/Requirement Spec)",
      "Manuscript Final Review",
      "PowerPoint Presentation",
      "Mock Defense",
      "Manuscript Printing",
      "Oral Defense",
    ],
    "Discussion & Review": [
      "Capstone Meeting",
      "Adviser Consultation",
      "Interview User/Client",
      "Client Feedback Session",
    ],
  },
  Spiral: {
    Documentation: [
      "Risk Analysis",
      "UI Design",
      "Initial UI Prototype",
      "Iterate UI Prototype Based on User/Client Feedback",
      "Prepare: Chapter 1",
      "Prepare: Chapter 2",
      "Prepare: Chapter 3 (Implementation/Development)",
      "Prepare: Chapter 4 (Methodology/Environment/Locale/Population/Org Chart/Requirement Spec)",
      "Manuscript Final Review",
      "PowerPoint Presentation",
      "Mock Defense",
      "Manuscript Printing",
      "Oral Defense",
    ],
    "Discussion & Review": [
      "Capstone Meeting",
      "Adviser Consultation",
      "Interview User/Client",
      "Gather User/Client Feedback on Prototype Concept",
    ],
  },
};

/* ======= Edit/Create Task Dialog (Actions → Edit) ======= */
function EditTaskDialog({
  open,
  onClose,
  onSaved,
  pm,
  teams = [],
  members = [],
  seedMember,
  existingTask,
}) {
  const [saving, setSaving] = useState(false);

  const [teamId, setTeamId] = useState("");
  const [methodology, setMethodology] = useState("");
  const [phase, setPhase] = useState("");
  const [type, setType] = useState("");
  const [task, setTask] = useState("");
  const [due, setDue] = useState("");
  const [time, setTime] = useState("");
  const [pickedUid, setPickedUid] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!open) return;
    // seed defaults
    setTeamId(existingTask?.team?.id || teams[0]?.id || "");
    if (existingTask) {
      setMethodology(existingTask.methodology || "");
      setPhase(existingTask.phase || "");
      setType(existingTask.type || "");
      setTask(existingTask.task || "");
      setDue(existingTask.dueDate || "");
      setTime(existingTask.dueTime || "");
      setAssignees(
        (existingTask.assignees || []).map((a) => ({ uid: a.uid, name: a.name }))
      );
      setComment(existingTask.comment || "");
    } else {
      setMethodology("");
      setPhase("");
      setType("");
      setTask("");
      setDue("");
      setTime("");
      setAssignees(seedMember ? [{ uid: seedMember.uid, name: seedMember.name }] : []);
      setComment("");
    }
  }, [open, existingTask, seedMember, teams]);

  const availablePhases = useMemo(
    () => (methodology ? PHASE_OPTIONS[methodology] || [] : []),
    [methodology]
  );
  const availableTypes = useMemo(
    () => (methodology ? ["Documentation", "Discussion & Review"] : []),
    [methodology]
  );
  const availableTasks = useMemo(
    () => (methodology && type ? TASK_SEEDS[methodology]?.[type] || [] : []),
    [methodology, type]
  );

  const canSave =
    teamId &&
    methodology &&
    phase &&
    type &&
    task &&
    assignees.length > 0;

  const addAssignee = () => {
    if (!pickedUid) return;
    const found = members.find((m) => m.uid === pickedUid);
    if (!found) return;
    if (!assignees.some((a) => a.uid === pickedUid)) {
      setAssignees((arr) => [...arr, found]);
    }
    setPickedUid("");
  };
  const removeAssignee = (uid) =>
    setAssignees((arr) => arr.filter((a) => a.uid !== uid));

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const team = teams.find((t) => t.id === teamId) || null;
      const dueAtMs =
        due && time ? new Date(`${due}T${time}:00`).getTime() : null;

      const payload = {
        methodology,
        phase,
        type,
        task,
        dueDate: due || null,
        dueTime: time || null,
        dueAtMs,
        status: existingTask?.status || "To Do",
        revision: existingTask?.revision || "No Revision",
        assignees: assignees.map((a) => ({ uid: a.uid, name: a.name })),
        team: team ? { id: team.id, name: team.name } : null,
        comment: comment || "",
        ...(existingTask ? {} : { createdAt: serverTimestamp() }),
        createdBy: pm
          ? { uid: pm.uid, name: pm.name, role: "Project Manager" }
          : null,
      };

      if (existingTask?.id) {
        await updateDoc(doc(db, TASKS_COLLECTION, existingTask.id), payload);
      } else {
        await addDoc(collection(db, TASKS_COLLECTION), payload);
      }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 mx-auto mt-10 w-[980px] max-w-[95vw]">
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-2 text-[16px] font-semibold" style={{ color: MAROON }}>
              <PlusCircle className="w-5 h-5" />
              <span>{existingTask ? "Edit Task" : "Create Task"}</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 h-[2px] w-full" style={{ backgroundColor: MAROON }} />

          {/* body */}
          <div className="p-5 space-y-5">
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
                <label className="block text-sm font-medium text-neutral-700 mb-1">Methodology</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={methodology}
                  onChange={(e) => {
                    setMethodology(e.target.value);
                    setPhase("");
                    setType("");
                    setTask("");
                  }}
                >
                  <option value="">Select</option>
                  {METHODOLOGIES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Project Phase</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  disabled={!methodology}
                >
                  <option value="">{methodology ? "Select phase" : "Pick Methodology first"}</option>
                  {(PHASE_OPTIONS[methodology] || []).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Task Type</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={type}
                  onChange={(e) => { setType(e.target.value); setTask(""); }}
                  disabled={!methodology}
                >
                  <option value="">{methodology ? "Select" : "Pick Methodology first"}</option>
                  {["Documentation", "Discussion & Review"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tasks</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  disabled={!type}
                >
                  <option value="">{type ? "Select task" : "Pick Task Type first"}</option>
                  {(TASK_SEEDS[methodology]?.[type] || []).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Assign Members</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  value={pickedUid}
                  onChange={(e) => setPickedUid(e.target.value)}
                >
                  <option value="">Select member</option>
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
              <div className="mt-2 flex flex-wrap gap-2">
                {assignees.map((a) => (
                  <span key={a.uid} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 border border-neutral-200">
                    {a.name}
                    <button className="p-0.5 hover:bg-neutral-200 rounded-full" onClick={() => removeAssignee(a.uid)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

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
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!canSave || saving}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
              style={{ backgroundColor: MAROON }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {existingTask ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Main ============================ */
const OralDefense = ({ onBack }) => {
  const handleBack = () =>
    typeof onBack === "function" ? onBack() : window.history.back();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [menuOpenId, setMenuOpenId] = useState(null); // member uid
  const [editingModal, setEditingModal] = useState(null); // {seedMember, existingTask}
  const [deletingId, setDeletingId] = useState(null); // task id

  const [editingCell, setEditingCell] = useState(null); // {key, field}
  const [optimistic, setOptimistic] = useState({}); // {[memberUid]: {fields}}

  const pageSize = 10;

  // current PM
  const pmUid = auth.currentUser?.uid || localStorage.getItem("uid") || "";
  const [pmProfile, setPmProfile] = useState(null);

  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);

  // raw task docs created by this PM
  const [tasks, setTasks] = useState([]);

  /* PM profile */
  useEffect(() => {
    if (!pmUid) return;
    const unsub = onSnapshot(
      query(collection(db, "users"), where("uid", "==", pmUid)),
      (snap) => {
        const d = snap.docs[0]?.data();
        if (!d) return;
        const name = [d.firstName, d.middleName, d.lastName]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        setPmProfile({ uid: pmUid, name: name || "Project Manager" });
      }
    );
    return () => unsub && unsub();
  }, [pmUid]);

  /* Teams + members of this PM */
  useEffect(() => {
    if (!pmUid) return;
    const unsubTeams = onSnapshot(
      query(collection(db, "teams"), where("manager.uid", "==", pmUid)),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeams(rows);

        const memberUids = Array.from(
          new Set(rows.flatMap((t) => t.memberUids || []))
        );
        if (memberUids.length === 0) return setMembers([]);

        const chunks = [];
        for (let i = 0; i < memberUids.length; i += 10)
          chunks.push(memberUids.slice(i, i + 10));
        const unsubs = chunks.map((uids) =>
          onSnapshot(
            query(collection(db, "users"), where("uid", "in", uids)),
            (s) => {
              const list = s.docs.map((x) => {
                const d = x.data();
                const name = [d.firstName, d.middleName, d.lastName]
                  .filter(Boolean)
                  .join(" ")
                  .replace(/\s+/g, " ")
                  .trim();
                return { uid: d.uid || x.id, name };
              });
              setMembers((prev) => {
                const map = new Map(prev.map((m) => [m.uid, m]));
                list.forEach((m) => map.set(m.uid, m));
                return Array.from(map.values()).filter((m) =>
                  memberUids.includes(m.uid)
                );
              });
            }
          )
        );
        return () => unsubs.forEach((u) => u && u());
      }
    );
    return () => unsubTeams && unsubTeams();
  }, [pmUid]);

  /* Tasks created by this PM (live) */
  useEffect(() => {
    if (!pmUid) return;
    const unsub = onSnapshot(
      query(
        collection(db, TASKS_COLLECTION),
        where("createdBy.uid", "==", pmUid),
        orderBy("createdAt", "desc")
      ),
      (snap) => {
        setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setSelected(new Set());
        setPage(1);

        setOptimistic((prev) => {
          const next = { ...prev };
          const memberWithTask = new Set();
          for (const t of snap.docs) {
            const data = t.data();
            (data.assignees || []).forEach((a) => {
              if (a?.uid) memberWithTask.add(a.uid);
            });
          }
          for (const k of Object.keys(next)) {
            if (memberWithTask.has(k)) delete next[k];
          }
          return next;
        });
      }
    );
    return () => unsub && unsub();
  }, [pmUid]);

  /* Build table rows: per member, latest task (if any) + optimistic overlay */
  const rows = useMemo(() => {
    // latest task per member
    const latestByMember = new Map(); // uid -> taskDoc
    for (const t of tasks) {
      for (const a of t.assignees || []) {
        if (!a?.uid) continue;
        const prev = latestByMember.get(a.uid);
        const prevTs = prev?.createdAt?.toDate?.() ?? null;
        const curTs = t?.createdAt?.toDate?.() ?? null;
        if (!prev || (curTs && prevTs && curTs > prevTs))
          latestByMember.set(a.uid, t);
      }
    }

    return members.map((m) => {
      const t = latestByMember.get(m.uid) || null;
      const base = {
        key: m.uid,
        memberUid: m.uid,
        memberName: m.name,
        taskId: t?.id || null,
        methodology: t?.methodology || "null",
        phase: t?.phase || "null",
        type: t?.type || "null",
        task: t?.task || "null",
        created: t?.createdAt?.toDate?.()?.toLocaleDateString?.() || "null",
        due: t?.dueDate || "null",
        time: t?.dueTime || "null",
        revision: t ? t.revision || "No Revision" : "null",
        status: t ? t.status || "To Do" : "null",
        existingTask: t || null,
      };

      const opt = optimistic[m.uid];
      if (opt) {
        if (opt.methodology !== undefined) base.methodology = opt.methodology || "null";
        if (opt.phase !== undefined) base.phase = opt.phase || "null";
        if (opt.type !== undefined) base.type = opt.type || "null";
        if (opt.task !== undefined) base.task = opt.task || "null";
        if (opt.due !== undefined) base.due = opt.due || "null";
        if (opt.time !== undefined) base.time = opt.time || "null";
      }

      return base;
    });
  }, [members, tasks, optimistic]);

  /* Search + paging */
  const [qLocal, setQLocal] = useState("");
  useEffect(() => setQLocal(q.trim().toLowerCase()), [q]);

  const filtered = useMemo(() => {
    if (!qLocal) return rows;
    return rows.filter(
      (r) =>
        r.memberName.toLowerCase().includes(qLocal) ||
        r.methodology.toLowerCase().includes(qLocal) ||
        r.phase.toLowerCase().includes(qLocal) ||
        r.type.toLowerCase().includes(qLocal) ||
        r.task.toLowerCase().includes(qLocal) ||
        r.created.toLowerCase().includes(qLocal) ||
        r.due.toLowerCase().includes(qLocal) ||
        r.time.toLowerCase().includes(qLocal) ||
        String(r.revision).toLowerCase().includes(qLocal) ||
        String(r.status).toLowerCase().includes(qLocal)
    );
  }, [qLocal, rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* Helpers: upsert for a member (used by inline editors) */
  const upsertForMember = async (row, patch, optimisticPatch) => {
    setOptimistic((prev) => ({
      ...prev,
      [row.memberUid]: { ...(prev[row.memberUid] || {}), ...optimisticPatch },
    }));

    const base = {
      status: "To Do",
      revision: "No Revision",
      createdBy: pmProfile
        ? { uid: pmProfile.uid, name: pmProfile.name, role: "Project Manager" }
        : null,
      assignees: [{ uid: row.memberUid, name: row.memberName }],
      team: teams[0] ? { id: teams[0].id, name: teams[0].name } : null,
    };

    if (row.taskId) {
      await updateDoc(doc(db, TASKS_COLLECTION, row.taskId), {
        ...patch,
      });
    } else {
      await addDoc(collection(db, TASKS_COLLECTION), {
        ...base,
        ...patch,
        createdAt: serverTimestamp(),
      });
    }
  };

  /* Inline editors */
  const startEdit = (row, field) => {
    // Methodology → Phase → Type → Task → Due → Time
    if (field === "phase" && row.methodology === "null") return;
    if (field === "type" && (row.methodology === "null" || row.phase === "null")) return;
    if (field === "task" && row.type === "null") return;
    if (field === "due" && row.task === "null") return;
    if (field === "time" && row.due === "null") return;
    setEditingCell({ key: row.key, field });
  };
  const stopEdit = () => setEditingCell(null);

  const saveMethodology = async (row, newMethod) => {
    await upsertForMember(
      row,
      { methodology: newMethod || null, phase: null, type: null, task: null },
      { methodology: newMethod || "null", phase: "null", type: "null", task: "null" }
    );
    stopEdit();
  };

  const savePhase = async (row, newPhase) => {
    await upsertForMember(
      row,
      { phase: newPhase || null, type: null, task: null },
      { phase: newPhase || "null", type: "null", task: "null" }
    );
    stopEdit();
  };

  const saveType = async (row, newType) => {
    await upsertForMember(
      row,
      { type: newType || null, task: null },
      { type: newType || "null", task: "null" }
    );
    stopEdit();
  };

  const saveTask = async (row, newTask) => {
    await upsertForMember(
      row,
      { task: newTask || null },
      { task: newTask || "null" }
    );
    stopEdit();
  };

  const saveDue = async (row, newDate) => {
    const time = optimistic[row.memberUid]?.time ?? row.time;
    const hasTime = time && time !== "null";
    const dueAtMs = newDate && hasTime ? new Date(`${newDate}T${time}:00`).getTime() : null;

    await upsertForMember(
      row,
      { dueDate: newDate || null, dueAtMs },
      { due: newDate || "null", ...(newDate ? {} : { time: "null" }) }
    );
    stopEdit();
  };

  const saveTime = async (row, newTime) => {
    const due = optimistic[row.memberUid]?.due ?? row.due;
    const dueAtMs = due && due !== "null" && newTime ? new Date(`${due}T${newTime}:00`).getTime() : null;

    await upsertForMember(
      row,
      { dueTime: newTime || null, dueAtMs },
      { time: newTime || "null" }
    );
    stopEdit();
  };

  const deleteTask = async (taskId) => {
    setDeletingId(taskId);
    try {
      await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    } finally {
      setDeletingId(null);
    }
  };

  const openModalEditor = (row) => {
    setEditingModal({
      seedMember: { uid: row.memberUid, name: row.memberName },
      existingTask: row.taskId ? { ...row.existingTask, id: row.taskId } : null,
    });
  };

  return (
    <div className="space-y-4">
      {/* toolbar (no Create button) */}
      <div className="flex items-center justify-between gap-3 flex-nowrap">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100"
            title="Back to Tasks"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tasks
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
                placeholder="Search members or tasks"
                className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>
          </div>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
          title="Filter"
          onClick={() => alert("Open Filter panel")}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>
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
                      if (e.target.checked)
                        setSelected(new Set(pageRows.map((r) => r.key)));
                      else setSelected(new Set());
                    }}
                    checked={
                      pageRows.length > 0 &&
                      pageRows.every((r) => selected.has(r.key))
                    }
                  />
                </th>
                <th className="py-2 pr-3 w-16">NO</th>
                <th className="py-2 pr-3">Member</th>
                <th className="py-2 pr-3">Methodology</th>
                <th className="py-2 pr-3">Project Phase</th>
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
                <th className="py-2 pr-6 w-12 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageRows.map((r, idx) => {
                const isEditing = (field) =>
                  editingCell?.key === r.key && editingCell?.field === field;

                const phaseOptions =
                  r.methodology !== "null" ? PHASE_OPTIONS[r.methodology] || [] : [];
                const typeOptions =
                  r.methodology !== "null" ? ["Documentation", "Discussion & Review"] : [];
                const taskOptions =
                  r.methodology !== "null" && r.type !== "null"
                    ? TASK_SEEDS[r.methodology]?.[r.type] || []
                    : [];

                const canEditPhase = r.methodology !== "null";
                const canEditType = r.methodology !== "null" && r.phase !== "null";
                const canEditTask = r.type !== "null";
                const canEditDue = r.task !== "null";
                const canEditTime = r.due !== "null";

                return (
                  <tr key={r.key} className="border-t border-neutral-200">
                    <td className="py-2 pl-6 pr-3">
                      <input
                        type="checkbox"
                        checked={selected.has(r.key)}
                        onChange={() => {
                          const s = new Set(selected);
                          s.has(r.key) ? s.delete(r.key) : s.add(r.key);
                          setSelected(s);
                        }}
                      />
                    </td>
                    <td className="py-2 pr-3">{(page - 1) * pageSize + idx + 1}.</td>
                    <td className="py-2 pr-3">{r.memberName}</td>

                    {/* Methodology */}
                    <td className="py-2 pr-3" onDoubleClick={() => startEdit(r, "methodology")}>
                      {isEditing("methodology") ? (
                        <select
                          autoFocus
                          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          defaultValue={r.methodology === "null" ? "" : r.methodology}
                          onBlur={(e) => saveMethodology(r, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                            if (e.key === "Escape") stopEdit();
                          }}
                        >
                          <option value="">null</option>
                          {METHODOLOGIES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{r.methodology}</span>
                      )}
                    </td>

                    {/* Phase */}
                    <td
                      className={`py-2 pr-3 ${!canEditPhase ? "text-neutral-400 cursor-not-allowed" : ""}`}
                      onDoubleClick={() => canEditPhase && startEdit(r, "phase")}
                      title={!canEditPhase ? "Set Methodology first" : ""}
                    >
                      {isEditing("phase") ? (
                        <select
                          autoFocus
                          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          defaultValue={r.phase === "null" ? "" : r.phase}
                          onBlur={(e) => savePhase(r, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                            if (e.key === "Escape") stopEdit();
                          }}
                        >
                          <option value="">null</option>
                          {phaseOptions.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{r.phase}</span>
                      )}
                    </td>

                    {/* Task Type */}
                    <td
                      className={`py-2 pr-3 ${!canEditType ? "text-neutral-400 cursor-not-allowed" : ""}`}
                      onDoubleClick={() => canEditType && startEdit(r, "type")}
                      title={!canEditType ? "Set Methodology and Phase first" : ""}
                    >
                      {isEditing("type") ? (
                        <select
                          autoFocus
                          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          defaultValue={r.type === "null" ? "" : r.type}
                          onBlur={(e) => saveType(r, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                            if (e.key === "Escape") stopEdit();
                          }}
                        >
                          <option value="">null</option>
                          {typeOptions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{r.type}</span>
                      )}
                    </td>

                    {/* Task */}
                    <td
                      className={`py-2 pr-3 ${!canEditTask ? "text-neutral-400 cursor-not-allowed" : ""}`}
                      onDoubleClick={() => canEditTask && startEdit(r, "task")}
                      title={!canEditTask ? "Set Task Type first" : ""}
                    >
                      {isEditing("task") ? (
                        <select
                          autoFocus
                          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          defaultValue={r.task === "null" ? "" : r.task}
                          onBlur={(e) => saveTask(r, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                            if (e.key === "Escape") stopEdit();
                          }}
                        >
                          <option value="">null</option>
                          {taskOptions.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      ) : (
                        <span>{r.task}</span>
                      )}
                    </td>

                    {/* Date Created */}
                    <td className="py-2 pr-3">{r.created}</td>

                    {/* Due Date */}
                    <td
                      className={`py-2 pr-3 ${!canEditDue ? "text-neutral-400 cursor-not-allowed" : ""}`}
                      onDoubleClick={() => canEditDue && startEdit(r, "due")}
                      title={!canEditDue ? "Set Task first" : ""}
                    >
                      {isEditing("due") ? (
                        <input
                          type="date"
                          autoFocus
                          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          defaultValue={r.due === "null" ? "" : r.due}
                          onBlur={(e) => saveDue(r, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                            if (e.key === "Escape") stopEdit();
                          }}
                        />
                      ) : (
                        <span>{r.due}</span>
                      )}
                    </td>

                    {/* Time */}
                    <td
                      className={`py-2 pr-3 ${!canEditTime ? "text-neutral-400 cursor-not-allowed" : ""}`}
                      onDoubleClick={() => canEditTime && startEdit(r, "time")}
                      title={!canEditTime ? "Set Due Date first" : ""}
                    >
                      {isEditing("time") ? (
                        <input
                          type="time"
                          autoFocus
                          className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                          defaultValue={r.time === "null" ? "" : r.time}
                          onBlur={(e) => saveTime(r, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                            if (e.key === "Escape") stopEdit();
                          }}
                        />
                      ) : (
                        <span>{r.time}</span>
                      )}
                    </td>

                    <td className="py-2 pr-3">
                      <RevisionPill value={r.revision} />
                    </td>
                    <td className="py-2 pr-6">
                      <StatusBadge value={r.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-2 pr-6">
                      <div className="relative flex justify-center">
                        <button
                          className="p-1.5 rounded-md hover:bg-neutral-100"
                          onClick={() =>
                            setMenuOpenId(menuOpenId === r.key ? null : r.key)
                          }
                          aria-label="Row actions"
                        >
                          <MoreVertical className="w-4 h-4 text-neutral-600" />
                        </button>

                        {menuOpenId === r.key && (
                          <div className="absolute right-0 top-6 z-10 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg p-1">
                            <div className="flex flex-col">
                              <button
                                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-50"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  openModalEditor(r);
                                }}
                              >
                                Edit {r.taskId ? "" : "(create)"}
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-50"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  alert(
                                    r.taskId
                                      ? `Open detail: ${r.taskId}`
                                      : "No task yet"
                                  );
                                }}
                              >
                                View
                              </button>
                              <button
                                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-50 disabled:opacity-50"
                                disabled={!r.taskId || deletingId === r.taskId}
                                onClick={async () => {
                                  setMenuOpenId(null);
                                  if (!r.taskId) return;
                                  await deleteTask(r.taskId);
                                }}
                              >
                                {deletingId === r.taskId ? (
                                  <span className="inline-flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Deleting…
                                  </span>
                                ) : (
                                  "Delete"
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-10 text-center text-neutral-500">
                    No members found.
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

      {/* Modal editor */}
      <EditTaskDialog
        open={!!editingModal}
        onClose={() => setEditingModal(null)}
        onSaved={() => setEditingModal(null)}
        pm={pmProfile || { uid: pmUid, name: "Project Manager" }}
        teams={teams}
        members={members}
        seedMember={editingModal?.seedMember || null}
        existingTask={editingModal?.existingTask || null}
      />
    </div>
  );
};

export default OralDefense;
