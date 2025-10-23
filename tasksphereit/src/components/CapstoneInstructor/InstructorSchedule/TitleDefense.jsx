// src/components/CapstoneInstructor/InstructorSchedule/TitleDefense.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  PlusCircle,
  Download,
  MoreVertical,
  Calendar as CalIcon,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  User2,
  X,
} from "lucide-react";

const MAROON = "#6A0F14";

// demo table data
const teams = [
  { id: 1, team: "Aguas, Et Al",    date: "Jan 11, 2025", time: "8:00 AM - 9:00 AM",  panel: "Anderson F Dashiell", verdict: "Pending" },
  { id: 2, team: "Bernardo, Et Al", date: "Jan 11, 2025", time: "9:00 AM - 10:00 AM", panel: "Anderson F Dashiell", verdict: "Pending" },
  { id: 3, team: "Hawke, Et Al",    date: "Jan 11, 2025", time: "10:00 AM - 11:00 AM", panel: "Anderson F Dashiell", verdict: "Pending" },
  { id: 4, team: "Mendoza, Et Al",  date: "Jan 11, 2025", time: "9:00 AM - 10:00 AM", panel: "Anderson F Dashiell", verdict: "Pending" },
];

// simple button utility
const Btn = ({ children, variant = "solid", icon: Icon, ...props }) => {
  const cls =
    variant === "solid"
      ? "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white"
      : "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50";
  const style = variant === "solid" ? { backgroundColor: MAROON } : undefined;
  return (
    <button {...props} className={cls} style={style}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Breadcrumbs = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 text-neutral-700">
      <button
        onClick={() => navigate("/instructor/schedule")}
        className="text-[15px] font-medium text-neutral-600 hover:underline"
      >
        
        Schedule
      </button>
      <ChevronRight size={16} className="text-neutral-400" />
      <span className="text-[15px] font-semibold">Title Defense</span>
      <ChevronRight size={16} className="text-neutral-400" />
      <span className="text-[15px]">Scheduled Teams</span>
    </div>
  );
};

export default function TitleDefense() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="p-6">
      {/* breadcrumbs + divider */}
      <Breadcrumbs />
      <div className="mt-2 h-[2px] w-full bg-neutral-200">
        <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 300 }} />
      </div>

      {/* actions */}
      <div className="mt-5 flex items-center justify-between ">
        <div className="flex items-center gap-3">
          <Btn icon={Plus} onClick={() => setShowCreate(true)}>Create Schedule</Btn>
          <Btn icon={Download} variant="outline">Export</Btn>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-3 py-2 w-64 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-neutral-400" />
        </div>

        <Btn variant="outline">
          <span className="text-neutral-700">Delete</span>
        </Btn>
      </div>

      {/* table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="text-left px-4 py-3 w-16">NO</th>
              <th className="text-left px-4 py-3">Team</th>
              <th className="text-left px-4 py-3">
                <div className="inline-flex items-center gap-2"><CalIcon size={16} /> Date</div>
              </th>
              <th className="text-left px-4 py-3">
                <div className="inline-flex items-center gap-2"><Clock size={16} /> Time</div>
              </th>
              <th className="text-left px-4 py-3">Panelists</th>
              <th className="text-left px-4 py-3">Verdict</th>
              <th className="text-left px-4 py-3 w-16">Action</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t, idx) => (
              <tr key={t.id} className={idx % 2 ? "bg-neutral-50/60" : "bg-white"}>
                <td className="px-4 py-3 text-neutral-600">{idx + 1}.</td>
                <td className="px-4 py-3 font-medium text-neutral-800">{t.team}</td>
                <td className="px-4 py-3 text-neutral-700">{t.date}</td>
                <td className="px-4 py-3 text-neutral-700">{t.time}</td>
                <td className="px-4 py-3 text-neutral-700">{t.panel}</td>
                <td className="px-4 py-3">
                  <div className="relative inline-flex items-center">
                    <select
                      defaultValue={t.verdict}
                      className="appearance-none pr-8 pl-3 py-1.5 rounded-md border text-sm"
                      style={{ borderColor: MAROON, color: "#111827" }}
                    >
                      <option>Pending</option>
                      <option>Passed</option>
                      <option>Re-Defense</option>
                      <option>Failed</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-2 pointer-events-none text-neutral-500" />
                  </div>
                </td>
                <td className="px-2 py-3">
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Schedule Dialog */}
      {showCreate && <CreateScheduleDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}

