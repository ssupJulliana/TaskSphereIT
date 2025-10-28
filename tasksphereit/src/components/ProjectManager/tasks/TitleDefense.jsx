// src/components/ProjectManager/tasks/TitleDefense.jsx
import React, { useMemo, useState } from "react";
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

const MAROON = "#6A0F14";

/* ----------------------------- SAMPLE DATA ----------------------------- */
const RAW_ROWS = [
  { no: 1, assigned: "Team", type: "Documentation", phase: "Planning", task: "Brainstorming", created: "Dec 10, 2025", due: "Dec 12, 2025", time: "8:00 AM", revision: "No Revision", status: "To Review" },
  { no: 2, assigned: "Team", type: "Documentation", phase: "Planning", task: "Data Gathering: Internet Research", created: "Dec 21, 2025", due: "Dec 25, 2025", time: "12:00 PM", revision: "No Revision", status: "To Review" },
  { no: 3, assigned: "Team", type: "Documentation", phase: "Planning", task: "Title Proposal: Concepts & Layout", created: "Jan 3, 2025", due: "Jan 8, 2025", time: "9:00 AM", revision: "No Revision", status: "In Progress" },
  { no: 4, assigned: "Team", type: "Discussion & Review", phase: "Planning", task: "Title Defense: Mock Defense", created: "Jan 9, 2025", due: "Jan 10, 2025", time: "8:00 AM", revision: "No Revision", status: "In Progress" },
  { no: 5, assigned: "Team", type: "Discussion & Review", phase: "Planning", task: "Title Defense", created: "Jan 11, 2025", due: "Jan 11, 2025", time: "10:00 AM", revision: "No Revision", status: "To Do" },
  { no: 6, assigned: "Team", type: "Discussion & Review", phase: "Planning", task: "Re-Defense: Title Gathering", created: "Jan 13, 2025", due: "Jan 13, 2025", time: "12:30 PM", revision: "No Revision", status: "To Do" },
  { no: 7, assigned: "Team", type: "Discussion & Review", phase: "Planning", task: "Re-Defense: Refining the Selected Title", created: "Jan 14, 2025", due: "Jan 15, 2025", time: "7:00 AM", revision: "No Revision", status: "To Do" },
  { no: 8, assigned: "Team", type: "Discussion & Review", phase: "Planning", task: "Re-Defense: Re-Defense Presentation", created: "Jan 22, 2025", due: "Jan 22, 2025", time: "9:30 AM", revision: "No Revision", status: "To Do" },
];

/* ------------------------------- HELPERS -------------------------------- */
const StatusBadge = ({ value }) => {
  const map = {
    "To Review": "bg-[#6FA8DC] text-white",
    "In Progress": "bg-[#7C9C3B] text-white",
    "To Do": "bg-[#D9A81E] text-white",
  };
  return (
    <span
      className={
        `inline-flex items-center whitespace-nowrap leading-tight 
         px-2.5 py-0.5 rounded-full text-[12px] font-medium ${map[value] || ""}`
      }
    >
      {value}
    </span>
  );
};

const RevisionSelect = ({ value, onChange }) => {
  return (
    <select
      className="text-xs font-medium border border-neutral-300 rounded-lg px-3 py-1 bg-white"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option>No Revision</option>
      <option>Revision 1</option>
      <option>Revision 2</option>
      <option>Revision 3</option>
    </select>
  );
};

