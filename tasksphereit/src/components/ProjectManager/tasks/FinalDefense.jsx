// src/components/ProjectManager/tasks/FinalDefense.jsx
import React, { useMemo, useState } from "react";
import {
  Search,
  Trash2,
  SlidersHorizontal,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCircle2,
  Paperclip,
  X,
} from "lucide-react";

const MAROON = "#6A0F14";

/* ======= SAMPLE DATA (Final Defense) ======= */
/* Note: methodology shown in table, but NOT chosen in dialog (carried from Oral). */
const RAW_ROWS = [
  { no: 1, assigned: "Alejandro F",   type: "Documentation",       task: "Chapter 4", subtask: "Testing",        element: "Hardware",   created: "Feb 20, 2025",  due: "Feb 24, 2025", time: "8:00 AM",  revision: "No Revision", status: "To Review",  methodology: "Agile",      phase: "Implementation" },
  { no: 2, assigned: "Harzwel Zhen L",type: "Documentation",       task: "Chapter 4", subtask: "Testing",        element: "Software",   created: "Feb 21, 2025",  due: "Feb 25, 2025", time: "9:00 AM",  revision: "No Revision", status: "To Review",  methodology: "Agile",      phase: "Implementation" },
  { no: 3, assigned: "Julliana C",    type: "Documentation",       task: "Chapter 4", subtask: "Testing",        element: "Peopleware", created: "Feb 19, 2025",  due: "Feb 22, 2025", time: "8:30 AM",  revision: "No Revision", status: "In Progress", methodology: "Waterfall",  phase: "Implementation" },
  { no: 4, assigned: "John Reagan S", type: "Discussion & Review", task: "Polish",    subtask: "Integration",    element: "Hardware",   created: "Feb 22, 2025",  due: "Feb 26, 2025", time: "11:50 AM", revision: "No Revision", status: "In Progress", methodology: "Waterfall",  phase: "Implementation" },
  { no: 5, assigned: "Justine P",     type: "Discussion & Review", task: "Polish",    subtask: "Integration",    element: "Software",   created: "Feb 24, 2025",  due: "Feb 27, 2025", time: "10:00 AM", revision: "No Revision", status: "To Do",       methodology: "Hybrid",     phase: "Implementation" },
  { no: 6, assigned: "Addrialene G",  type: "Discussion & Review", task: "Polish",    subtask: "Integration",    element: "Peopleware", created: "Feb 25, 2025",  due: "Feb 28, 2025", time: "11:00 AM", revision: "No Revision", status: "To Do",       methodology: "Hybrid",     phase: "Implementation" },
];

