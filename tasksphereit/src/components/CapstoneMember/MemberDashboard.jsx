import React, { useEffect, useMemo, useState } from "react";
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

// Firestore
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";

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

/* -------------------- Live (no static data) -------------------- */
const COLOR = {
  todo: "#FABC3F",
  inprogress: "#809D3C",
  toreview: "#578FCA",
  completed: "#4BC0C0",
  missed: "#FF6384",
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
 function MemberDashboard() {
  const uid = typeof window !== "undefined" ? localStorage.getItem("uid") : null;
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [weeklyCounts, setWeeklyCounts] = useState({ todo: 0, inprogress: 0, toreview: 0, completed: 0, missed: 0 });

  const to12h = (t) => {
    if (!t) return "";
    const [H, M] = String(t).split(":").map(Number);
    const ampm = H >= 12 ? "PM" : "AM";
    const hh = ((H + 11) % 12) + 1;
    return `${hh}:${String(M || 0).padStart(2, "0")} ${ampm}`;
  };
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtDate = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return "";
    const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
    return `${MONTHS[(m || 1) - 1]} ${Number(d || 1)}, ${y}`;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Load all task collections then filter by assignee uid
        const cols = [
          { tag: "Title Defense", coll: "titleDefenseTasks" },
          { tag: "Oral Defense",  coll: "oralDefenseTasks" },
          { tag: "Final Defense", coll: "finalDefenseTasks" },
          { tag: "Final Re-Defense", coll: "finalRedefenseTasks" },
        ];
        const snaps = await Promise.all(cols.map((c) => getDocs(collection(db, c.coll))));
        const all = [];
        snaps.forEach((s, i) => {
          const tag = cols[i].tag;
          s.forEach((dx) => {
            const d = dx.data() || {};
            all.push({ id: dx.id, tag, ...d });
          });
        });

        const mine = all.filter((t) => Array.isArray(t.assignees) && t.assignees.some((a) => a?.uid === uid));

        const upcoming = mine
          .filter((t) => typeof t.dueAtMs === "number" && t.dueAtMs >= Date.now())
          .sort((a, b) => (a.dueAtMs || 0) - (b.dueAtMs || 0))
          .slice(0, 3)
          .map((t) => ({ id: t.id, tag: t.tag, team: t.team?.name || "—", date: fmtDate(t.dueDate || ""), time: to12h(t.dueTime || "") }));
        if (alive) setUpcomingTasks(upcoming);

        const counts = { todo: 0, inprogress: 0, toreview: 0, completed: 0, missed: 0 };
        const now = Date.now();
        mine.forEach((t) => {
          const s = String(t.status || "To Do").toLowerCase();
          if (s.includes("review")) counts.toreview++;
          else if (s.includes("progress")) counts.inprogress++;
          else if (s.includes("complete")) counts.completed++;
          else counts.todo++;
          if (typeof t.dueAtMs === "number" && t.dueAtMs < now && (t.status || "") !== "Completed") counts.missed++;
        });
        if (alive) setWeeklyCounts(counts);
      } catch (e) {
        console.error("MemberDashboard load failed:", e);
        if (alive) {
          setUpcomingTasks([]);
          setWeeklyCounts({ todo: 0, inprogress: 0, toreview: 0, completed: 0, missed: 0 });
        }
      }
    })();
    return () => { alive = false; };
  }, [uid]);
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
          <Bar
            data={{
              labels: ["To Do", "In Progress", "To Review", "Completed", "Missed"],
              datasets: [
                {
                  label: "Weekly Summary",
                  data: [
                    weeklyCounts.todo,
                    weeklyCounts.inprogress,
                    weeklyCounts.toreview,
                    weeklyCounts.completed,
                    weeklyCounts.missed,
                  ],
                  backgroundColor: [
                    COLOR.todo,
                    COLOR.inprogress,
                    COLOR.toreview,
                    COLOR.completed,
                    COLOR.missed,
                  ],
                },
              ],
            }}
            options={{ responsive: true }}
          />
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-[0_6px_18px_rgba(0,0,0,0.05)] p-4 flex items-center justify-center">
          <div style={{ maxWidth: "300px", maxHeight: "300px" }}>
            <Pie
              data={{
                labels: ["To Do", "In Progress", "Completed", "Missed"],
                datasets: [
                  {
                    data: [
                      weeklyCounts.todo,
                      weeklyCounts.inprogress,
                      weeklyCounts.completed,
                      weeklyCounts.missed,
                    ],
                    backgroundColor: [
                      COLOR.todo,
                      COLOR.inprogress,
                      COLOR.completed,
                      COLOR.missed,
                    ],
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: true }}
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

export default MemberDashboard
