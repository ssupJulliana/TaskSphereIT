import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Download,
  MoreVertical,
  Calendar as CalIcon,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
  Trash2,
  X,
  Filter,
} from "lucide-react";

const MAROON = "#6A0F14";

const Btn = ({ children, variant = "solid", icon: Icon, className = "", ...props }) => {
  const base =
    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium cursor-pointer " +
    "focus:outline-none focus:ring-2 focus:ring-neutral-200 " + className;

  const cls =
    variant === "solid"
      ? base + " text-white"
      : base + " border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50";

  const style = variant === "solid" ? { backgroundColor: MAROON } : undefined;
  return (
    <button {...props} className={cls} style={style}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const rows = [
  { id: 1,  team: "Aguas, Et Al",    title: "FitTrack",     due: "Mar 25, 2025", time: "8:00 AM",  plag: 20, ai: 40, file: "Aguas.docx",   verdict: "Re-Check" },
  { id: 2,  team: "Quinlan, Et Al",  title: "AgriNova",     due: "Mar 25, 2025", time: "8:00 AM",  plag: 26, ai: 30, file: "Quinlan.docx", verdict: "Re-Check" },
  { id: 3,  team: "Trinidad, Et Al", title: "TripWise",     due: "Mar 25, 2025", time: "8:00 AM",  plag: 23, ai: 25, file: "Trinidad.docx",verdict: "Re-Check" },
  { id: 4,  team: "Bernardo, Et Al", title: "FoodFind",     due: "Mar 25, 2025", time: "8:00 AM",  plag: 6,  ai: 5,  file: "—",            verdict: "Passed" },
  { id: 5,  team: "Hawke, Et Al",    title: "QuizMaster",   due: "Mar 25, 2025", time: "8:00 AM",  plag: 5,  ai: 3,  file: "—",            verdict: "Passed" },
  { id: 6,  team: "Haraki, Et Al",   title: "QuickBite",    due: "Mar 25, 2025", time: "8:00 AM",  plag: 2,  ai: 7,  file: "—",            verdict: "Passed" },
  { id: 7,  team: "Mendoza, Et Al",  title: "TaskSphere IT",due: "Mar 25, 2025", time: "8:00 AM",  plag: 6,  ai: 6,  file: "—",            verdict: "Passed" },
];

const VerdictPill = ({ verdict }) => {
  const isPassed = verdict.toLowerCase() === "passed";
  const styles = isPassed
    ? "bg-[#6BA34D] text-white"
    : "bg-[#E45454] text-white";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${styles}`}>
      {verdict}
    </span>
  );
};

const Breadcrumbs = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 text-neutral-700">
      <button
        onClick={() => navigate("/instructor/schedule")}
        className="inline-flex items-center gap-2 text-[15px] font-medium text-neutral-600 hover:underline"
      >
        <FileText size={16} className="text-neutral-500" />
        Schedule
      </button>
      <ChevronRight size={16} className="text-neutral-400" />
      <span className="text-[15px] font-semibold">Manuscript Submission</span>
    </div>
  );
};

export default function ManuscriptSubmission() {
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.team.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.file.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="p-6">
      {/* breadcrumb + maroon divider */}
      <Breadcrumbs />
      <div className="mt-2 h-[2px] w-full bg-neutral-200">
        <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 320 }} />
      </div>

      {/* actions row (left create + search, right delete) */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Btn icon={Plus} onClick={() => setShowCreate(true)}>Create Schedule</Btn>
        </div>

        <Btn icon={Trash2} variant="outline">Delete</Btn>
      </div>

      {/* table card */}
      <div className="mt-4 rounded-xl border border-neutral-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
        {/* table header tools */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-3 py-2 w-72 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-neutral-400" />
          </div>

          <div className="flex items-center gap-2 pb-2">
            <Btn icon={Filter} variant="outline" className="!px-2">Filters</Btn>
            <Btn icon={Download} variant="outline">Export</Btn>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-left px-4 py-3 w-16">NO</th>
                <th className="text-left px-4 py-3">Team</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">
                  <div className="inline-flex items-center gap-2"><CalIcon size={16} /> Due Date</div>
                </th>
                <th className="text-left px-4 py-3">
                  <div className="inline-flex items-center gap-2"><Clock size={16} /> Time</div>
                </th>
                <th className="text-left px-4 py-3">Plagiarism</th>
                <th className="text-left px-4 py-3">AI</th>
                <th className="text-left px-4 py-3">File Uploaded</th>
                <th className="text-left px-4 py-3">Verdict</th>
                <th className="text-left px-4 py-3 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id} className={idx % 2 ? "bg-neutral-50/60" : "bg-white"}>
                  <td className="px-4 py-3 text-neutral-600">{idx + 1}.</td>
                  <td className="px-4 py-3 font-medium text-neutral-800">{r.team}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.title}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.due}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.time}</td>
                  <td className="px-4 py-3 text-[#E45454] font-semibold">{r.plag}%</td>
                  <td className="px-4 py-3 text-[#E45454] font-semibold">{r.ai}%</td>
                  <td className="px-4 py-3 text-neutral-700">{r.file}</td>
                  <td className="px-4 py-3"><VerdictPill verdict={r.verdict} /></td>
                  <td className="px-2 py-3">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 cursor-pointer">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-neutral-500" colSpan={10}>
                    No records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* soft bottom padding for shadow breathing room */}
        <div className="h-2" />
      </div>

      {showCreate && <CreateScheduleDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}

/* ---------------- Dialog ---------------- */
function CreateScheduleDialog({ onClose }) {
  const teamList = useMemo(
    () => [
      "All Teams",
      "Aguas, Et Al",
      "Quinlan, Et Al",
      "Trinidad, Et Al",
      "Bernardo, Et Al",
      "Hawke, Et Al",
      "Haraki, Et Al",
      "Mendoza, Et Al",
    ],
    []
  );

  const [assigned, setAssigned] = useState("");
  const [scope, setScope] = useState("All Teams");
  const [date, setDate] = useState("2025-03-25");
  const [time, setTime] = useState("08:00");

  const handleCreate = () => {
    // wire up to API later
    console.log({ assigned, scope, date, time });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div className="absolute left-1/2 top-1/2 w-[560px] -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl bg-white border border-neutral-200 shadow-2xl">
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="text-[16px] font-semibold" style={{ color: MAROON }}>
              Create Schedule
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 grid place-items-center rounded-md hover:bg-neutral-100"
            >
              <X size={18} className="text-neutral-500" />
            </button>
          </div>
          <div className="mt-3 h-[2px] w-full bg-neutral-200">
            <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 160 }} />
          </div>

          {/* body */}
          <div className="px-5 py-5">
            <div className="grid grid-cols-2 gap-5">
              {/* Assign Teams */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Assign Team/s
                </label>
                <div className="relative">
                  <select
                    value={assigned}
                    onChange={(e) => setAssigned(e.target.value)}
                    className="w-full appearance-none pr-8 pl-3 py-2 rounded-md border border-neutral-300 text-sm bg-white"
                  >
                    <option value="">Select</option>
                    {teamList.slice(1).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                </div>

                <div className="relative mt-3">
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full appearance-none pr-8 pl-3 py-2 rounded-md border border-neutral-300 text-sm bg-white"
                  >
                    {teamList.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              {/* Date / Time */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 rounded-md border border-neutral-300 text-sm"
                  />
                  <Calendar size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                </div>

                <label className="block text-sm font-medium text-neutral-700 mt-4 mb-2">
                  Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 rounded-md border border-neutral-300 text-sm"
                  />
                  <Clock size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white"
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
