import React, { useMemo } from "react";
import {
  Calendar,
  Clock,
  Users,
  MoreVertical,
} from "lucide-react";

const MAROON = "#6A0F14";
const MAROON_DARK = "#4a0a0d";

/* -------------------- Small UI helpers -------------------- */
const Card = ({ className = "", children }) => (
  <div
    className={
      "rounded-xl border border-neutral-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.05)] " +
      className
    }
  >
    {children}
  </div>
);

const Badge = ({ children, tone = "maroon" }) => {
  const map = {
    maroon: "bg-[#6A0F14] text-white",
    soft: "bg-neutral-100 text-neutral-600",
  };
  return (
    <span className={"inline-flex items-center rounded-md px-2 py-[2px] text-xs font-medium " + map[tone]}>
      {children}
    </span>
  );
};

const Donut = ({ value = 0 }) => {
  // value: 0 - 100
  const clamped = Math.max(0, Math.min(100, value));
  const ring = `conic-gradient(${MAROON} ${clamped * 3.6}deg, #eee 0deg)`;
  return (
    <div className="relative h-20 w-20 rounded-full" style={{ background: ring }}>
      <div className="absolute inset-2 rounded-full bg-white grid place-items-center">
        <span className="text-sm font-semibold" style={{ color: MAROON }}>{clamped}%</span>
      </div>
    </div>
  );
};

/* -------------------- Demo data -------------------- */
const upcoming = [
  { id: 1, tag: "Title Defense", team: "Aguas, Et Al", date: "Jan 11, 2025", time: "8:00 AM" },
  { id: 2, tag: "Title Defense", team: "Bernardo, Et Al", date: "Jan 11, 2025", time: "9:00 AM" },
  { id: 3, tag: "Title Defense", team: "Hawke, Et Al", date: "Jan 11, 2025", time: "10:00 AM" },
];

const advisers = [
  {
    id: 1,
    name: "Adam B Apostol",
    teams: [
      { id: "t1", name: "Hawke, Et Al", progress: 60 },
      { id: "t2", name: "Quinlan, Et Al", progress: 40 },
    ],
  },
  {
    id: 2,
    name: "Grayson B Tolentino",
    teams: [
      { id: "t3", name: "Aguas, Et Al", progress: 40 },
      { id: "t4", name: "Bernardo, Et Al", progress: 0 },
      { id: "t5", name: "Mendoza, Et Al", progress: 40 },
    ],
  },
];

const recent = [
  { id: 1, team: "Aguas, Et Al", created: "Jan 03, 2025", date: "Jan 11, 2025", time: "8:00 AM - 9:00 AM", status: "Pending" },
  { id: 2, team: "Bernardo, Et Al", created: "Jan 03, 2025", date: "Jan 11, 2025", time: "9:00 AM - 10:00 AM", status: "Pending" },
];

