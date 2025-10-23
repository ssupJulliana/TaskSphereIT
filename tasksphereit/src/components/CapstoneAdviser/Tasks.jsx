import React, { useMemo, useState } from "react";
import {
  ClipboardList,
  FileText,
  ChevronRight,
  ChevronLeft,
  Search,
  Trash2,
  Filter,
  MoreVertical,
  CalendarDays,
  Paperclip,
  UserCircle2,
} from "lucide-react";

const MAROON = "#6A0F14";

/* ---------- demo data (swap with API later) ---------- */
const CATEGORIES = [
  { id: "oral", title: "Oral Defense" },
  { id: "final", title: "Final Defense" },
];

const PAGE1_ROWS = [
  { no: 1, assigned: "Bernardo, Et Al", task: "Refine: Chapter 2", subtask: "Related Theories", elements: "—", created: "10/11/2025", due: "10/18/2025" },
  { no: 2, assigned: "Mendoza, Et Al", task: "Prepare: Chapter 2", subtask: "Related Theories", elements: "—", created: "10/14/2025", due: "10/20/2025" },
  { no: 3, assigned: "Aguas, Et Al", task: "Prepare: Chapter 3", subtask: "Methodology", elements: "—", created: "10/15/2025", due: "10/22/2025" },
];

const PAGE2_ROWS = [
  { no: 1, time: "8:00 AM", revision: "2nd Revision", status: "In Progress", methodology: "Agile", phase: "Design" },
  { no: 2, time: "8:00 AM", revision: "1st Revision", status: "To Do", methodology: "Extreme Programming", phase: "Planing" },
  { no: 3, time: "8:00 AM", revision: "No Revision", status: "To Review", methodology: "Prototyping", phase: "Design" },
];

const teamsList = ["Aguas, Et Al", "Mendoza, Et Al", "Bernardo, Et Al"];
const peopleList = ["Bernardo, Et Al", "Mendoza, Et Al", "Aguas, Et Al"];

/* ---------- tiny UI helpers ---------- */
const Card = ({ title, onClick }) => (
  <button
    onClick={onClick}
    className="relative w-56 h-44 text-left bg-white border border-neutral-200 rounded-2xl shadow-[0_6px_12px_rgba(0,0,0,0.12)] overflow-hidden hover:translate-y-[-2px] transition-transform"
  >
    <div className="absolute left-0 top-0 h-full w-8" style={{ backgroundColor: MAROON }} />
    <div className="absolute bottom-0 left-0 right-0 h-5" style={{ backgroundColor: MAROON }} />
    <div className="pl-12 pr-4 pt-6">
      <CalendarDays className="w-12 h-12 text-neutral-900" />
      <p className="mt-3 font-medium">{title}</p>
    </div>
  </button>
);

const Toolbar = ({ onBack, onPage, page, onCreate }) => (
  <div className="flex items-center gap-3 flex-wrap">
    <button
      onClick={onBack}
      className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100"
    >
      <ChevronLeft className="w-4 h-4" />
      Back to Tasks
    </button>

    <button
      onClick={onCreate}
      className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100"
    >
      <FileText className="w-4 h-4" />
      Create Tasks
    </button>

    <div className="relative ml-2">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
      <input
        placeholder="Search"
        className="w-64 pl-9 pr-3 py-2 rounded-lg border border-neutral-300 bg-white text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
      />
    </div>

    <div className="ml-auto flex items-center gap-2">
      <button className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100">
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
      <button className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100">
        <Filter className="w-4 h-4" />
        Filter
      </button>
    </div>

    <div className="w-full md:w-auto md:ml-2">
      <div className="inline-flex rounded-lg border border-neutral-300 overflow-hidden">
        <button
          onClick={() => onPage(1)}
          className={`px-3 py-1.5 text-sm ${page === 1 ? "bg-neutral-100 font-semibold" : ""}`}
        >
          Page 1
        </button>
        <button
          onClick={() => onPage(2)}
          className={`px-3 py-1.5 text-sm border-l border-neutral-300 ${page === 2 ? "bg-neutral-100 font-semibold" : ""}`}
        >
          Page 2
        </button>
      </div>
    </div>
  </div>
);

