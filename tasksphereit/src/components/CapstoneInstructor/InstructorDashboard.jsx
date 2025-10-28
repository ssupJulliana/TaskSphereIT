// src/components/CapstoneInstructor/InstructorDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, Users, MoreVertical } from "lucide-react";

/* ==== Firestore ==== */
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";

console.log("[Dash] Firebase app:", db.app?.name || "(unknown)");

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

const Donut = ({ value = 0 }) => {
  const clamped = Math.max(0, Math.min(100, value));
  const ring = `conic-gradient(${MAROON} ${clamped * 3.6}deg, #eee 0deg)`;
  return (
    <div className="relative h-20 w-20 rounded-full" style={{ background: ring }}>
      <div className="absolute inset-2 rounded-full bg-white grid place-items-center">
        <span className="text-sm font-semibold" style={{ color: MAROON }}>
          {clamped}%
        </span>
      </div>
    </div>
  );
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

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/* -------------------- Date/Time helpers -------------------- */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function toDateObj(yyyy_mm_dd, hhmm = "00:00") {
  if (!yyyy_mm_dd) return null;
  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  const [H, M] = (hhmm || "00:00").split(":").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, (m || 1) - 1, d || 1, H || 0, M || 0, 0, 0);
}

function fmtDate(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return "";
  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  return `${MONTHS[(m || 1) - 1]} ${Number(d)}, ${y}`;
}
function to12h(t) {
  if (!t) return "";
  const [H, M] = t.split(":").map(Number);
  const ampm = H >= 12 ? "PM" : "AM";
  const hh = ((H + 11) % 12) + 1;
  return `${hh}:${String(M).padStart(2, "0")} ${ampm}`;
}
function fmtTimeRange(start, end) {
  const a = to12h(start);
  const b = to12h(end);
  return b ? `${a} - ${b}` : a;
}
function fmtDateTimeHuman(d) {
  if (!d) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* -------------------- Page -------------------- */
export default function InstructorDashboard() {
  const today = new Date();
  const monthWeeks = useMemo(() => getMonthMatrix(today), [today]);
  const monthName = today.toLocaleString("default", { month: "long" });

  // UPCOMING (nearest per team)
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [upcomingPerTeam, setUpcomingPerTeam] = useState([]);

  // RECENT activity created
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [recentCreated, setRecentCreated] = useState([]);

  // Advisers + progress data (dynamic)
  const [loadingAdvisers, setLoadingAdvisers] = useState(true);
  const [advisersData, setAdvisersData] = useState([]); // [{name, teams:[{id,name,progress}]}]

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingUpcoming(true);
      setLoadingRecent(true);
      setLoadingAdvisers(true);
      try {
        // Pull all needed data in parallel
        const [
          titleSnap,
          oralSnap,
          finalSnap,
          manusSnap,
          teamsSnap,
        ] = await Promise.all([
          getDocs(collection(db, "titleDefenseSchedules")),
          getDocs(collection(db, "oralDefenseSchedules")),
          getDocs(collection(db, "finalDefenseSchedules")),
          getDocs(collection(db, "manuscriptSubmissions")),
          getDocs(collection(db, "teams")),
        ]);

        /* ---------------- Normalize helpers ---------------- */
        const normalizeSched = (snap, tagLabel, opts = {}) => {
          const {
            useSingleTimeField = false,
            singleTimeFieldName = "time",
            statusField = "verdict",
          } = opts;

          const arr = [];
          snap.forEach((docX) => {
            const data = docX.data() || {};
            const teamName = (data.teamName || "").toString().trim();
            const teamId = (data.teamId || "").toString().trim() || null;
            const date = (data.date || "").toString().trim();

            let timeStart = (data.timeStart || "00:00").toString().trim();
            let timeEnd = (data.timeEnd || "").toString().trim();
            if (useSingleTimeField) {
              const t = (data[singleTimeFieldName] || "00:00").toString().trim();
              timeStart = t;
              timeEnd = "";
            }

            const when = toDateObj(date, timeStart);
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
            const status = (data[statusField] || "Pending").toString();

            arr.push({
              id: docX.id,
              tag: tagLabel,
              team: teamName,
              teamKey: teamId || teamName,
              date,
              timeStart,
              timeEnd,
              when,
              createdAt,
              status,
            });
          });
          return arr;
        };

        const titleRows = normalizeSched(titleSnap, "Title Defense");
        const oralRows  = normalizeSched(oralSnap,  "Oral Defense");
        const finalRows = normalizeSched(finalSnap, "Final Defense");
        const manusRows = normalizeSched(manusSnap, "Manuscript Submission", {
          useSingleTimeField: true,
          singleTimeFieldName: "time",
        });

        /* ---------------- UPCOMING (nearest per team) ---------------- */
        const now = new Date();
        const futureOnly = [...titleRows, ...oralRows, ...finalRows, ...manusRows].filter(
          (r) => r.when && r.when >= now
        );
        const byTeamUpcoming = new Map();
        for (const item of futureOnly) {
          const key = item.teamKey || item.team;
          const prev = byTeamUpcoming.get(key);
          if (!prev || item.when < prev.when) byTeamUpcoming.set(key, item);
        }
        const resultUpcoming = Array.from(byTeamUpcoming.values()).sort((a, b) => a.when - b.when);
        if (alive) setUpcomingPerTeam(resultUpcoming);

        /* ---------------- RECENT ACTIVITY CREATED ---------------- */
        const allRows = [...titleRows, ...oralRows, ...finalRows, ...manusRows];
        const recentList = allRows
          .map((r) => {
            const timeText = r.timeEnd ? fmtTimeRange(r.timeStart, r.timeEnd) : to12h(r.timeStart);
            const createdKey = r.createdAt?.getTime?.() || (r.when ? r.when.getTime() : 0);
            return { ...r, timeText, _createdKey: createdKey };
          })
          .filter((r) => r._createdKey > 0)
          .sort((a, b) => b._createdKey - a._createdKey)
          .slice(0, 10);
        if (alive) setRecentCreated(recentList);

        /* ---------------- TEAMS’ PROGRESS (dynamic) ---------------- */
        // Teams with adviser grouped => compute progress per team:
        // Progress = (# of schedule types PASSED) * 25
        // A type is done if ANY doc for that team has verdict === "Passed"
        const teamMeta = [];
        teamsSnap.forEach((docX) => {
          const data = docX.data() || {};
          teamMeta.push({
            id: docX.id,
            name: (data.name || "").toString().trim(),
            adviser: (data.adviser?.fullName || "-").toString().trim() || "-",
          });
        });

        // Build quick lookup for "has passed" per type per teamKey
        const hasPassed = (rows, teamKey) =>
          rows.some(
            (r) =>
              (r.teamKey || r.team) === teamKey &&
              typeof r.status === "string" &&
              r.status.toLowerCase() === "passed"
          );

        const makeTeamProgress = (team) => {
          const key = team.id || team.name;
          const passedTitle = hasPassed(titleRows, key);
          const passedOral  = hasPassed(oralRows, key);
          const passedFinal = hasPassed(finalRows, key);
          const passedManus = hasPassed(manusRows, key);

          const count = [passedTitle, passedManus, passedOral, passedFinal].filter(Boolean).length;
          return count * 25; // 0, 25, 50, 75, 100
        };

        // Group by adviser
        const buckets = new Map(); // adviserName -> {name, teams:[{id,name,progress}]}
        for (const t of teamMeta) {
          const prog = makeTeamProgress(t);
          const entry = buckets.get(t.adviser) || { name: t.adviser, teams: [] };
          entry.teams.push({ id: t.id, name: t.name, progress: prog });
          buckets.set(t.adviser, entry);
        }

        // Sort advisers alpha; sort each adviser’s teams alpha
        const advisersArr = Array.from(buckets.values())
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((a) => ({
            ...a,
            teams: a.teams.sort((x, y) => x.name.localeCompare(y.name)),
          }));

        if (alive) setAdvisersData(advisersArr);
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
        if (alive) {
          setUpcomingPerTeam([]);
          setRecentCreated([]);
          setAdvisersData([]);
        }
      } finally {
        if (alive) {
          setLoadingUpcoming(false);
          setLoadingRecent(false);
          setLoadingAdvisers(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="p-6">
      {/* ---------- UPCOMING ACTIVITY ---------- */}
      <h2 className="text-[18px] font-semibold tracking-wide" style={{ color: MAROON }}>
        UPCOMING ACTIVITY
      </h2>

      {loadingUpcoming ? (
        <div className="mt-3 text-sm text-neutral-500">Loading upcoming activities…</div>
      ) : upcomingPerTeam.length === 0 ? (
        <div className="mt-3 text-sm text-neutral-500">No upcoming activities.</div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-4">
          {upcomingPerTeam.map((u) => (
            <Card key={`${u.tag}-${u.id}`} className="w-[300px]">
              <div
                className="rounded-t-xl px-3 py-2 text-white text-sm font-semibold"
                style={{ backgroundColor: MAROON }}
              >
                {u.tag}
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 text-[15px] font-medium text-neutral-800">
                  <Users size={16} className="text-neutral-500" />
                  {u.team || "—"}
                </div>
                <div className="mt-2 flex items-center gap-2 text-neutral-700">
                  <Calendar size={16} className="text-neutral-500" />
                  {fmtDate(u.date)}
                </div>
                <div className="mt-1 flex items-center gap-2 text-neutral-700">
                  <Clock size={16} className="text-neutral-500" />
                  {fmtTimeRange(u.timeStart, u.timeEnd)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- TEAMS’ PROGRESS (dynamic from Firestore) ---------- */}
      <h2 className="mt-8 text-[18px] font-semibold tracking-wide" style={{ color: MAROON }}>
        TEAMS’ PROGRESS
      </h2>

      {loadingAdvisers ? (
        <div className="mt-3 text-sm text-neutral-500">Loading advisers and progress…</div>
      ) : advisersData.length === 0 ? (
        <div className="mt-3 text-sm text-neutral-500">No advisers/teams found.</div>
      ) : (
        <div className="mt-3 grid md:grid-cols-2 gap-5">
          {advisersData.map((a) => (
            <Card key={a.name} className="p-0">
              <div className="px-4 pt-3 pb-2">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <Users size={16} className="text-neutral-500" />
                  {a.name}
                </div>
                <div className="mt-2 h-[2px] w-full bg-neutral-200">
                  <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 180 }} />
                </div>
              </div>

              <div className="px-4 pb-4 grid grid-cols-3 gap-4">
                {a.teams.map((t) => (
                  <div key={t.id} className="flex flex-col items-center gap-2">
                    <div className="text-sm font-medium text-neutral-800 text-center">
                      {t.name}
                    </div>
                    <Donut value={t.progress} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- RECENT ACTIVITY CREATED ---------- */}
      <h2 className="mt-8 text-[18px] font-semibold tracking-wide" style={{ color: MAROON }}>
        RECENT ACTIVITY CREATED
      </h2>

      <Card className="mt-3 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="text-left px-4 py-3 w-16">NO</th>
              <th className="text-left px-4 py-3">Activity</th>
              <th className="text-left px-4 py-3">Team</th>
              <th className="text-left px-4 py-3">Date Created</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3 w-12">Action</th>
            </tr>
          </thead>
          <tbody>
            {loadingRecent ? (
              <tr>
                <td className="px-4 py-3 text-neutral-600" colSpan={8}>
                  Loading…
                </td>
              </tr>
            ) : recentCreated.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-neutral-600" colSpan={8}>
                  No recent activity.
                </td>
              </tr>
            ) : (
              recentCreated.map((r, idx) => (
                <tr key={`${r.tag}-${r.id}`} className={idx % 2 ? "bg-neutral-50/60" : "bg-white"}>
                  <td className="px-4 py-3 text-neutral-600">{idx + 1}.</td>
                  <td className="px-4 py-3 font-medium text-neutral-800">{r.tag}</td>
                  <td className="px-4 py-3 text-neutral-800">{r.team || "—"}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {r.createdAt ? fmtDateTimeHuman(r.createdAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{fmtDate(r.date)}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.timeText}</td>
                  <td className="px-4 py-3">
                    <Badge tone="soft">{r.status || "Pending"}</Badge>
                  </td>
                  <td className="px-2 py-3">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 cursor-pointer">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* ---------- CALENDAR ---------- */}
      <h2 className="mt-8 text-[18px] font-semibold tracking-wide" style={{ color: MAROON }}>
        CALENDAR
      </h2>
      <Card className="mt-3 p-4">
        <div className="w-full text-center">
          <span
            className="inline-block rounded-md px-3 py-[2px] text-xs font-medium text-white"
            style={{ backgroundColor: MAROON }}
          >
            {monthName}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-[40px_repeat(7,1fr)] gap-y-2 text-sm">
          <div />
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <div key={d} className="text-center text-neutral-600">
              {d}
            </div>
          ))}

          {monthWeeks.map((week, wi) => {
            const weekNum =
              wi +
              1 +
              Number(new Date(today.getFullYear(), today.getMonth(), 1).getDay() > 1 ? 0 : 0);
            return (
              <React.Fragment key={wi}>
                <div className="grid place-items-center">
                  <span
                    className="rounded-md px-2 py-[2px] text-xs font-medium text-white"
                    style={{ backgroundColor: MAROON_DARK }}
                  >
                    {String(weekNum + 39)}
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
      </Card>
    </div>
  );
}
