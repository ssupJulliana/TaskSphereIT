// src/components/ProjectManager/ProjectManagerDashboard.jsx
import React, { useMemo, useState } from "react";
import { Users, CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const MAROON = "#6A0F14";

// brand/status colors
const COLORS = {
  todo: "#D9A81E",
  inprogress: "#7C9C3B",
  toreview: "#6FA8DC",
  completed: "#8E5BAA",
  missed: "#E5534B",
};

const UPCOMING = [
  { name: "Mendoza, Et Al",   chapter: "Chapter 3", date: "Feb 5, 2025", time: "8:00 AM",  color: "#7C9C3B" },
  { name: "Addrialene M",     chapter: "Chapter 2", date: "Feb 2, 2025", time: "8:00 AM",  color: "#D9A81E" },
  { name: "Harzwel L",        chapter: "Chapter 3", date: "Feb 5, 2025", time: "8:00 AM",  color: "#4C79B7" },
  { name: "Julliana C",       chapter: "Chapter 3", date: "Feb 5, 2025", time: "8:00 AM",  color: "#8CB55E" },
  { name: "Alejandro F",      chapter: "Chapter 3", date: "Feb 5, 2025", time: "8:00 AM",  color: "#7FA042" },
];

// weekly counts (approx. like screenshot)
const WEEKLY = [
  { key: "todo",       label: "To Do",       value: 4,  color: COLORS.todo },
  { key: "inprogress", label: "In Progress", value: 9,  color: COLORS.inprogress },
  { key: "toreview",   label: "To Review",   value: 14, color: COLORS.toreview },
  { key: "completed",  label: "Completed",   value: 16, color: COLORS.completed },
  { key: "missed",     label: "Missed",      value: 1,  color: COLORS.missed },
];

// donut segments (percent distribution)
const DONUT_SEGMENTS = [
  { key: "todo",       label: "To Do",       pct: 30, color: COLORS.todo },
  { key: "inprogress", label: "In Progress", pct: 15, color: COLORS.inprogress },
  { key: "toreview",   label: "To Review",   pct: 20, color: COLORS.toreview },
  { key: "completed",  label: "Completed",   pct: 30, color: COLORS.completed },
  { key: "missed",     label: "Missed",      pct: 5,  color: COLORS.missed },
];

/* ============================
   Recent Tasks Created (table)
   ============================ */
const RECENT_TASKS = [
  { no: 1, assigned: "Julliana C",  task: "Chapter 3", subtask: "Developments",   element: "Peopleware", created: "Feb 4, 2025",  due: "Feb 7, 2025",  time: "8:30 AM",  status: "To Review",  phase: "Design" },
  { no: 2, assigned: "John Reagan S", task: "Chapter 3", subtask: "Implementation", element: "Hardware",   created: "Feb 7, 2025",  due: "Feb 11, 2025", time: "11:50 AM", status: "In Progress", phase: "Design" },
  { no: 3, assigned: "Justine P",   task: "Chapter 3", subtask: "Implementation", element: "Software",   created: "Feb 11, 2025", due: "Feb 13, 2025", time: "10:00 AM", status: "To Do",      phase: "Design" },
  { no: 4, assigned: "Addrialene G", task: "Chapter 3", subtask: "Implementation", element: "Peopleware", created: "Feb 12, 2025", due: "Feb 15, 2025", time: "11:00 AM", status: "To Do",      phase: "Design" },
];

const statusColor = (s) =>
  s === "To Review"   ? COLORS.toreview :
  s === "In Progress" ? COLORS.inprogress :
  s === "To Do"       ? COLORS.todo :
  s === "Completed"   ? COLORS.completed :
                        COLORS.missed;

// ---- small UI bits -------------------------------------------------------
const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-neutral-200 rounded-2xl shadow ${className}`}>
    {children}
  </div>
);

const UpcomingCard = ({ item }) => (
  <div className="w-[300px]">
    <div className="rounded-xl shadow-sm border border-neutral-200 bg-white overflow-hidden">
      <div
        className="px-4 py-2 text-white text-sm font-semibold flex items-center gap-2"
        style={{ backgroundColor: item.color }}
      >
        <Users className="w-4 h-4" />
        <span>{item.name}</span>
      </div>
      <div className="p-4 text-sm">
        <div className="text-neutral-800">{item.chapter}</div>
        <div className="mt-2 text-neutral-600">{item.date}</div>
        <div className="text-neutral-600">{item.time}</div>
      </div>
    </div>
  </div>
);

const Legend = ({ items }) => (
  <ul className="space-y-3">
    {items.map((it) => (
      <li key={it.key} className="flex items-center gap-3 text-sm">
        <span
          className="inline-block w-3 h-3 rounded-full border border-black/10"
          style={{ backgroundColor: it.color }}
        />
        <span className="text-neutral-700">{it.label}</span>
      </li>
    ))}
  </ul>
);

// ---- charts --------------------------------------------------------------
const WeeklyBarChart = ({ data, maxY = 20, width = 560, height = 260 }) => {
  const padding = { top: 16, right: 16, bottom: 30, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const barW = innerW / data.length - 22;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[260px]">
      {/* axes */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#BDBDBD" strokeWidth="1" />
      <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#BDBDBD" strokeWidth="1" />
      {/* y ticks */}
      {Array.from({ length: 5 }).map((_, i) => {
        const yVal = (i * maxY) / 4;
        const y = padding.top + innerH - (yVal / maxY) * innerH;
        return (
          <g key={i}>
            <line x1={padding.left - 4} x2={padding.left} y1={y} y2={y} stroke="#BDBDBD" strokeWidth="1" />
            <text x={padding.left - 10} y={y} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#6B7280">
              {yVal}
            </text>
          </g>
        );
      })}
      {/* bars */}
      {data.map((d, idx) => {
        const x = padding.left + idx * (innerW / data.length) + 12;
        const h = (d.value / maxY) * innerH;
        const y = padding.top + innerH - h;
        return (
          <g key={d.key}>
            <rect x={x} y={y} width={barW} height={h} rx="6" ry="6" fill={d.color} />
            <text x={x + barW / 2} y={padding.top + innerH + 18} textAnchor="middle" fontSize="11" fill="#6B7280">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const Donut = ({ segments, centerText = "40%" }) => {
  const size = 360;
  const stroke = 48;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const arcs = useMemo(() => {
    let acc = 0;
    return segments.map((s) => {
      const arc = (s.pct / 100) * c;
      const offset = acc;
      acc += arc;
      return { ...s, arc, offset };
    });
  }, [segments, c]);

  return (
    <div className="relative grid place-items-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEE" strokeWidth={stroke} />
          {arcs.map((a) => (
            <circle
              key={a.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${a.arc} ${c - a.arc}`}
              strokeDashoffset={-a.offset}
            />
          ))}
        </g>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" style={{ fontSize: 44, fontWeight: 800, fill: MAROON }}>
          {centerText}
        </text>
      </svg>
    </div>
  );
};

