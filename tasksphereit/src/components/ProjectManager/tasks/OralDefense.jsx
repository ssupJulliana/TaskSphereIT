// src/components/ProjectManager/tasks/OralDefense.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Trash2,
} from "lucide-react";

/* ===== Firebase ===== */
import { auth, db } from "../../../config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

/* ===== Supabase ===== */
import { supabase } from "../../../config/supabase";

const MAROON = "#6A0F14";
const TASKS_COLLECTION = "oralDefenseTasks";

/* ---------- small UI helpers (match FinalDefense look) ---------- */
const ModeSwitch = ({ mode, setMode }) => (
  <div className="inline-flex rounded-md border border-neutral-300 overflow-hidden">
    <button
      onClick={() => setMode("team")}
      className={`px-3 py-1.5 text-sm font-medium ${
        mode === "team" ? "text-white" : "text-neutral-700"
      }`}
      style={{ background: mode === "team" ? MAROON : "white" }}
    >
      Team
    </button>
    <button
      onClick={() => setMode("adviser")}
      className={`px-3 py-1.5 text-sm font-medium border-l border-neutral-300 ${
        mode === "adviser" ? "text-white" : "text-neutral-700"
      }`}
      style={{ background: mode === "adviser" ? MAROON : "white" }}
    >
      Adviser Tasks
    </button>
  </div>
);

