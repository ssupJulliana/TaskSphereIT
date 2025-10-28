import React, { useMemo, useState } from "react";
import {
  ClipboardList,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  Search,
  Trash2,
  Filter,
  FileText,
  MoreVertical,
} from "lucide-react";

const MAROON = "#6A0F14";

/* --------------------------- Demo data --------------------------- */
const CATEGORIES = [
  { id: "oral", title: "Oral Defense" },
  { id: "final", title: "Final Defense" },
];

const PAGE1_ROWS = [
  { no: 1, assigned: "Bernardo, Et Al", task: "Refine: Chapter 2", subtask: "Related Theories", elements: "—", created: "10/11/2025", due: "10/18/2025" },
  { no: 2, assigned: "Mendoza, Et Al", task: "Prepare: Chapter 2", subtask: "Related Theories", elements: "—", created: "10/14/2025", due: "10/20/2025" },
  { no: 3, assigned: "Aguas, Et Al", task: "Prepare: Chapter 3", subtask: "Methodology",       elements: "—", created: "10/15/2025", due: "10/22/2025" },
];

const PAGE2_ROWS = [
  { no: 1, time: "8:00 AM", completed: "10/25/2025", revision: "2nd Revision", status: "Completed", methodology: "Agile",                phase: "Design"  },
  { no: 2, time: "8:00 AM", completed: "10/25/2025", revision: "1st Revision", status: "Completed", methodology: "Extreme Programming", phase: "Planing" },
  { no: 3, time: "8:00 AM", completed: "10/25/2025", revision: "No Revision",  status: "Completed", methodology: "Prototyping",         phase: "Design"  },
];

/* --------------------------- UI helpers -------------------------- */
const Card = ({ title, onClick }) => (
  <button
    onClick={onClick}
    className="relative w-56 h-44 text-left bg-white border border-neutral-200 rounded-2xl shadow-[0_6px_12px_rgba(0,0,0,0.12)] overflow-hidden hover:translate-y-[-2px] transition-transform"
  >
    {/* left + bottom maroon accents */}
    <div className="absolute left-0 top-0 h-full w-8" style={{ backgroundColor: MAROON }} />
    <div className="absolute bottom-0 left-0 right-0 h-5" style={{ backgroundColor: MAROON }} />
    <div className="pl-12 pr-4 pt-6">
      <CalendarDays className="w-12 h-12 text-neutral-900" />
      <p className="mt-3 font-medium"> {title} </p>
    </div>
  </button>
);

const Toolbar = ({ onBack, onCreate, onPage, page }) => (
  <div className="flex items-center gap-3 flex-wrap">
    <button
      onClick={onBack}
      className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100"
    >
      <ChevronLeft className="w-4 h-4" />
      Back to Records
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

    {/* page toggles */}
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
  // Completed badge (purple) as in the screenshot
  const styles = "bg-[#9B59B6] text-white";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${styles}`}>
      {status}
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
          <th className="py-3 pr-3">Date Completed</th>
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
            <td className="py-3 pr-3">{r.completed}</td>
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

/* ------------------------------ MAIN ------------------------------ */
const TaskRecord = () => {
  const [view, setView] = useState("grid");     // 'grid' | 'detail'
  const [category, setCategory] = useState(null);
  const [page, setPage] = useState(1);          // 1 | 2

  if (view === "detail" && category) {
    const current = CATEGORIES.find((c) => c.id === category);

    return (
      <div className="space-y-4">
        {/* header + rule */}
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Tasks Record</h2>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
          <span className="font-semibold">{current.title}</span>
        </div>
        <div className="h-[2px] w-full" style={{ backgroundColor: MAROON }} />

        {/* toolbar */}
        <Toolbar
          onBack={() => {
            setView("grid");
            setPage(1);
          }}
          onCreate={() => {/* open create flow if you add it later */}}
          onPage={(p) => setPage(p)}
          page={page}
        />

        {/* table pages */}
        <div className="mt-3">
          {page === 1 ? <Page1Table rows={PAGE1_ROWS} /> : <Page2Table rows={PAGE2_ROWS} />}
        </div>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Tasks Record</h2>
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

export default TaskRecord;