/* -------------------- Calendar generator -------------------- */
function getMonthMatrix(today = new Date()) {
  const y = today.getFullYear();
  const m = today.getMonth(); // 0-based
  const first = new Date(y, m, 1);
  const startDay = (first.getDay() + 6) % 7; // make Monday=0
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));

  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  // slice into weeks
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/* -------------------- Page -------------------- */
export default function InstructorDashboard() {
  const today = new Date();
  const monthWeeks = useMemo(() => getMonthMatrix(today), [today]);
  const monthName = today.toLocaleString("default", { month: "long" });

  return (
    <div className="p-6">
      {/* ---------- UPCOMING ACTIVITY ---------- */}
      <h2 className="text-[18px] font-semibold tracking-wide" style={{ color: MAROON }}>
        UPCOMING ACTIVITY
      </h2>

      <div className="mt-3 flex flex-wrap gap-4">
        {upcoming.map((u) => (
          <Card key={u.id} className="w-[300px]">
            {/* maroon header band */}
            <div className="rounded-t-xl px-3 py-2 text-white text-sm font-semibold" style={{ backgroundColor: MAROON }}>
              {u.tag}
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center gap-2 text-[15px] font-medium text-neutral-800">
                <Users size={16} className="text-neutral-500" />
                {u.team}
              </div>

              <div className="mt-2 flex items-center gap-2 text-neutral-700">
                <Calendar size={16} className="text-neutral-500" />
                {u.date}
              </div>

              <div className="mt-1 flex items-center gap-2 text-neutral-700">
                <Clock size={16} className="text-neutral-500" />
                {u.time}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ---------- TEAMS' PROGRESS ---------- */}
      <h2 className="mt-8 text-[18px] font-semibold tracking-wide" style={{ color: MAROON }}>
        TEAMS’ PROGRESS
      </h2>

      <div className="mt-3 grid md:grid-cols-2 gap-5">
        {advisers.map((a) => (
          <Card key={a.id} className="p-0">
            {/* header with adviser name and maroon underline */}
            <div className="px-4 pt-3 pb-2">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
                <Users size={16} className="text-neutral-500" />
                {a.name}
              </div>
              <div className="mt-2 h-[2px] w-full bg-neutral-200">
                <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 180 }} />
              </div>
            </div>

            {/* teams */}
            <div className="px-4 pb-4 grid grid-cols-3 gap-4">
              {a.teams.map((t) => (
                <div key={t.id} className="flex flex-col items-center gap-2">
                  <div className="text-sm font-medium text-neutral-800 text-center">{t.name}</div>
                  <Donut value={t.progress} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* ---------- RECENT ACTIVITY CREATED ---------- */}
      <h2 className="mt-8 text-[18px] font-semibold tracking-wide" style={{ color: MAROON }}>
        RECENT ACTIVITY CREATED
      </h2>

      <Card className="mt-3 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="text-left px-4 py-3 w-16">NO</th>
              <th className="text-left px-4 py-3">Team</th>
              <th className="text-left px-4 py-3">Date Created</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3 w-12">Action</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r, idx) => (
              <tr key={r.id} className={idx % 2 ? "bg-neutral-50/60" : "bg-white"}>
                <td className="px-4 py-3 text-neutral-600">{idx + 1}.</td>
                <td className="px-4 py-3 font-medium text-neutral-800">{r.team}</td>
                <td className="px-4 py-3 text-neutral-700">{r.created}</td>
                <td className="px-4 py-3 text-neutral-700">{r.date}</td>
                <td className="px-4 py-3 text-neutral-700">{r.time}</td>
                <td className="px-4 py-3">
                  <Badge tone="soft">Pending</Badge>
                </td>
                <td className="px-2 py-3">
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 cursor-pointer">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* ---------- CALENDAR ---------- */}
      <h2 className="mt-8 text-[18px] font-semibold tracking-wide" style={{ color: MAROON }}>
        CALENDAR
      </h2>
      <Card className="mt-3 p-4">
        {/* month name chip */}
        <div className="w-full text-center">
          <span
            className="inline-block rounded-md px-3 py-[2px] text-xs font-medium text-white"
            style={{ backgroundColor: MAROON }}
          >
            {monthName}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-[40px_repeat(7,1fr)] gap-y-2 text-sm">
          {/* header row: blank for week column + days */}
          <div />
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <div key={d} className="text-center text-neutral-600">{d}</div>
          ))}

          {/* weeks with left week-number chips */}
          {monthWeeks.map((week, wi) => {
            const weekNum = wi + 1 + Number(new Date(today.getFullYear(), today.getMonth(), 1).getDay() > 1 ? 0 : 0);
            return (
              <React.Fragment key={wi}>
                <div className="grid place-items-center">
                  <span
                    className="rounded-md px-2 py-[2px] text-xs font-medium text-white"
                    style={{ backgroundColor: MAROON_DARK }}
                  >
                    {String(weekNum + 39)}{/* visual-only running count like screenshot (40..45) */}
                  </span>
                </div>
                {week.map((d, di) => {
                  const isToday =
                    d &&
                    d.getDate() === today.getDate() &&
                    d.getMonth() === today.getMonth() &&
                    d.getFullYear() === today.getFullYear();

                  return (
                    <div key={di} className="h-10 grid place-items-center">
                      {d ? (
                        <span
                          className={
                            "inline-flex items-center justify-center h-7 w-7 rounded-md " +
                            (isToday
                              ? "text-white"
                              : "text-neutral-700")
                          }
                          style={isToday ? { backgroundColor: MAROON } : {}}
                        >
                          {d.getDate()}
                        </span>
                      ) : (
                        <span className="h-7 w-7" />
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