const TableShell = ({ children }) => (
  <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_6px_12px_rgba(0,0,0,0.08)] overflow-hidden">
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const Page1Table = ({ rows }) => (
  <TableShell>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-neutral-500">
          <th className="py-3 pl-6 pr-3 w-16">NO</th>
          <th className="py-3 pr-3">Assigned</th>
          <th className="py-3 pr-3">Tasks</th>
          <th className="py-3 pr-3">SubTasks</th>
          <th className="py-3 pr-3">Elements</th>
          <th className="py-3 pr-3">Date Created</th>
          <th className="py-3 pr-6">Due&nbsp;&nbsp;Date</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.no} className="border-t border-neutral-200">
            <td className="py-3 pl-6 pr-3">{r.no}.</td>
            <td className="py-3 pr-3">{r.assigned}</td>
            <td className="py-3 pr-3">{r.task}</td>
            <td className="py-3 pr-3">{r.subtask}</td>
            <td className="py-3 pr-3">{r.elements}</td>
            <td className="py-3 pr-3">{r.created}</td>
            <td className="py-3 pr-6">{r.due}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </TableShell>
);

const StatusBadge = ({ status }) => {
  const styles = useMemo(() => {
    switch (status) {
      case "In Progress":
        return "bg-[#7C9C3B] text-white";
      case "To Do":
        return "bg-[#F5B700] text-white";
      case "To Review":
        return "bg-[#6FA8DC] text-white";
      case "Completed":
        return "bg-[#6A0F14] text-white";
      default:
        return "bg-neutral-200";
    }
  }, [status]);
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${styles}`}>
      {status}
      <ChevronRight className="w-3 h-3" />
    </span>
  );
};

const Page2Table = ({ rows }) => (
  <TableShell>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-neutral-500">
          <th className="py-3 pl-6 pr-3 w-16">NO</th>
          <th className="py-3 pr-3">Time</th>
          <th className="py-3 pr-3">Revision No.</th>
          <th className="py-3 pr-3">Status</th>
          <th className="py-3 pr-3">Methodology</th>
          <th className="py-3 pr-3">Project Phase</th>
          <th className="py-3 pr-6">Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.no} className="border-t border-neutral-200">
            <td className="py-3 pl-6 pr-3">{r.no}.</td>
            <td className="py-3 pr-3">{r.time}</td>
            <td className="py-3 pr-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-neutral-300">
                {r.revision}
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </div>
            </td>
            <td className="py-3 pr-3"><StatusBadge status={r.status} /></td>
            <td className="py-3 pr-3">{r.methodology}</td>
            <td className="py-3 pr-3">{r.phase}</td>
            <td className="py-3 pr-6">
              <button className="p-1 rounded hover:bg-neutral-100">
                <MoreVertical className="w-5 h-5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </TableShell>
);

/* ---------- Create Task panel ---------- */
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

function CreateTaskPanel({ onCancel, onCreate }) {
  const [form, setForm] = useState({
    methodology: "Agile",
    phase: "Planning",
    type: "",
    task: "",
    subtask: "",
    elements: "",
    due: "2025-02-15",
    time: "08:00",
    assigned: "",
    teams: ["Aguas, Et Al", "Mendoza, Et Al"],
    comment: "Make sure your diagrams are aligned with your scope.",
  });

  const handle = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = () => {
    console.log("CREATE_TASK", form);
    onCreate?.(form);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-[0_6px_12px_rgba(0,0,0,0.08)]">
      <div className="h-[2px] w-full rounded-t-2xl" style={{ backgroundColor: MAROON }} />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <p className="font-semibold">Create Task</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <L>Methodology</L>
            <Select value={form.methodology} onChange={handle("methodology")}>
              <option>Agile</option>
              <option>Scrum</option>
              <option>Kanban</option>
              <option>Extreme Programming</option>
              <option>Waterfall</option>
            </Select>
          </div>

          <div>
            <L>Project Phase</L>
            <Select value={form.phase} onChange={handle("phase")}>
              <option>Planning</option>
              <option>Design</option>
              <option>Development</option>
              <option>Testing</option>
              <option>Deployment</option>
            </Select>
          </div>

          <div>
            <L>Tasks Type</L>
            <Select value={form.type} onChange={handle("type")}>
              <option value="">Select type</option>
              <option>Prepare</option>
              <option>Refine</option>
              <option>Revise</option>
              <option>Consult</option>
            </Select>
          </div>

          <div>
            <L>Tasks</L>
            <Select value={form.task} onChange={handle("task")}>
              <option value="">Select task</option>
              <option>Chapter 1</option>
              <option>Chapter 2</option>
              <option>Chapter 3</option>
              <option>Chapter 4</option>
            </Select>
          </div>

          <div>
            <L>Subtasks</L>
            <input
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
              value={form.subtask}
              onChange={handle("subtask")}
              placeholder="e.g., Related Theories"
            />
          </div>

          <div>
            <L>Elements</L>
            <input
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
              value={form.elements}
              onChange={handle("elements")}
              placeholder="—"
            />
          </div>

          <div>
            <L>Due Date</L>
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
              <option value="">Select member(s)</option>
              {peopleList.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </div>

          <div>
            <L>Team/s</L>
            <Select
              value={form.teams[0] ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, teams: [e.target.value, f.teams[1]].filter(Boolean) }))
              }
            >
              <option value="">Select team</option>
              {teamsList.map((t) => (
                <option key={t}>{t}</option>
              ))}
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
                <span className="font-medium">Grayson B Tolentino</span>
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  value={form.comment}
                  onChange={handle("comment")}
                  className="w-full resize-none px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  className="absolute right-2 bottom-2 p-1 rounded hover:bg-neutral-100"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-md text-sm text-white"
            style={{ backgroundColor: MAROON }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== MAIN: Tasks ===================== */
const Tasks = () => {
  const [view, setView] = useState("grid"); // 'grid' | 'detail'
  const [category, setCategory] = useState(null); // 'oral' | 'final'
  const [page, setPage] = useState(1); // 1 | 2
  const [showCreate, setShowCreate] = useState(false);

  if (view === "detail" && category) {
    const current = CATEGORIES.find((c) => c.id === category);

    return (
      <div className="space-y-4">
        {/* header + rule */}
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Tasks</h2>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
          <span className="font-semibold">{current.title}</span>
        </div>
        <div className="h-[2px] w-full" style={{ backgroundColor: MAROON }} />

        {/* toolbar */}
        <Toolbar
          onBack={() => {
            setView("grid");
            setPage(1);
            setShowCreate(false);
          }}
          onPage={(p) => setPage(p)}
          page={page}
          onCreate={() => setShowCreate((s) => !s)}
        />

        {/* create panel */}
        {showCreate && (
          <CreateTaskPanel
            onCancel={() => setShowCreate(false)}
            onCreate={() => setShowCreate(false)}
          />
        )}

        {/* table pages */}
        <div className="mt-3">
          {page === 1 ? <Page1Table rows={PAGE1_ROWS} /> : <Page2Table rows={PAGE2_ROWS} />}
        </div>
      </div>
    );
  }

  // GRID OF CARDS
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Tasks</h2>
      </div>
      <div className="h-[2px] w-full" style={{ backgroundColor: MAROON }} />

      <div className="flex flex-wrap gap-4">
        {CATEGORIES.map((c) => (
          <Card
            key={c.id}
            title={c.title}
            onClick={() => {
              setCategory(c.id);
              setView("detail");
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Tasks;
