import React, { useMemo } from "react";
import { Calendar, Clock, Users, MoreVertical } from "lucide-react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Registering Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
    <span
      className={
        "inline-flex items-center rounded-md px-2 py-[2px] text-xs font-medium " +
        map[tone]
      }
    >
      {children}
    </span>
  );
};

/* -------------------- Demo data -------------------- */
const upcoming = [
  {
    id: 1,
    tag: "Title Defense",
    team: "Aguas, Et Al",
    date: "Jan 11, 2025",
    time: "8:00 AM",
  },
  {
    id: 2,
    tag: "Title Defense",
    team: "Bernardo, Et Al",
    date: "Jan 11, 2025",
    time: "9:00 AM",
  },
  {
    id: 3,
    tag: "Title Defense",
    team: "Hawke, Et Al",
    date: "Jan 11, 2025",
    time: "10:00 AM",
  },
];

const weeklyData = {
  labels: ["To Do", "In Progress", "To Review", "Completed", "Missed"],
  datasets: [
    {
      label: "Weekly Summary",
      data: [3, 2, 5, 4, 1], // Static values for the bar chart
      backgroundColor: [
        "#FABC3F", // To Do
        "#809D3C", // In Progress
        "#578FCA", // To Review
        "#4BC0C0", // Completed
        "#FF6384", // Missed
      ],
    },
  ],
};

const pieData = {
  labels: ["To Do", "In Progress", "Completed", "Missed"],
  datasets: [
    {
      data: [3, 2, 5, 1], // Static values for the pie chart
      backgroundColor: ["#FABC3F", "#809D3C", "#4BC0C0", "#FF6384"], // Matching colors
    },
  ],
};

const upcomingTasks = upcoming;
const statusCounts = {
  "To Do": 0,
  "In Progress": 0,
  "To Review": 0,
  Completed: 0,
  Missed: 0,
};

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
export default function MemberDashboard() {
  const today = new Date();
  const monthWeeks = useMemo(() => getMonthMatrix(today), [today]);
  const monthName = today.toLocaleString("default", { month: "long" });

  return (
    <div className="p-6">
      {/* ---------- UPCOMING TASK ---------- */}
      <h2 className="text-[18px] font-semibold tracking-wide text-[#6A0F14]">
        UPCOMING TASK
      </h2>

      <div className="mt-3 flex flex-wrap gap-4">
        {upcomingTasks.map((u) => (
          <Card key={u.id} className="w-[300px]">
            {/* maroon header band */}
            <div
              className="rounded-t-xl px-3 py-2 text-white text-sm font-semibold"
              style={{ backgroundColor: MAROON }}
            >
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

      {/* ---------- WEEKLY SUMMARY ---------- */}
      <h2 className="mt-8 text-[18px] font-semibold tracking-wide text-[#6A0F14]">
        WEEKLY SUMMARY & STATUS
      </h2>

      <div className="mt-3 grid md:grid-cols-2 gap-5">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-[0_6px_18px_rgba(0,0,0,0.05)] p-4">
          <Bar data={weeklyData} options={{ responsive: true }} />
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-[0_6px_18px_rgba(0,0,0,0.05)] p-4 flex items-center justify-center">
          <div style={{ maxWidth: "300px", maxHeight: "300px" }}>
            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
              }}
            />
          </div>
        </div>
      </div>

      {/* ---------- CALENDAR ---------- */}
      <h2 className="mt-8 text-[18px] font-semibold tracking-wide text-[#6A0F14]">
        CALENDAR
      </h2>

      <div className="mt-3 bg-white rounded-xl border border-neutral-200 shadow-[0_6px_18px_rgba(0,0,0,0.05)] p-4">
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
            <div key={d} className="text-center text-neutral-600">
              {d}
            </div>
          ))}

          {/* weeks with left week-number chips */}
          {monthWeeks.map((week, wi) => {
            const weekNum =
              wi +
              1 +
              Number(
                new Date(today.getFullYear(), today.getMonth(), 1).getDay() > 1
                  ? 0
                  : 0
              );
            return (
              <React.Fragment key={wi}>
                <div className="grid place-items-center">
                  <span
                    className="rounded-md px-2 py-[2px] text-xs font-medium text-white"
                    style={{ backgroundColor: MAROON_DARK }}
                  >
                    {String(weekNum + 39)}
                    {/* visual-only running count like screenshot (40..45) */}
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
                            (isToday ? "text-white" : "text-neutral-700")
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
      </div>
    </div>
  );
}