/* ======= Small bits ======= */
const RevisionSelect = ({ value, onChange, disabled }) => (
  <select
    className={`text-[12px] leading-tight font-medium border border-neutral-300 rounded-lg px-2.5 py-0.5 bg-white ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
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

const StatusBadge = ({ value }) => {
  const map = {
    "To Review": "bg-[#6FA8DC] text-white",
    "In Progress": "bg-[#7C9C3B] text-white",
    "To Do": "bg-[#D9A81E] text-white",
  };
  return (
    <span className={`inline-flex items-center whitespace-nowrap leading-tight px-2.5 py-0.5 rounded-full text-[12px] font-medium ${map[value] || "bg-neutral-200 text-neutral-800"}`}>
      {value}
    </span>
  );
};

const ModeSwitch = ({ mode, setMode }) => (
  <div className="inline-flex rounded-md border border-neutral-300 overflow-hidden">
    <button
      onClick={() => setMode("team")}
      className={`px-3 py-1.5 text-sm font-medium ${mode === "team" ? "text-white" : "text-neutral-700"}`}
      style={{ background: mode === "team" ? MAROON : "white" }}
    >
      Team
    </button>
    <button
      onClick={() => setMode("adviser")}
      className={`px-3 py-1.5 text-sm font-medium border-l border-neutral-300 ${mode === "adviser" ? "text-white" : "text-neutral-700"}`}
      style={{ background: mode === "adviser" ? MAROON : "white" }}
    >
      Adviser Tasks
    </button>
  </div>
);

/* ======= Create Task Dialog (NO methodology field) ======= */
const L = ({ children }) => (
  <label className="block text-sm font-medium text-neutral-700 mb-1">{children}</label>
);

const Select = ({ children, ...rest }) => (
  <div className="relative">
    <select
      {...rest}
      className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-9 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
    >
      {children}
    </select>
    <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-neutral-500 pointer-events-none" />
  </div>
);

function CreateTaskDialog({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    phase: "Implementation",
    type: "",
    task: "",
    subtask: "",
    elements: "",
    due: "2025-02-27",
    time: "08:00",
    assigned: "",
    teams: ["Aguas, Et Al"],
    comment: "Kindly align with approved scope from Oral Defense.",
  });

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 mx-auto mt-10 w-[980px] max-w-[95vw]">
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
          <div className="h-[2px] w-full" style={{ backgroundColor: MAROON }} />
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <div className="flex items-center gap-2 text-[16px] font-semibold" style={{ color: MAROON }}>
              <span>●</span>
              <span>Create Task</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 pb-5 space-y-4">
            {/* Info note: methodology is inherited */}
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              Methodology is inherited from the team’s <b>Oral Defense</b> and cannot be changed here.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <L>Project Phase</L>
                <input
                  value={form.phase}
                  onChange={handle("phase")}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>

              <div>
                <L>Tasks Type</L>
                <input
                  value={form.type}
                  onChange={handle("type")}
                  placeholder="e.g., Documentation"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>

              <div>
                <L>Tasks</L>
                <input
                  value={form.task}
                  onChange={handle("task")}
                  placeholder="e.g., Chapter 4"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>

              <div>
                <L>Subtasks</L>
                <input
                  value={form.subtask}
                  onChange={handle("subtask")}
                  placeholder="e.g., Testing"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>

              <div>
                <L>Elements</L>
                <input
                  value={form.elements}
                  onChange={handle("elements")}
                  placeholder="e.g., Hardware"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>

              <div>
                <L>Due Date *</L>
                <input
                  type="date"
                  value={form.due}
                  onChange={handle("due")}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>

              <div>
                <L>Time</L>
                <input
                  type="time"
                  value={form.time}
                  onChange={handle("time")}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>

              <div>
                <L>Assigned</L>
                <Select value={form.assigned} onChange={handle("assigned")}>
                  <option value="">Select assignee</option>
                  <option>Alejandro F</option>
                  <option>Harzwel Zhen L</option>
                  <option>Julliana C</option>
                  <option>Justine P</option>
                </Select>
              </div>

              <div>
                <L>Team</L>
                <Select
                  value={form.teams[0] ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, teams: [e.target.value, f.teams[1]].filter(Boolean) }))
                  }
                >
                  <option value="">Select team</option>
                  <option>Aguas, Et Al</option>
                  <option>Mendoza, Et Al</option>
                  <option>Bernardo, Et Al</option>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.teams.map((t, i) => (
                    <span
                      key={t + i}
                      className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-neutral-300"
                    >
                      <UserCircle2 className="w-4 h-4" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <L>Leave Comment:</L>
                <div className="rounded-lg border border-neutral-300">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200 text-sm">
                    <UserCircle2 className="w-4 h-4" />
                    <span className="font-medium">Addrialene G. Mendoza</span>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={form.comment}
                      onChange={handle("comment")}
                      className="w-full resize-none px-3 py-2 text-sm outline-none"
                    />
                    <button type="button" className="absolute right-2 bottom-2 p-1 rounded hover:bg-neutral-100">
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="px-4 py-2 rounded-md border border-neutral-300 text-sm hover:bg-neutral-100">
                Cancel
              </button>
              <button
                onClick={() => {
                  onCreate?.(form);
                  onClose();
                }}
                className="px-4 py-2 rounded-md text-sm text-white"
                style={{ backgroundColor: MAROON }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======= Main ======= */
function FinalDefense({ onBack, oralApproved = false, defaultMethodology = "— same as Oral —" }) {
  const [mode, setMode] = useState("team"); // "team" | "adviser"
  const canEdit = mode === "adviser";

  const [q, setQ] = useState("");
  const [rows, setRows] = useState(RAW_ROWS);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const pageSize = 8;

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(
      (r) =>
        String(r.no).includes(s) ||
        r.assigned.toLowerCase().includes(s) ||
        r.type.toLowerCase().includes(s) ||
        r.task.toLowerCase().includes(s) ||
        r.subtask.toLowerCase().includes(s) ||
        r.element.toLowerCase().includes(s) ||
        r.created.toLowerCase().includes(s) ||
        r.due.toLowerCase().includes(s) ||
        r.time.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r.methodology.toLowerCase().includes(s) ||
        r.phase.toLowerCase().includes(s)
    );
  }, [q, rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (no) => {
    const s = new Set(selected);
    s.has(no) ? s.delete(no) : s.add(no);
    setSelected(s);
  };

  const deleteSelected = () => {
    if (!canEdit || selected.size === 0) return;
    setRows((prev) => prev.filter((r) => !selected.has(r.no)));
    setSelected(new Set());
    setPage(1);
  };

  const addFromDialog = (form) => {
    // When creating in Final Defense, methodology is auto-carried from Oral.
    setRows((prev) => [
      ...prev,
      {
        no: prev.length ? Math.max(...prev.map((r) => r.no)) + 1 : 1,
        assigned: form.assigned || "Team",
        type: form.type || "Documentation",
        task: form.task || "—",
        subtask: form.subtask || "—",
        element: form.elements || "—",
        created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        due: new Date(form.due).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: form.time ? (Number(form.time.slice(0,2)) % 12 || 12) + ":" + form.time.slice(3) + (Number(form.time.slice(0,2)) >= 12 ? " PM" : " AM") : "—",
        revision: "No Revision",
        status: "To Review",
        methodology: defaultMethodology,
        phase: form.phase || "Implementation",
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Back */}
      <div>
        <button
          onClick={() => (typeof onBack === "function" ? onBack() : window.history.back())}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100 cursor-pointer"
          title="Back to Tasks"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tasks
        </button>
      </div>

      {/* Gate + header */}
      {!oralApproved && (
        <div className="rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-[13px] text-neutral-700">
          Final Defense tasks are enabled only when the team’s <b>Oral Defense</b> verdict is <b>Approved</b>.
        </div>
      )}

      {/* toolbar */}
      <div className="flex items-center justify-between gap-3 flex-nowrap">
        <div className="flex items-center gap-3">
          <ModeSwitch mode={mode} setMode={setMode} />

          <button
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow ${!oralApproved ? "opacity-60 cursor-not-allowed" : ""}`}
            style={{ background: MAROON }}
            disabled={!oralApproved}
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
            disabled={!canEdit}
            className={`inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 ${!canEdit ? "opacity-60 cursor-not-allowed" : ""}`}
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

      {/* table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] leading-tight">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2 pl-6 pr-3 w-10 whitespace-nowrap">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(pageRows.map((r) => r.no)));
                      else setSelected(new Set());
                    }}
                    checked={pageRows.every((r) => selected.has(r.no)) && pageRows.length > 0}
                    disabled={!canEdit}
                  />
                </th>
                <th className="py-2 pr-3 w-16 whitespace-nowrap">NO</th>
                <th className="py-2 pr-3 whitespace-nowrap">Assigned</th>
                <th className="py-2 pr-3 whitespace-nowrap">Task Type</th>
                <th className="py-2 pr-3 whitespace-nowrap">Task</th>
                <th className="py-2 pr-3 whitespace-nowrap">Subtask</th>
                <th className="py-2 pr-3 whitespace-nowrap">Element</th>
                <th className="py-2 pr-3 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 whitespace-nowrap">
                    <CalendarDays className="w-4 h-4" /> Date Created
                  </div>
                </th>
                <th className="py-2 pr-3 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 whitespace-nowrap">
                    <CalendarDays className="w-4 h-4" /> Due Date
                  </div>
                </th>
                <th className="py-2 pr-3 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 whitespace-nowrap">
                    <Clock className="w-4 h-4" /> Time
                  </div>
                </th>
                <th className="py-2 pr-3 whitespace-nowrap">Revision NO</th>
                <th className="py-2 pr-3 whitespace-nowrap">Status</th>
                <th className="py-2 pr-3 whitespace-nowrap">Methodology</th>
                <th className="py-2 pr-6 whitespace-nowrap">Project Phase</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.no} className="border-t border-neutral-200">
                  <td className="py-2 pl-6 pr-3">
                    <input
                      type="checkbox"
                      checked={selected.has(r.no)}
                      onChange={() => toggleSelect(r.no)}
                      disabled={!canEdit}
                    />
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.no}.</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.assigned}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.type}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.task}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.subtask}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.element}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.created}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.due}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.time}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <RevisionSelect
                      value={r.revision}
                      disabled={!canEdit}
                      onChange={(v) =>
                        setRows((prev) =>
                          prev.map((x) => (x.no === r.no ? { ...x, revision: v } : x))
                        )
                      }
                    />
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <StatusBadge value={r.status} />
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.methodology}</td>
                  <td className="py-2 pr-6 whitespace-nowrap">{r.phase}</td>
                </tr>
              ))}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-neutral-500">
                    No results.
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

      {/* dialog mount */}
      <CreateTaskDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={addFromDialog}
      />
    </div>
  );
}

export default FinalDefense;
