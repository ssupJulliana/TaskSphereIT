// src/components/ProjectManager/ProjectManagerDashboard.jsx
import React, { useMemo } from "react";
import { Users } from "lucide-react";

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
  {
    name: "Mendoza, Et Al",
    chapter: "Chapter 3",
    date: "Feb 5, 2025",
    time: "8:00 AM",
    color: "#7C9C3B",
  },
  {
    name: "Addrialene M",
    chapter: "Chapter 2",
    date: "Feb 2, 2025",
    time: "8:00 AM",
    color: "#D9A81E",
  },
  {
    name: "Harzwel L",
    chapter: "Chapter 3",
    date: "Feb 5, 2025",
    time: "8:00 AM",
    color: "#4C79B7",
  },
  {
    name: "Julliana C",
    chapter: "Chapter 3",
    date: "Feb 5, 2025",
    time: "8:00 AM",
    color: "#8CB55E",
  },
  {
    name: "Alejandro F",
    chapter: "Chapter 3",
    date: "Feb 5, 2025",
    time: "8:00 AM",
    color: "#7FA042",
  },
];

// weekly counts (approx. like screenshot)
const WEEKLY = [
  { key: "todo", label: "To Do", value: 4, color: COLORS.todo },
  { key: "inprogress", label: "In Progress", value: 9, color: COLORS.inprogress },
  { key: "toreview", label: "To Review", value: 14, color: COLORS.toreview },
  { key: "completed", label: "Completed", value: 16, color: COLORS.completed },
  { key: "missed", label: "Missed", value: 1, color: COLORS.missed },
];

// donut segments (percent distribution)
const DONUT_SEGMENTS = [
  { key: "todo", label: "To Do", pct: 30, color: COLORS.todo },
  { key: "inprogress", label: "In Progress", pct: 15, color: COLORS.inprogress },
  { key: "toreview", label: "To Review", pct: 20, color: COLORS.toreview },
  { key: "completed", label: "Completed", pct: 30, color: COLORS.completed },
  { key: "missed", label: "Missed", pct: 5, color: COLORS.missed },
];

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
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + innerH}
        stroke="#BDBDBD"
        strokeWidth="1"
      />
      <line
        x1={padding.left}
        y1={padding.top + innerH}
        x2={padding.left + innerW}
        y2={padding.top + innerH}
        stroke="#BDBDBD"
        strokeWidth="1"
      />
      {/* y ticks */}
      {Array.from({ length: 5 }).map((_, i) => {
        const yVal = (i * maxY) / 4;
        const y = padding.top + innerH - (yVal / maxY) * innerH;
        return (
          <g key={i}>
            <line
              x1={padding.left - 4}
              x2={padding.left}
              y1={y}
              y2={y}
              stroke="#BDBDBD"
              strokeWidth="1"
            />
            <text
              x={padding.left - 10}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              fill="#6B7280"
            >
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
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx="6"
              ry="6"
              fill={d.color}
            />
            <text
              x={x + barW / 2}
              y={padding.top + innerH + 18}
              textAnchor="middle"
              fontSize="11"
              fill="#6B7280"
            >
              {/* short labels like screenshot */}
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

  // Convert percentages to dash lengths
  const arcs = useMemo(() => {
    let acc = 0;
    return segments.map((s) => {
      const arc = (s.pct / 100) * c;
      const gap = c - arc;
      const offset = acc;
      acc += arc;
      return { ...s, arc, gap, offset };
    });
  }, [segments, c]);

  return (
    <div className="relative grid place-items-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {/* track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#EEE"
            strokeWidth={stroke}
          />
          {/* segments */}
          {arcs.map((a, i) => (
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
        {/* center text */}
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          style={{ fontSize: 44, fontWeight: 800, fill: MAROON }}
        >
          {centerText}
        </text>
      </svg>
    </div>
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
            <h3
              className="text-xl font-extrabold tracking-wide"
              style={{ color: MAROON }}
            >
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
            <h3
              className="text-xl font-extrabold tracking-wide"
              style={{ color: MAROON }}
            >
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
    </div>
  );
};

export default ProjectManagerDashboard;
