import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Download,
  MoreVertical,
  Calendar as CalIcon,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const MAROON = "#6A0F14";

const teams = [
  { id: 1, team: "Aguas, Et Al",    date: "Jan 11, 2025", time: "8:00 AM - 9:00 AM",  panel: "Anderson F Dashiell", verdict: "Pending" },
  { id: 2, team: "Bernardo, Et Al", date: "Jan 11, 2025", time: "9:00 AM - 10:00 AM", panel: "Anderson F Dashiell", verdict: "Pending" },
  { id: 3, team: "Hawke, Et Al",    date: "Jan 11, 2025", time: "10:00 AM - 11:00 AM", panel: "Anderson F Dashiell", verdict: "Pending" },
  { id: 4, team: "Mendoza, Et Al",  date: "Jan 11, 2025", time: "9:00 AM - 10:00 AM", panel: "Anderson F Dashiell", verdict: "Pending" },
];

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
  return (
    <div className="p-6">
      {/* breadcrumbs + divider */}
      <Breadcrumbs />
      <div className="mt-2 h-[2px] w-full bg-neutral-200">
        <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 300 }} />
      </div>

      {/* actions */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Btn icon={Plus}>Create Schedule</Btn>
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
    </div>
  );
}