/* ============================
   Simple Calendar (Month view)
   ============================ */
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// sample events to mimic your screenshot
const SAMPLE_EVENTS = [
  { date: "2025-10-12", title: "2: Refine: Chapter 2 (Missed)" },
  { date: "2025-10-13", title: "2: Refine: Chapter 2 (Missed)" },
  { date: "2025-10-22", title: "2: Refine: Chapter 1 (To Do)" },
  { date: "2025-10-23", title: "2: Refine: Chapter 1 (To Do)" },
  { date: "2025-10-07", title: "Kaycelle David", pill: true },
];

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function buildMonthMatrix(year, monthIndex) {
  // monthIndex: 0..11
  const first = new Date(year, monthIndex, 1);
  const startDay = first.getDay(); // 0..6 Sun..Sat
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells = [];
  // preceding blanks
  for (let i = 0; i < startDay; i++) cells.push(null);
  // month days
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  // pad to 6 rows * 7 cols = 42 cells
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);

  const matrix = [];
  for (let i = 0; i < cells.length; i += 7) matrix.push(cells.slice(i, i + 7));
  return matrix;
}

const CalendarCard = () => {
  // default to October 2025 to mirror screenshot
  const [view, setView] = useState("month"); // "month" | "week" | "day" (only month visual here)
  const [cursor, setCursor] = useState(new Date(2025, 9, 1)); // Oct 2025

  const title = `${monthNames[cursor.getMonth()]} ${cursor.getFullYear()}`;
  const matrix = useMemo(
    () => buildMonthMatrix(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );

  const goPrev = () => {
    if (view === "month") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  };
  const goNext = () => {
    if (view === "month") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  };

  return (
    <Card>
      {/* Header controls */}
      <div className="px-5 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="h-8 w-8 grid place-items-center rounded-md text-white"
            style={{ background: MAROON }}
            onClick={goPrev}
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="h-8 w-8 grid place-items-center rounded-md text-white"
            style={{ background: MAROON }}
            onClick={goNext}
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            disabled
            className="ml-3 h-8 px-3 rounded-md text-sm font-medium bg-neutral-200 text-neutral-500 cursor-not-allowed"
          >
            Today
          </button>
        </div>

        <div className="text-sm font-semibold" style={{ color: MAROON }}>
          {title}
        </div>

        <div className="flex items-center gap-2">
          {["Month", "Week", "Day"].map((label) => {
            const key = label.toLowerCase();
            const active = view === key;
            return (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`h-8 px-4 rounded-md text-sm font-medium border ${
                  active
                    ? "text-white"
                    : "text-neutral-700 bg-white"
                }`}
                style={{
                  background: active ? MAROON : undefined,
                  borderColor: active ? MAROON : "#e5e7eb",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-3 h-[2px] w-full" style={{ background: MAROON }} />

      {/* Grid */}
      <div className="p-5">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-xs text-neutral-500 mb-2">
          {dayNames.map((d) => (
            <div key={d} className="text-center">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded-lg overflow-hidden">
          {matrix.flat().map((cell, i) => {
            const id = `cell-${i}`;
            const isBlank = !cell;
            const cellYmd = cell ? ymd(cell) : "";
            const events = SAMPLE_EVENTS.filter((e) => e.date === cellYmd);
            const is20th = cell && cell.getDate() === 20;

            return (
              <div
                key={id}
                className={`min-h-[92px] bg-white relative ${isBlank ? "bg-neutral-50" : ""}`}
              >
                {/* date number */}
                {!isBlank && (
                  <div className="absolute top-2 right-2 text-xs text-neutral-500">
                    {cell.getDate()}
                  </div>
                )}

                {/* purple person pill*/}
                {events.some((e) => e.pill) && (
                  <div className="absolute left-3 top-6">
                    <span className="text-[11px] font-semibold text-white px-2 py-0.5 rounded-md" style={{ background: "#8B5CF6" }}>
                      Kaycelle David
                    </span>
                  </div>
                )}

                {/* maroon event chips */}
                <div className="absolute left-3 right-3 top-10 space-y-1">
                  {events
                    .filter((e) => !e.pill)
                    .map((e, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] text-white px-2 py-0.5 rounded"
                        style={{ background: MAROON }}
                      >
                        {e.title}
                      </div>
                    ))}
                </div>

                {/* light highlighted day (20) */}
                {is20th && (
                  <div className="absolute top-2 left-2 h-6 w-6 rounded-full grid place-items-center text-[11px] text-white" style={{ background: MAROON }}>
                    20
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

// ---- main ---------------------------------------------------------------
const ProjectManagerDashboard = () => {
  return (
    <div className="space-y-8">
      {/* UPCOMING */}
      <section className="space-y-3">
        <h3 className="text-xl font-extrabold tracking-wide" style={{ color: MAROON }}>
          UPCOMING TASKS
        </h3>
        <div className="flex flex-wrap gap-5">
          {UPCOMING.map((u, i) => (
            <UpcomingCard key={i} item={u} />
          ))}
        </div>
      </section>

      {/* BOTTOM ROW: Weekly Summary + Team Progress */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Summary */}
        <Card>
          <div className="px-6 pt-5">
            <h3 className="text-xl font-extrabold tracking-wide" style={{ color: MAROON }}>
              WEEKLY SUMMARY
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 xl:col-span-8">
                <WeeklyBarChart data={WEEKLY} />
              </div>
              <div className="col-span-12 xl:col-span-4">
                <Legend items={WEEKLY} />
              </div>
            </div>
          </div>
        </Card>

        {/* Team Progress */}
        <Card>
          <div className="px-6 pt-5">
            <h3 className="text-xl font-extrabold tracking-wide" style={{ color: MAROON }}>
              TEAM PROGRESS
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-12 xl:col-span-8">
                <Donut segments={DONUT_SEGMENTS} centerText="40%" />
              </div>
              <div className="col-span-12 xl:col-span-4">
                <Legend items={DONUT_SEGMENTS} />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* RECENT TASKS CREATED */}
      <section className="space-y-3">
        <h3 className="text-xl font-extrabold tracking-wide" style={{ color: MAROON }}>
          RECENT TASKS CREATED
        </h3>

        <div className="bg-white border border-neutral-200 rounded-[20px] shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-600">
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
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-6">Project Phase</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_TASKS.map((r) => (
                  <tr key={r.no} className="border-t border-neutral-200">
                    <td className="py-3 pl-6 pr-3">{r.no}.</td>
                    <td className="py-3 pr-3">{r.assigned}</td>
                    <td className="py-3 pr-3">{r.task}</td>
                    <td className="py-3 pr-3">{r.subtask}</td>
                    <td className="py-3 pr-3">{r.element}</td>
                    <td className="py-3 pr-3">{r.created}</td>
                    <td className="py-3 pr-3">{r.due}</td>
                    <td className="py-3 pr-3">{r.time}</td>
                    <td className="py-3 pr-3">
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: statusColor(r.status) }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 pr-6">{r.phase}</td>
                  </tr>
                ))}

                {RECENT_TASKS.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-neutral-500">
                      No recent tasks.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CALENDAR */}
      <section className="space-y-3">
        <h3 className="text-xl font-extrabold tracking-wide" style={{ color: MAROON }}>
          CALENDAR
        </h3>
        <CalendarCard />
      </section>
    </div>
  );
};

export default ProjectManagerDashboard;