const StatusBadge = ({ value, isEditable, onChange }) => {
  const statusColors = {
    "To Do": "bg-[#D9A81E] text-white",
    "To Review": "bg-[#6FA8DC] text-white",
    "In Progress": "bg-[#7C9C3B] text-white",
    Completed: "bg-[#6A0F14] text-white",
  };

  if (!value || value === "--") return <span>--</span>;

  return isEditable ? (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium border-none bg-white shadow-md cursor-pointer"
    >
      {Object.keys(statusColors).map((status) => (
        <option
          key={status}
          value={status}
          className={`${statusColors[status]}`}
        >
          {status}
        </option>
      ))}
    </select>
  ) : (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium ${
        statusColors[value] || "bg-neutral-200"
      }`}
    >
      {value}
    </span>
  );
};

const RevisionPill = ({ value }) =>
  value && value !== "--" ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-neutral-100 border border-neutral-200">
      {value}
    </span>
  ) : (
    <span>--</span>
  );

const RevisionSelect = ({ value, onChange, disabled }) => (
  <select
    className={`text-[12px] leading-tight font-medium border border-neutral-300 rounded-lg px-2.5 py-0.5 bg-white ${
      disabled ? "opacity-60 cursor-not-allowed" : ""
    }`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
  >
    <option>No Revision</option>
    <option>Revision 1</option>
    <option>Revision 2</option>
    <option>Revision 3</option>
  </select>
);

/* -------------------- CASCADING OPTIONS -------------------- */
const METHODOLOGIES = [
  "Agile",
  "Rapid Application Development (RAD)",
  "Spiral",
];

const PHASE_OPTIONS = {
  Agile: [
    "Analysis",
    "Design",
    "Implementation",
    "Development",
    "Testing",
    "Preparation",
  ],
  "Rapid Application Development (RAD)": [
    "Design",
    "Prototyping",
    "Review & Iterate",
    "Preparation",
  ],
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

/* ===== Supabase helpers for task files (any type) ===== */
const uploadTaskFileToSupabase = async (file, userId) => {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const fileName = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("user-tasks-files")
    .upload(fileName, file);
  if (upErr) throw new Error(upErr.message || "Upload failed");
  const {
    data: { publicUrl },
  } = supabase.storage.from("user-tasks-files").getPublicUrl(fileName);
  return {
    url: publicUrl,
    fileName,
    originalName: file.name,
    size: file.size,
    type: file.type,
  };
};

const deleteTaskFileFromSupabase = async (fileName) => {
  if (!fileName) return;
  const { error } = await supabase.storage
    .from("user-tasks-files")
    .remove([fileName]);
  if (error) throw new Error(error.message || "Delete failed");
};

/* ======= Edit/Create Task Dialog (FinalDefense header + accent) ======= */
function EditTaskDialog({
  open,
  onClose,
  onSaved,
  pm,
  teams = [],
  members = [],
  seedMember,
  existingTask,
  mode,
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

  // Attachments state
  const [attachedFiles, setAttachedFiles] = useState([]); // existing (from Firestore)
  const [newFiles, setNewFiles] = useState([]); // [{ id, file, name, isNew:true }]
  const [filesToDelete, setFilesToDelete] = useState([]); // subset of attachedFiles
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTeamId(existingTask?.team?.id || teams[0]?.id || "");
    if (existingTask) {
      setMethodology(existingTask.methodology || "");
      setPhase(existingTask.phase || "");
      setType(existingTask.type || "");
      setTask(existingTask.task || "");
      setDue(existingTask.dueDate || "");
      setTime(existingTask.dueTime || "");
      setAssignees(
        (existingTask.assignees || []).map((a) => ({
          uid: a.uid,
          name: a.name,
        }))
      );
      setComment(existingTask.comment || "");
      setAttachedFiles(existingTask.fileUrl || []);
      setNewFiles([]);
      setFilesToDelete([]);
    } else {
      setMethodology("");
      setPhase("");
      setType("");
      setTask("");
      setDue("");
      setTime("");
      setAssignees(
        seedMember ? [{ uid: seedMember.uid, name: seedMember.name }] : []
      );
      setComment("");
      setAttachedFiles([]);
      setNewFiles([]);
      setFilesToDelete([]);
    }
  }, [open, existingTask, seedMember, teams]);

  const availablePhases = useMemo(
    () => (methodology ? PHASE_OPTIONS[methodology] || [] : []),
    [methodology]
  );

  const canSave =
    teamId && methodology && phase && type && task && assignees.length > 0;

  const addAssignee = () => {
    if (!pickedUid) return;
    const found = members.find((m) => m.uid === pickedUid);
    if (!found) return;
    if (!assignees.some((a) => a.uid === pickedUid))
      setAssignees((arr) => [...arr, found]);
    setPickedUid("");
  };
  const removeAssignee = (uid) =>
    setAssignees((arr) => arr.filter((a) => a.uid !== uid));

  const handleAttachClick = () => fileInputRef.current?.click();
  const onFilePicked = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const objs = files.map((f) => ({
      id: Date.now() + Math.random(),
      file: f,
      name: f.name,
      isNew: true,
    }));
    setNewFiles((prev) => [...prev, ...objs]);
    e.target.value = "";
  };
  const removeNewFile = (id) =>
    setNewFiles((prev) => prev.filter((f) => f.id !== id));
  const removeExistingFile = (id) => {
    const f = attachedFiles.find((x) => x.id === id);
    if (!f) return;
    setFilesToDelete((prev) => [...prev, f]);
    setAttachedFiles((prev) => prev.filter((x) => x.id !== id));
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const team = teams.find((t) => t.id === teamId) || null;
      const taskManager = mode === "adviser" ? "Adviser" : "Project Manager";

      // upload/delete attachments
      const userId =
        auth.currentUser?.uid || localStorage.getItem("uid") || "anon";

      if (filesToDelete.length > 0) {
        // best-effort delete
        await Promise.allSettled(
          filesToDelete.map((f) => deleteTaskFileFromSupabase(f.fileName))
        );
      }

      let uploaded = [];
      if (newFiles.length > 0) {
        uploaded = await Promise.all(
          newFiles.map(async (nf) => {
            const up = await uploadTaskFileToSupabase(nf.file, userId);
            return {
              id: nf.id,
              name: up.originalName,
              fileName: up.fileName,
              url: up.url,
              uploadedAt: new Date().toISOString(),
              size: nf.file.size,
              type: nf.file.type,
            };
          })
        );
      }

      const finalFileUrl = [...attachedFiles, ...uploaded];

      const payload = {
        methodology,
        phase,
        type,
        task,
        fileUrl: finalFileUrl,
        dueDate: existingTask ? existingTask.dueDate ?? null : null,
        dueTime: existingTask ? existingTask.dueTime ?? null : null,
        dueAtMs: existingTask ? existingTask.dueAtMs ?? null : null,
        status: existingTask?.status || "To Do",
        revision: existingTask?.revision || "No Revision",
        assignees: assignees.map((a) => ({ uid: a.uid, name: a.name })),
        team: team ? { id: team.id, name: team.name } : null,
        comment: comment || "",
        createdBy: pm
          ? { uid: pm.uid, name: pm.name, role: "Project Manager" }
          : null,
        taskManager,
      };

      if (existingTask?.id) {
        await updateDoc(doc(db, TASKS_COLLECTION, existingTask.id), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, TASKS_COLLECTION), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
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
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="h-[2px] w-full" style={{ backgroundColor: MAROON }} />
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <div
              className="flex items-center gap-2 text-[16px] font-semibold"
              style={{ color: MAROON }}
            >
              <span>●</span>
              <span>{existingTask ? "Edit Task" : "Create Task"}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 px-5 pb-5 space-y-5 overflow-y-auto">
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              <b>Reminder:</b> Due Date and Time are{" "}
              <b>managed by the Adviser</b>.
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Team
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Methodology
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
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
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Project Phase
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  disabled={!methodology}
                >
                  <option value="">
                    {methodology ? "Select phase" : "Pick Methodology first"}
                  </option>
                  {(PHASE_OPTIONS[methodology] || []).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Task Type
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setTask("");
                  }}
                  disabled={!methodology}
                >
                  <option value="">
                    {methodology ? "Select" : "Pick Methodology first"}
                  </option>
                  {["Documentation", "Discussion & Review"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-4">
                <label className="block text sm font-medium text-neutral-700 mb-1">
                  Tasks
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  disabled={!type}
                >
                  <option value="">
                    {type ? "Select task" : "Pick Task Type first"}
                  </option>
                  {(TASK_SEEDS[methodology]?.[type] || []).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due/Time view-only for PM */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Due Date (Adviser-managed)
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-50 text-neutral-600"
                  value={due}
                  disabled
                  readOnly
                />
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Time (Adviser-managed)
                </label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-50 text-neutral-600"
                  value={time}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Assign Members
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={pickedUid}
                  onChange={(e) => setPickedUid(e.target.value)}
                >
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {m.name}
                    </option>
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
                  <span
                    key={a.uid}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 border border-neutral-200"
                  >
                    {a.name}
                    <button
                      className="p-0.5 hover:bg-neutral-200 rounded-full"
                      onClick={() => removeAssignee(a.uid)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Leave Comment:
              </label>
              <div className="rounded-xl border border-neutral-300 bg-white shadow-sm">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200">
                  <UserCircle2 className="w-5 h-5 text-neutral-600" />
                  <span className="text-sm font-semibold text-neutral-800">
                    {pm?.name || "Project Manager"}
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    rows={3}
                    className="w-full resize-none px-3 py-2 text-sm outline-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 bottom-2 p-1 rounded hover:bg-neutral-100"
                    title="Attach"
                    onClick={handleAttachClick}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    multiple
                    onChange={onFilePicked}
                  />
                </div>
              </div>
            </div>

            {/* Attachments list (no SweetAlert view) */}
            {(attachedFiles.length > 0 || newFiles.length > 0) && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Attachments ({attachedFiles.length + newFiles.length})
                </label>
                <div className="space-y-2">
                  {attachedFiles.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-neutral-200"
                    >
                      <div className="truncate text-sm">
                        <span className="font-medium">{f.name}</span>
                        {f.url ? (
                          <a
                            className="ml-2 text-xs text-[#6A0F14] underline"
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            open
                          </a>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="p-1 rounded-md hover:bg-neutral-200"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => removeExistingFile(f.id)}
                      >
                        <X className="w-4 h-4 text-neutral-600" />
                      </button>
                    </div>
                  ))}
                  {newFiles.map((nf) => (
                    <div
                      key={nf.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-neutral-200"
                    >
                      <div className="truncate text-sm">
                        <span className="font-medium">{nf.name}</span>
                        <span className="ml-2 text-xs text-blue-600">
                          (new)
                        </span>
                      </div>
                      <button
                        type="button"
                        className="p-1 rounded-md hover:bg-neutral-200"
                        aria-label={`Remove ${nf.name}`}
                        onClick={() => removeNewFile(nf.id)}
                      >
                        <X className="w-4 h-4 text-neutral-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!canSave || saving}
                className="px-4 py-2 rounded-md text-sm text-white shadow disabled:opacity-50"
                style={{ backgroundColor: MAROON }}
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </span>
                ) : existingTask ? (
                  "Save"
                ) : (
                  "Create"
                )}
              </button>
            </div>
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

  const [mode, setMode] = useState("team"); // "team" | "adviser"
  const isTeam = mode === "team";
  const canEdit = mode === "adviser" || isTeam;

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingModal, setEditingModal] = useState(null); // {seedMember, existingTask}
  const [deletingId, setDeletingId] = useState(null);

  const [editingCell, setEditingCell] = useState(null); // {key, field}
  const [optimistic, setOptimistic] = useState({});

  const pageSize = 10;

  const pmUid = auth.currentUser?.uid || localStorage.getItem("uid") || "";
  const [pmProfile, setPmProfile] = useState(null);

  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);

  const [tasks, setTasks] = useState([]);

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

  useEffect(() => {
    if (!pmUid) return;
    const qRef = query(
      collection(db, TASKS_COLLECTION),
      where("createdBy.uid", "==", pmUid)
    );
    const unsub = onSnapshot(qRef, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTs = a?.updatedAt?.toDate?.() ?? a?.createdAt?.toDate?.() ?? 0;
          const bTs = b?.updatedAt?.toDate?.() ?? b?.createdAt?.toDate?.() ?? 0;
          return bTs - aTs;
        });

      setTasks(list);
      setSelected(new Set());
      setPage(1);

      setOptimistic((prev) => {
        const next = { ...prev };
        const memberWithTask = new Set();
        for (const d of snap.docs) {
          const data = d.data();
          (data.assignees || []).forEach((a) => {
            if (a?.uid) memberWithTask.add(a.uid);
          });
        }
        for (const k of Object.keys(next)) {
          if (memberWithTask.has(k)) delete next[k];
        }
        return next;
      });
    });
    return () => unsub && unsub();
  }, [pmUid]);

  const rows = useMemo(() => {
    const out = [];
    const seenMemberUids = new Set();
    const teamTasks = tasks.filter((t) => t.taskManager === "Project Manager");

    for (const t of teamTasks) {
      const assignees =
        t.assignees && t.assignees.length
          ? t.assignees
          : [{ uid: "", name: "Team" }];
      assignees.forEach((a, idx) => {
        if (a.uid) seenMemberUids.add(a.uid);
        out.push({
          key: `${t.id}:${a.uid || idx}`,
          taskId: t.id,
          memberUid: a.uid || "",
          memberName: a.name || "Team",
          methodology: t?.methodology || "--",
          phase: t?.phase || "--",
          type: t?.type || "--",
          task: t?.task || "--",
          created: t?.createdAt?.toDate?.()?.toLocaleDateString?.() || "--",
          due: t?.dueDate || "--",
          time: t?.dueTime || "--",
          revision: t?.revision || "No Revision",
          status: t?.status || "To Do",
          existingTask: t,
          teamId: t?.team?.id || null,
          teamName: t?.team?.name || "No Team",
        });
      });
    }

    members.forEach((m, idx) => {
      if (!seenMemberUids.has(m.uid)) {
        out.push({
          key: `placeholder:${m.uid || idx}`,
          taskId: null,
          memberUid: m.uid,
          memberName: m.name,
          methodology: "--",
          phase: "--",
          type: "--",
          task: "--",
          created: "--",
          due: "--",
          time: "--",
          revision: "--",
          status: "--",
          existingTask: null,
          teamId: teams[0]?.id ?? null,
          teamName: teams[0]?.name ?? "No Team",
        });
      }
    });

    return out;
  }, [tasks, members, teams]);

  const adviserRows = useMemo(() => {
    const adviserTasks = tasks.filter((t) => t.taskManager === "Adviser");
    return adviserTasks.map((t, idx) => ({
      key: t.id,
      taskId: t.id,
      memberUid: "",
      memberName: "Team",
      methodology: t?.methodology || "--",
      phase: t?.phase || "--",
      type: t?.type || "--",
      task: t?.task || "--",
      created: t?.createdAt?.toDate?.()?.toLocaleDateString?.() || "--",
      due: t?.dueDate || "--",
      time: t?.dueTime || "--",
      revision: t?.revision || "No Revision",
      status: t?.status || "To Do",
      existingTask: t,
      teamId: t?.team?.id || `no-team-${idx}`,
      teamName: t?.team?.name || "No Team",
    }));
  }, [tasks]);

  const [qLocal, setQLocal] = useState("");
  useEffect(() => setQLocal(q.trim().toLowerCase()), [q]);

  const baseRows = isTeam ? rows : adviserRows;

  const filtered = useMemo(() => {
    if (!qLocal) return baseRows;
    return baseRows.filter(
      (r) =>
        (r.memberName || "").toLowerCase().includes(qLocal) ||
        (r.teamName || "").toLowerCase().includes(qLocal) ||
        (r.methodology || "").toLowerCase().includes(qLocal) ||
        (r.phase || "").toLowerCase().includes(qLocal) ||
        (r.type || "").toLowerCase().includes(qLocal) ||
        (r.task || "").toLowerCase().includes(qLocal) ||
        (r.created || "").toLowerCase().includes(qLocal) ||
        (r.due || "").toLowerCase().includes(qLocal) ||
        (r.time || "").toLowerCase().includes(qLocal) ||
        String(r.revision || "")
          .toLowerCase()
          .includes(qLocal) ||
        String(r.status || "")
          .toLowerCase()
          .includes(qLocal)
    );
  }, [qLocal, baseRows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const updateTaskRow = async (row, patch) => {
    if (row.taskId) {
      await updateDoc(doc(db, TASKS_COLLECTION, row.taskId), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    const base = {
      status: "To Do",
      revision: "No Revision",
      createdBy: pmProfile
        ? { uid: pmProfile.uid, name: pmProfile.name, role: "Project Manager" }
        : null,
      assignees: row.memberUid
        ? [{ uid: row.memberUid, name: row.memberName }]
        : [],
      team:
        row.teamId && row.teamName
          ? { id: row.teamId, name: row.teamName }
          : teams[0]
          ? { id: teams[0].id, name: teams[0].name }
          : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await addDoc(collection(db, TASKS_COLLECTION), { ...base, ...patch });
  };

  const startEdit = (row, field) => {
    if (!canEdit) return;
    const editingDueOrTime = field === "due" || field === "time";
    if (!isTeam && editingDueOrTime) return;

    if (!isTeam) {
      if (
        field === "phase" &&
        (row.methodology === "--" || row.methodology === "null")
      )
        return;
      if (
        field === "type" &&
        (row.methodology === "--" ||
          row.methodology === "null" ||
          row.phase === "--" ||
          row.phase === "null")
      )
        return;
      if (field === "task" && (row.type === "--" || row.type === "null"))
        return;
    }
    setEditingCell({ key: row.key, field });
  };
  const stopEdit = () => setEditingCell(null);

  const saveTask = async (row, newTask) => {
    await updateTaskRow(row, { task: newTask || null });
    stopEdit();
  };
  const saveStatus = async (row, newStatus) => {
    await updateTaskRow(row, { status: newStatus || "To Do" });
  };
  const saveDue = async (row, newDate) => {
    const hasTime = row.time && row.time !== "null";
    const dueAtMs =
      newDate && hasTime
        ? new Date(`${newDate}T${row.time}:00`).getTime()
        : null;
    await updateTaskRow(row, {
      dueDate: newDate || null,
      dueAtMs,
      ...(newDate ? {} : { dueTime: null }),
    });
    stopEdit();
  };
  const saveTime = async (row, newTime) => {
    const dueAtMs =
      row.due && row.due !== "null" && newTime
        ? new Date(`${row.due}T${newTime}:00`).getTime()
        : null;
    await updateTaskRow(row, { dueTime: newTime || null, dueAtMs });
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

  const deleteSelectedRows = async () => {
    if (!canEdit || selected.size === 0) return;
    const toDelete = pageRows
      .filter((r) => selected.has(r.key) && r.taskId)
      .map((r) => r.taskId);
    for (const id of toDelete) {
      await deleteTask(id);
    }
    setSelected(new Set());
  };

  const openModalEditor = (row) => {
    setEditingModal({
      seedMember: row.memberUid
        ? { uid: row.memberUid, name: row.memberName }
        : null,
      existingTask: row.taskId ? { ...row.existingTask, id: row.taskId } : null,
    });
  };
  const openModalCreate = (row) => {
    setEditingModal({
      seedMember: row?.memberUid
        ? { uid: row.memberUid, name: row.memberName }
        : null,
      existingTask: null,
    });
  };

  const handleCreateClick = () => {
    if (isTeam) {
      const selectedKey = Array.from(selected)[0] || null;
      let seedRow =
        (selectedKey && filtered.find((r) => r.key === selectedKey)) ||
        filtered.find((r) => r.memberUid);
      if (!seedRow) {
        alert("Select a member row first to create a task for.");
        return;
      }
      openModalCreate(seedRow);
    } else {
      openModalCreate(null);
    }
  };

  const adviserGroups = useMemo(() => {
    if (isTeam) return null;
    const groups = new Map();
    for (const r of pageRows) {
      const key = r.teamId || "no-team";
      if (!groups.has(key))
        groups.set(key, {
          teamId: key,
          teamName: r.teamName || "No Team",
          rows: [],
        });
      groups.get(key).rows.push(r);
    }
    return Array.from(groups.values());
  }, [isTeam, pageRows]);

  return (
    <div className="space-y-4">
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

          <ModeSwitch mode={mode} setMode={setMode} />

          <button
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow"
            style={{ background: MAROON }}
            onClick={handleCreateClick}
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
            onClick={deleteSelectedRows}
            disabled={!canEdit}
            className={`inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 ${
              !canEdit ? "opacity-60 cursor-not-allowed" : ""
            }`}
            title="Delete"
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

      <div className="bg-white border border-neutral-200 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] leading-tight whitespace-nowrap">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2 pl-6 pr-3 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (!canEdit) return;
                      if (e.target.checked)
                        setSelected(new Set(pageRows.map((r) => r.key)));
                      else setSelected(new Set());
                    }}
                    checked={
                      pageRows.length > 0 &&
                      pageRows.every((r) => selected.has(r.key))
                    }
                    disabled={!canEdit}
                  />
                </th>
                <th className="py-2 pr-3 w-16">NO</th>
                <th className="py-2 pr-3">{isTeam ? "Assigned" : "Team"}</th>
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
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-6 w-12 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {!isTeam &&
                (adviserGroups || []).map((g, gIdx) => (
                  <React.Fragment key={g.teamId || `group-${gIdx}`}>
                    <tr className="bg-neutral-50/60">
                      <td
                        colSpan={11}
                        className="py-2 pl-6 pr-3 text-[13px] font-semibold text-neutral-800"
                      >
                        Team: {g.teamName}
                      </td>
                    </tr>
                    {g.rows.map((r, idx) => {
                      const isEditing = (field) =>
                        editingCell?.key === r.key &&
                        editingCell?.field === field;

                      const typeOptions =
                        r.methodology !== "--" && r.methodology !== "null"
                          ? ["Documentation", "Discussion & Review"]
                          : [];
                      const taskOptions =
                        r.methodology !== "--" &&
                        r.methodology !== "null" &&
                        r.type !== "--" &&
                        r.type !== "null"
                          ? TASK_SEEDS[r.methodology]?.[r.type] || []
                          : [];

                      const canEditType =
                        canEdit &&
                        (isTeam ||
                          (r.methodology !== "--" &&
                            r.methodology !== "null" &&
                            r.phase !== "--" &&
                            r.phase !== "null"));
                      const canEditTask =
                        canEdit &&
                        (isTeam || (r.type !== "--" && r.type !== "null"));

                      return (
                        <tr key={r.key} className="border-t border-neutral-200">
                          <td className="py-2 pl-6 pr-3">
                            <input
                              type="checkbox"
                              checked={selected.has(r.key)}
                              onChange={() => {
                                if (!canEdit) return;
                                const s = new Set(selected);
                                s.has(r.key) ? s.delete(r.key) : s.add(r.key);
                                setSelected(s);
                              }}
                              disabled={!canEdit}
                            />
                          </td>
                          <td className="py-2 pr-3">
                            {(page - 1) * pageSize +
                              (gIdx === 0 ? idx + 1 : idx + 1)}
                            .
                          </td>
                          <td className="py-2 pr-3">{g.teamName}</td>

                          <td
                            className={`py-2 pr-3 ${
                              !canEditType
                                ? "text-neutral-400 cursor-not-allowed"
                                : ""
                            }`}
                            onDoubleClick={() =>
                              canEditType &&
                              setEditingCell({ key: r.key, field: "type" })
                            }
                            title={
                              !canEditType
                                ? "Set Methodology and Phase first"
                                : ""
                            }
                          >
                            {isEditing("type") ? (
                              <select
                                autoFocus
                                className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                                defaultValue={
                                  r.type === "--" || r.type === "null"
                                    ? ""
                                    : r.type
                                }
                                onBlur={(e) => {
                                  updateTaskRow(r, {
                                    type: e.target.value || null,
                                    task: null,
                                  });
                                  stopEdit();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") e.currentTarget.blur();
                                  if (e.key === "Escape") stopEdit();
                                }}
                              >
                                <option value="">null</option>
                                {typeOptions.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span>{r.type}</span>
                            )}
                          </td>

                          <td
                            className={`py-2 pr-3 ${
                              !canEditTask
                                ? "text-neutral-400 cursor-not-allowed"
                                : ""
                            }`}
                            onDoubleClick={() =>
                              canEditTask &&
                              setEditingCell({ key: r.key, field: "task" })
                            }
                            title={!canEditTask ? "Set Task Type first" : ""}
                          >
                            {isEditing("task") ? (
                              <select
                                autoFocus
                                className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                                defaultValue={r.task === "null" ? "" : r.task}
                                onBlur={(e) => {
                                  saveTask(r, e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") e.currentTarget.blur();
                                  if (e.key === "Escape") stopEdit();
                                }}
                              >
                                <option value="">null</option>
                                {taskOptions.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span>{r.task}</span>
                            )}
                          </td>

                          <td className="py-2 pr-3">{r.created}</td>
                          <td className="py-2 pr-3" title="Managed by Adviser">
                            <span className="text-neutral-700">{r.due}</span>
                          </td>
                          <td className="py-2 pr-3" title="Managed by Adviser">
                            <span className="text-neutral-700">{r.time}</span>
                          </td>

                          <td className="py-2 pr-3">
                            <RevisionSelect
                              value={r.revision}
                              onChange={() => {}}
                              disabled
                            />
                          </td>

                          <td className="py-2 pr-3">
                            <StatusBadge value={r.status} />
                          </td>

                          <td className="py-2 pr-6">
                            <div className="relative flex justify-center">
                              <button
                                className="p-1.5 rounded-md hover:bg-neutral-100"
                                onClick={() =>
                                  setMenuOpenId(
                                    menuOpenId === r.key ? null : r.key
                                  )
                                }
                                aria-label="Row actions"
                              >
                                <MoreVertical className="w-4 h-4 text-neutral-600" />
                              </button>

                              {menuOpenId === r.key && (
                                <div className="absolute right-0 top-6 z-10 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg p-1">
                                  <div className="flex flex-col">
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-50"
                                      onClick={() => {
                                        setMenuOpenId(null);
                                        openModalEditor(r);
                                      }}
                                    >
                                      Edit task
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-50"
                                      onClick={() => {
                                        setMenuOpenId(null);
                                        openModalCreate(r);
                                      }}
                                    >
                                      Create new task
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
                                      disabled={
                                        !r.taskId || deletingId === r.taskId
                                      }
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
                                        "Delete task"
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
                  </React.Fragment>
                ))}

              {isTeam &&
                pageRows.map((r, idx) => {
                  const isEditing = (field) =>
                    editingCell?.key === r.key && editingCell?.field === field;

                  const typeOptions =
                    r.methodology !== "null"
                      ? ["Documentation", "Discussion & Review"]
                      : [];
                  const taskOptions =
                    r.methodology !== "null" && r.type !== "null"
                      ? TASK_SEEDS[r.methodology]?.[r.type] || []
                      : [];

                  const canEditType =
                    canEdit &&
                    (isTeam ||
                      (r.methodology !== "null" && r.phase !== "null"));
                  const canEditTask = canEdit && (isTeam || r.type !== "null");

                  return (
                    <tr key={r.key} className="border-t border-neutral-200">
                      <td className="py-2 pl-6 pr-3">
                        <input
                          type="checkbox"
                          checked={selected.has(r.key)}
                          onChange={() => {
                            if (!canEdit) return;
                            const s = new Set(selected);
                            s.has(r.key) ? s.delete(r.key) : s.add(r.key);
                            setSelected(s);
                          }}
                          disabled={!canEdit}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        {(page - 1) * pageSize + idx + 1}.
                      </td>
                      <td className="py-2 pr-3">{r.memberName}</td>

                      <td
                        className={`py-2 pr-3 ${
                          !canEditType
                            ? "text-neutral-400 cursor-not-allowed"
                            : ""
                        }`}
                        onDoubleClick={() =>
                          canEditType &&
                          setEditingCell({ key: r.key, field: "type" })
                        }
                        title={
                          !canEditType ? "Set Methodology and Phase first" : ""
                        }
                      >
                        {isEditing("type") ? (
                          <select
                            autoFocus
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            defaultValue={
                              r.type === "--" || r.type === "null" ? "" : r.type
                            }
                            onBlur={(e) => {
                              updateTaskRow(r, {
                                type: e.target.value || null,
                                task: null,
                              });
                              stopEdit();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                          >
                            <option value="">null</option>
                            {typeOptions.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{r.type}</span>
                        )}
                      </td>

                      <td
                        className={`py-2 pr-3 ${
                          !canEditTask
                            ? "text-neutral-400 cursor-not-allowed"
                            : ""
                        }`}
                        onDoubleClick={() =>
                          canEditTask &&
                          setEditingCell({ key: r.key, field: "task" })
                        }
                        title={!canEditTask ? "Set Task Type first" : ""}
                      >
                        {isEditing("task") ? (
                          <select
                            autoFocus
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            defaultValue={r.task === "null" ? "" : r.task}
                            onBlur={(e) => {
                              saveTask(r, e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                          >
                            <option value="">null</option>
                            {taskOptions.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{r.task}</span>
                        )}
                      </td>

                      <td className="py-2 pr-3">{r.created}</td>

                      <td
                        className="py-2 pr-3"
                        onDoubleClick={() =>
                          isTeam && setEditingCell({ key: r.key, field: "due" })
                        }
                        title={
                          isTeam ? "Double-click to edit" : "Managed by Adviser"
                        }
                      >
                        {isEditing("due") ? (
                          <input
                            autoFocus
                            type="date"
                            defaultValue={r.due === "null" ? "" : r.due}
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            onBlur={(e) => saveDue(r, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                          />
                        ) : (
                          <span
                            className={`${
                              isTeam ? "cursor-text" : "text-neutral-700"
                            }`}
                          >
                            {r.due}
                          </span>
                        )}
                      </td>

                      <td
                        className="py-2 pr-3"
                        onDoubleClick={() =>
                          isTeam &&
                          setEditingCell({ key: r.key, field: "time" })
                        }
                        title={
                          isTeam ? "Double-click to edit" : "Managed by Adviser"
                        }
                      >
                        {isEditing("time") ? (
                          <input
                            autoFocus
                            type="time"
                            defaultValue={r.time === "null" ? "" : r.time}
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            onBlur={(e) => saveTime(r, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                          />
                        ) : (
                          <span
                            className={`${
                              isTeam ? "cursor-text" : "text-neutral-700"
                            }`}
                          >
                            {r.time}
                          </span>
                        )}
                      </td>

                      <td className="py-2 pr-3">
                        <RevisionSelect
                          value={r.revision}
                          onChange={() => {}}
                          disabled
                        />
                      </td>

                      <td className="py-2 pr-3">
                        {isTeam ? (
                          <select
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            defaultValue={r.status}
                            onChange={(e) => saveStatus(r, e.target.value)}
                          >
                            {[
                              "To Do",
                              "In Progress",
                              "To Review",
                              "Completed",
                            ].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge value={r.status} />
                        )}
                      </td>

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
                            <div className="absolute right-0 top-6 z-10 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg p-1">
                              <div className="flex flex-col">
                                <button
                                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-50"
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    openModalEditor(r);
                                  }}
                                >
                                  {r.taskId ? "Edit task" : "Create task"}
                                </button>
                                {r.taskId && (
                                  <button
                                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-neutral-50"
                                    onClick={() => {
                                      setMenuOpenId(null);
                                      openModalCreate(r);
                                    }}
                                  >
                                    Create new task
                                  </button>
                                )}
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
                                  disabled={
                                    !r.taskId || deletingId === r.taskId
                                  }
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
                                    "Delete task"
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
                  <td
                    colSpan={11}
                    className="py-10 text-center text-neutral-500"
                  >
                    No {isTeam ? "members" : "tasks"} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

      <EditTaskDialog
        open={!!editingModal}
        onClose={() => setEditingModal(null)}
        onSaved={() => setEditingModal(null)}
        pm={pmProfile || { uid: pmUid, name: "Project Manager" }}
        teams={teams}
        members={members}
        seedMember={editingModal?.seedMember || null}
        existingTask={editingModal?.existingTask || null}
        mode={mode}
      />
    </div>
  );
};

export default OralDefense;