/* ------------------------------ CREATE MODAL ----------------------------- */
function CreateTaskDialog({ open, onClose, onCreate }) {
  const [phase, setPhase] = useState("Planning");
  const [type, setType] = useState("");
  const [task, setTask] = useState("");
  const [due, setDue] = useState("2025-02-15");
  const [time, setTime] = useState("08:00");
  const [assigned, setAssigned] = useState("");
  const [team, setTeam] = useState("Harzwel B. Lacson");
  const [comment, setComment] = useState("Make sure your diagrams are aligned with your scope.");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* dialog */}
      <div className="relative z-10 mx-auto mt-10 w-[900px] max-w-[95vw]">
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200">
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-2 text-[16px] font-semibold" style={{ color: MAROON }}>
              <PlusCircle className="w-5 h-5" />
              <span>Create Task</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 h-[2px] w-full" style={{ backgroundColor: MAROON }} />

          {/* body */}
          <div className="p-5 space-y-5">
            {/* row 1 */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Project Phase</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                >
                  <option>Planning</option>
                  <option>Research</option>
                  <option>Implementation</option>
                  <option>Testing</option>
                  <option>Presentation</option>
                </select>
              </div>

              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tasks Type</label>
                <input
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g., Documentation"
                />
              </div>

              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tasks</label>
                <input
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="e.g., Draft Chapter 1"
                />
              </div>
            </div>

            {/* row 2 */}
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

              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Assigned</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={assigned}
                  onChange={(e) => setAssigned(e.target.value)}
                >
                  <option value="">Select assignee</option>
                  <option>Addrialene M.</option>
                  <option>Harzwel L.</option>
                  <option>Alejandro F.</option>
                  <option>Julliana C.</option>
                </select>
              </div>
            </div>

            {/* row 3 */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Team</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                >
                  <option>Harzwel B. Lacson</option>
                  <option>Mendoza, Et Al</option>
                  <option>Bernardo, Et Al</option>
                  <option>Aguas, Et Al</option>
                </select>
              </div>
            </div>

            {/* comment box */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Leave Comment:
              </label>

              <div className="rounded-xl border border-neutral-300 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <UserCircle2 className="w-5 h-5 text-neutral-600" />
                  <span className="text-sm font-semibold text-neutral-800">Addrialene G. Mendoza</span>
                </div>
                <textarea
                  rows={3}
                  className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="mt-2 flex items-center justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-800"
                    title="Attach"
                  >
                    <Paperclip className="w-4 h-4" />
                    Attach
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
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onCreate?.({ phase, type, task, due, time, assigned, team, comment });
                onClose();
              }}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow"
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

/* --------------------------------- MAIN --------------------------------- */
const TitleDefense = ({ onBack }) => {
  const handleBack = () => {
    if (typeof onBack === "function") onBack();
    else window.history.back();
  };

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
        r.type.toLowerCase().includes(s) ||            // ⬅️ include Task Type
        r.task.toLowerCase().includes(s) ||
        r.created.toLowerCase().includes(s) ||
        r.due.toLowerCase().includes(s) ||
        r.time.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r.phase.toLowerCase().includes(s)              // ⬅️ include Project Phase
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
    if (selected.size === 0) return;
    setRows((prev) => prev.filter((r) => !selected.has(r.no)));
    setSelected(new Set());
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* toolbar: Back + Create + Search (left) | Delete + Filter (right) */}
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

          {/* search sits BESIDE the create button */}
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
                        setSelected(new Set(pageRows.map((r) => r.no)));
                      } else setSelected(new Set());
                    }}
                    checked={pageRows.every((r) => selected.has(r.no)) && pageRows.length > 0}
                  />
                </th>
                <th className="py-2 pr-3 w-16">NO</th>
                <th className="py-2 pr-3">Assigned</th>
                {/* added */}
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
                {/* added */}
                <th className="py-2 pr-6">Project Phase</th>
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
                    />
                  </td>
                  <td className="py-2 pr-3">{r.no}.</td>
                  <td className="py-2 pr-3">{r.assigned}</td>
                  {/* added */}
                  <td className="py-2 pr-3">{r.type}</td>
                  <td className="py-2 pr-3">{r.task}</td>
                  <td className="py-2 pr-3">{r.created}</td>
                  <td className="py-2 pr-3">{r.due}</td>
                  <td className="py-2 pr-3">{r.time}</td>
                  <td className="py-2 pr-3">
                    <RevisionSelect
                      value={r.revision}
                      onChange={(v) =>
                        setRows((prev) =>
                          prev.map((x) => (x.no === r.no ? { ...x, revision: v } : x))
                        )
                      }
                    />
                  </td>
                  <td className="py-2 pr-6">
                    <StatusBadge value={r.status} />
                  </td>
                  {/* added */}
                  <td className="py-2 pr-6">{r.phase}</td>
                </tr>
              ))}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-neutral-500">
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

      {/* modal mount */}
      <CreateTaskDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={() => {}}
      />
    </div>
  );
};

export default TitleDefense;
