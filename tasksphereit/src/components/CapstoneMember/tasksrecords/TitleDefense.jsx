// src/components/CapstoneMember/tasksrecords/TitleDefense.jsx
import React, { useMemo, useState } from "react";
import {
  Search,
  Eye,
  CalendarDays,
  Clock,
  ChevronLeft,
} from "lucide-react";

const MAROON = "#6A0F14";

// Same sample data as PM record
const RAW_ROWS = [
  {
    no: 1,
    assigned: "Addrialene G. Mendoza",
    type: "Documentation",
    task: "Introduction",
    created: "2025-01-05",
    due: "2025-01-10",
    time: "08:00",
    completed: "2025-01-10",
    revision: "No Revision",
    status: "Completed",
    phase: "Analysis",
  },
  {
    no: 2,
    assigned: "Harzwel Zhen B. Lacson",
    type: "Documentation",
    task: "Chapter 1",
    created: "2025-01-07",
    due: "2025-01-12",
    time: "10:30",
    completed: "2025-01-12",
    revision: "Revision 1",
    status: "Completed",
    phase: "Planning",
  },
  {
    no: 3,
    assigned: "Julliana N. Castaneda",
    type: "Discussion",
    task: "Scope Definition",
    created: "2025-01-06",
    due: "2025-01-14",
    time: "09:15",
    completed: "2025-01-14",
    revision: "No Revision",
    status: "Completed",
    phase: "Analysis",
  },
];

// ===== Helpers =====
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":");
  const H = parseInt(h, 10);
  const ampm = H >= 12 ? "PM" : "AM";
  const twelve = ((H + 11) % 12) + 1;
  return `${twelve}:${m} ${ampm}`;
}

function TitleDefense({ onBack, onView }) {
  const [rows] = useState(RAW_ROWS);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");

  // derive phases for filter
  const phases = useMemo(() => Array.from(new Set(rows.map((r) => r.phase))), [rows]);

  // filter rows
  const filteredRows = useMemo(() => {
    const s = search.toLowerCase();
    return rows.filter((r) => {
      const matchesSearch =
        !s ||
        r.assigned.toLowerCase().includes(s) ||
        r.type.toLowerCase().includes(s) ||
        r.task.toLowerCase().includes(s) ||
        r.revision.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r.phase.toLowerCase().includes(s) ||
        formatDate(r.created).toLowerCase().includes(s) ||
        formatDate(r.due).toLowerCase().includes(s) ||
        formatDate(r.completed).toLowerCase().includes(s);
      const matchesPhase = !phaseFilter || r.phase === phaseFilter;
      return matchesSearch && matchesPhase;
    });
  }, [rows, search, phaseFilter]);

  const handleBack = () => {
    if (typeof onBack === "function") onBack();
    else window.history.back();
  };

  const handleView = (row) => {
    // Wire up your modal or navigation here
    if (typeof onView === "function") onView(row);
    else alert(`Viewing task: ${row.assigned} • ${row.task}`);
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100 cursor-pointer"
          title="Back to Tasks Record"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
            />
          </div>
          {/* Phase filter */}
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-300"
          >
            <option value="">All Phases</option>
            {phases.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] leading-tight">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2 pl-6 pr-3 whitespace-nowrap">NO</th>
                <th className="py-2 pr-3 whitespace-nowrap">Assigned</th>
                <th className="py-2 pr-3 whitespace-nowrap">Task Type</th>
                <th className="py-2 pr-3 whitespace-nowrap">Task</th>
                <th className="py-2 pr-3 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Created
                  </div>
                </th>
                <th className="py-2 pr-3 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Due Date
                  </div>
                </th>
                <th className="py-2 pr-3 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Time
                  </div>
                </th>
                <th className="py-2 pr-3 whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Completed
                  </div>
                </th>
                <th className="py-2 pr-3 whitespace-nowrap">Revision No</th>
                <th className="py-2 pr-3 whitespace-nowrap">Status</th>
                <th className="py-2 pr-3 whitespace-nowrap">Phase</th>
                <th className="py-2 pr-6 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.no} className="border-t border-neutral-200">
                  <td className="py-2 pl-6 pr-3 whitespace-nowrap">{r.no}.</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.assigned}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.type}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.task}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{formatDate(r.created)}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{formatDate(r.due)}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{formatTime(r.time)}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{formatDate(r.completed)}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.revision}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.status}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.phase}</td>
                  {/* Member-only action: View */}
                  <td className="py-2 pr-6 whitespace-nowrap">
                    <button
                      onClick={() => handleView(r)}
                      className="p-1 rounded-md text-neutral-700 hover:bg-neutral-100"
                      title="View"
                      aria-label="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-neutral-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TitleDefense