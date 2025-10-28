// src/components/ProjectManager/tasks/OralDefense.jsx
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
  {
    no: 1,
    assigned: "Alejandro F",
    task: "Chapter 3",
    subtask: "Development",
    element: "Hardware",
    created: "Feb 5, 2025",
    due: "Feb 9, 2025",
    time: "8:00 AM",
    revision: "No Revision",
  },
  {
    no: 2,
    assigned: "Harzwel Zhen L",
    task: "Chapter 3",
    subtask: "Development",
    element: "Software",
    created: "Feb 6, 2025",
    due: "Feb 10, 2025",
    time: "9:00 AM",
    revision: "No Revision",
  },
  {
    no: 3,
    assigned: "Julliana C",
    task: "Chapter 3",
    subtask: "Development",
    element: "Peopleware",
    created: "Feb 4, 2025",
    due: "Feb 7, 2025",
    time: "8:30 AM",
    revision: "No Revision",
  },
  {
    no: 4,
    assigned: "John Reagan S",
    task: "Chapter 3",
    subtask: "Implementation",
    element: "Hardware",
    created: "Feb 7, 2025",
    due: "Feb 11, 2025",
    time: "11:50 AM",
    revision: "No Revision",
  },
  {
    no: 5,
    assigned: "Justine P",
    task: "Chapter 3",
    subtask: "Implementation",
    element: "Software",
    created: "Feb 11, 2025",
    due: "Feb 13, 2025",
    time: "10:00 AM",
    revision: "No Revision",
  },
  {
    no: 6,
    assigned: "Addrialene G",
    task: "Chapter 3",
    subtask: "Implementation",
    element: "Peopleware",
    created: "Feb 12, 2025",
    due: "Feb 15, 2025",
    time: "11:00 AM",
    revision: "No Revision",
  },
];

/* ------------------------------- HELPERS -------------------------------- */
const RevisionSelect = ({ value, onChange }) => {
  return (
    <select
      className="text-xs font-medium border rounded-full px-3 py-1 bg-white"
      style={{ borderColor: MAROON, color: "#111" }}
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
  const [phase, setPhase] = useState("Presentation");
  const [type, setType] = useState("Oral Defense");
  const [task, setTask] = useState("Chapter 3");
  const [subtask, setSubtask] = useState("Development");
  const [element, setElement] = useState("Hardware");
  const [due, setDue] = useState("2025-02-15");
  const [time, setTime] = useState("08:00");
  const [assigned, setAssigned] = useState("Alejandro F");
  const [team, setTeam] = useState("Aguas, Et Al");
  const [comment, setComment] = useState("Align slides to rubric and timing.");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 mx-auto mt-10 w-[900px] max-w-[95vw]">
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200">
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-4">
            <div
              className="flex items-center gap-2 text-[16px] font-semibold"
              style={{ color: MAROON }}
            >
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
                  <option>Presentation</option>
                  <option>Testing</option>
                  <option>Implementation</option>
                </select>
              </div>

              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Task</label>
                <input
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="e.g., Chapter 3"
                />
              </div>

              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subtask</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={subtask}
                  onChange={(e) => setSubtask(e.target.value)}
                >
                  <option>Development</option>
                  <option>Implementation</option>
                </select>
              </div>
            </div>

            {/* row 2 */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Element</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={element}
                  onChange={(e) => setElement(e.target.value)}
                >
                  <option>Hardware</option>
                  <option>Software</option>
                  <option>Peopleware</option>
                </select>
              </div>

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

            {/* row 3 */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Assigned</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={assigned}
                  onChange={(e) => setAssigned(e.target.value)}
                >
                  <option>Alejandro F</option>
                  <option>Harzwel Zhen L</option>
                  <option>Julliana C</option>
                  <option>John Reagan S</option>
                  <option>Justine P</option>
                  <option>Addrialene G</option>
                </select>
              </div>

              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Team</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                >
                  <option>Aguas, Et Al</option>
                  <option>Mendoza, Et Al</option>
                  <option>Bernardo, Et Al</option>
                </select>
              </div>
            </div>

            {/* comment box */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Leave Comment:</label>
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
                onCreate?.({ phase, type, task, subtask, element, due, time, assigned, team, comment });
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
export default function OralDefense({ onBack }) {
  const handleBack = () => (typeof onBack === "function" ? onBack() : window.history.back());

  const [q, setQ] = useState("");
  const [rows, setRows] = useState(RAW_ROWS);
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
        r.task.toLowerCase().includes(s) ||
        r.subtask.toLowerCase().includes(s) ||
        r.element.toLowerCase().includes(s) ||
        r.created.toLowerCase().includes(s) ||
        r.due.toLowerCase().includes(s) ||
        r.time.toLowerCase().includes(s)
    );
  }, [q, rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {/* Back + Create + Search */}
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
            onClick={() => alert("Use bulk actions here if needed")}
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
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-3 pl-6 pr-3 w-16">NO</th>
                <th className="py-3 pr-3">Assigned</th>
                <th className="py-3 pr-3">Task</th>
                <th className="py-3 pr-3">Subtask</th>
                <th className="py-3 pr-3">Element</th>
                <th className="py-3 pr-3">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Date Created
                  </div>
                </th>
                <th className="py-3 pr-3">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Due Date
                  </div>
                </th>
                <th className="py-3 pr-3">
                  <div className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Time
                  </div>
                </th>
                <th className="py-3 pr-6">Revision NO</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.no} className="border-t border-neutral-200">
                  <td className="py-3 pl-6 pr-3">{r.no}.</td>
                  <td className="py-3 pr-3">{r.assigned}</td>
                  <td className="py-3 pr-3">{r.task}</td>
                  <td className="py-3 pr-3">{r.subtask}</td>
                  <td className="py-3 pr-3">{r.element}</td>
                  <td className="py-3 pr-3">{r.created}</td>
                  <td className="py-3 pr-3">{r.due}</td>
                  <td className="py-3 pr-3">{r.time}</td>
                  <td className="py-3 pr-6">
                    <RevisionSelect
                      value={r.revision}
                      onChange={(v) =>
                        setRows((prev) => prev.map((x) => (x.no === r.no ? { ...x, revision: v } : x)))
                      }
                    />
                  </td>
                </tr>
              ))}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-neutral-500">
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

      {/* modal */}
      <CreateTaskDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={() => {}}
      />
    </div>
  );
}
