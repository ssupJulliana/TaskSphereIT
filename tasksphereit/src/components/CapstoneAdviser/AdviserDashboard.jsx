import React, { useMemo } from "react";
import { Users } from "lucide-react";

const MAROON = "#6A0F14";

/* ----------------------------- SAMPLE DATA ----------------------------- */
const UPCOMING = [
  {
    team: "Bernardo, Et Al",
    task: "Revise: Chapter 1",
    date: "Feb 2, 2025",
    time: "8:00 AM",
    color: "#D9A81E", // yellow
  },
  {
    team: "Bernardo, Et Al",
    task: "Prepare: Chapter 2",
    date: "Feb 2, 2025",
    time: "8:00 AM",
    color: "#D9A81E",
  },
  {
    team: "Aguas, Et Al",
    task: "Prepare: Chapter 3",
    date: "Feb 5, 2025",
    time: "8:00 AM",
    color: "#6FA8DC", // blue
  },
  {
    team: "Mendoza, Et Al",
    task: "Prepare: Chapter 3",
    date: "Feb 5, 2025",
    time: "8:00 AM",
    color: "#7C9C3B", // green
  },
];

const PROGRESS = [
  { team: "Aguas, Et Al", percent: 40 },
  { team: "Bernardo, Et Al", percent: 0 },
  { team: "Mendoza, Et Al", percent: 40 },
];

const RECENT = [
  {
    no: 1,
    assigned: "Aguas, Et Al",
    task: "Chapter 3",
    subtask: "Implementation",
    elements: "Hardware",
    due: "10/11/2025",
    time: "8:00 AM",
    status: "To Review",
  },
  {
    no: 2,
    assigned: "Bernardo, Et Al",
    task: "Chapter 2",
    subtask: "Related Theories",
    elements: "–",
    due: "10/11/2025",
    time: "8:00 AM",
    status: "In Progress",
  },
  {
    no: 3,
    assigned: "Mendoza, Et Al",
    task: "Chapter 4",
    subtask: "Design",
    elements: "Data Design",
    due: "10/11/2025",
    time: "10:00 AM",
    status: "To Do",
  },
];

/* ------------------------------- UI PIECES ----------------------------- */
function UpcomingCard({ item }) {
  return (
    <div className="w-[280px] bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <div
        className="px-3 py-2 text-white text-sm font-semibold flex items-center gap-2"
        style={{ backgroundColor: item.color }}
      >
        <Users className="w-4 h-4" />
        {item.team}
      </div>
      <div className="p-3 text-sm">
        <div className="text-neutral-800">{item.task}</div>
        <div className="mt-2 text-neutral-600">{item.date}</div>
        <div className="text-neutral-600">{item.time}</div>
      </div>
    </div>
  );
}

function Donut({ percent }) {
  const size = 120;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEE" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={"#9B59B6"}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-neutral-800"
        style={{ fontSize: 20, fontWeight: 700 }}
      >
        {percent}%
      </text>
    </svg>
  );
}

function ProgressCard({ team, percent }) {
  return (
    <div className="w-[260px] bg-white border border-neutral-200 rounded-xl shadow-sm">
      <div className="px-3 py-2 text-sm font-semibold flex items-center gap-2">
        <Users className="w-4 h-4" />
        {team}
      </div>
      <div className="grid place-items-center p-3">
        <Donut percent={percent} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = useMemo(() => {
    switch (status) {
      case "In Progress":
        return "bg-[#7C9C3B] text-white";
      case "To Review":
        return "bg-[#6FA8DC] text-white";
      case "To Do":
      default:
        return "bg-[#D9A81E] text-white";
    }
  }, [status]);
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${styles}`}>
      {status}
    </span>
  );
}

/* --------------------------------- MAIN --------------------------------- */
const AdviserDashboard = () => {
  return (
    <div className="space-y-8">
      {/* UPCOMING TASKS */}
      <section className="space-y-3">
        <h3 className="text-xl font-extrabold tracking-wide" style={{ color: MAROON }}>
          UPCOMING TASKS
        </h3>
        <div className="flex flex-wrap gap-4">
          {UPCOMING.map((u) => (
            <UpcomingCard key={`${u.team}-${u.task}`} item={u} />
          ))}
        </div>
      </section>

      {/* TEAMS' PROGRESS */}
      <section className="space-y-3">
        <h3 className="text-xl font-extrabold tracking-wide" style={{ color: MAROON }}>
          TEAMS’ PROGRESS
        </h3>
        <div className="flex flex-wrap gap-4">
          {PROGRESS.map((p) => (
            <ProgressCard key={p.team} team={p.team} percent={p.percent} />
          ))}
        </div>
      </section>

      {/* RECENT TASKS CREATED */}
      <section className="space-y-3">
        <h3 className="text-xl font-extrabold tracking-wide" style={{ color: MAROON }}>
          RECENT TASKS CREATED
        </h3>

        <div className="bg-white border border-neutral-200 rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500">
                  <th className="py-3 pl-6 pr-3 w-16">No</th>
                  <th className="py-3 pr-3">Assigned</th>
                  <th className="py-3 pr-3">Tasks</th>
                  <th className="py-3 pr-3">Subtasks</th>
                  <th className="py-3 pr-3">Elements</th>
                  <th className="py-3 pr-3">Due date</th>
                  <th className="py-3 pr-6">Time</th>
                  <th className="py-3 pr-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT.map((r) => (
                  <tr key={r.no} className="border-t border-neutral-200">
                    <td className="py-3 pl-6 pr-3">{r.no}.</td>
                    <td className="py-3 pr-3">{r.assigned}</td>
                    <td className="py-3 pr-3">{r.task}</td>
                    <td className="py-3 pr-3">{r.subtask}</td>
                    <td className="py-3 pr-3">{r.elements}</td>
                    <td className="py-3 pr-3">{r.due}</td>
                    <td className="py-3 pr-6">{r.time}</td>
                    <td className="py-3 pr-6">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdviserDashboard;