/* ------- Dialog component ------- */
function CreateScheduleDialog({ onClose }) {
  const teamOptions = useMemo(
    () => ["Aguas, Et Al", "Bernardo, Et Al", "Hawke, Et Al", "Mendoza, Et Al"],
    []
  );
  const panelistOptions = useMemo(
    () => ["Anderson F Dashiell", "Beatrice Q Lazo", "Carl W Santos", "Dana T Cruz"],
    []
  );

  const [team, setTeam] = useState(teamOptions[3]); // default shown in screenshot
  const [date, setDate] = useState("2025-01-11");
  const [time, setTime] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("10:00");
  const [panelistPick, setPanelistPick] = useState("");
  const [panelists, setPanelists] = useState(["Anderson F Dashiell"]);

  const addPanelist = (name) => {
    if (!name) return;
    if (!panelists.includes(name)) setPanelists((p) => [...p, name]);
    setPanelistPick("");
  };
  const removePanelist = (name) =>
    setPanelists((p) => p.filter((n) => n !== name));

  const handleCreate = () => {
    // You can wire to API here
    console.log({
      team,
      date,
      timeRange: `${time} - ${timeEnd}`,
      panelists,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* panel */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] max-w-[92vw]">
        <div className="rounded-2xl bg-white border border-neutral-200 shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 p-0">
          {/* header */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-2 text-[16px] font-semibold" style={{ color: MAROON }}>
              <PlusCircle size={18} />
              Create Schedule
            </div>
            <div className="mt-3 h-[2px] w-full bg-neutral-200">
              <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 160 }} />
            </div>
          </div>

          {/* body */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              {/* Assign Team */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Assign Team</label>
                <div className="relative">
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="w-full appearance-none pr-8 pl-3 py-2 rounded-md border border-neutral-300 text-sm bg-white"
                  >
                    {teamOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              {/* Assign Panelists */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Assign Panelists</label>
                <div className="relative">
                  <select
                    value={panelistPick}
                    onChange={(e) => addPanelist(e.target.value)}
                    className="w-full appearance-none pr-8 pl-3 py-2 rounded-md border border-neutral-300 text-sm bg-white"
                  >
                    <option value="">Select</option>
                    {panelistOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 rounded-md border border-neutral-300 text-sm"
                  />
                  <Calendar size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              {/* Panelists chips */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Panelists</label>
                <div className="w-full rounded-md border border-neutral-300 bg-white px-2 py-2 flex flex-wrap gap-2">
                  {panelists.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-2 py-1 text-sm bg-white"
                    >
                      <User2 size={16} className="text-neutral-600" />
                      {p}
                      <button
                        className="ml-1 rounded hover:bg-neutral-100 p-0.5"
                        onClick={() => removePanelist(p)}
                        title="Remove"
                      >
                        <X size={14} className="text-neutral-500" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Time range */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Time</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pr-10 pl-3 py-2 rounded-md border border-neutral-300 text-sm"
                    />
                    <Clock size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                  </div>
                  <span className="text-neutral-400">—</span>
                  <div className="relative flex-1">
                    <input
                      type="time"
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                      className="w-full pr-10 pl-3 py-2 rounded-md border border-neutral-300 text-sm"
                    />
                    <Clock size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* footer buttons */}
            <div className="mt-8 flex items-center justify-end gap-3">
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
