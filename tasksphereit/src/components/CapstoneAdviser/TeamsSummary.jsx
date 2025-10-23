import React, { useMemo, useState } from "react";
import { Users, ChevronRight, ChevronLeft, FileText } from "lucide-react";

/* ----------------------- SAMPLE DATA ----------------------- */
const TEAMS = [
  {
    id: "fittrack",
    name: "FitTrack",
    membersShort: "Aguas, Et Al",
    members: [
      { name: "Addriliane G Mendoza", role: "Project Manager" },
      { name: "Harzwel Zhen B Lacson", role: "Member" },
      { name: "Julliana N Castaneda", role: "Member" },
      { name: "Alejandro C Faustino", role: "Member" },
      { name: "Justine Pare", role: "Member" },
      { name: "John Reagan S Pinpin", role: "Member" },
    ],
    progress: { todo: 4, inprogress: 3, review: 2, done: 6, missed: 1 },
    tasks: [
      {
        no: 1,
        task: "Revise:",
        subtask: "Chapter 1",
        elements: "Introduction",
        dueDate: "Jan 25, 2025",
        time: "8:00 AM",
        revisions: "No Revisions",
      },
      {
        no: 2,
        task: "Prepare:",
        subtask: "Chapter 2",
        elements: "—",
        dueDate: "Jan 30, 2025",
        time: "8:00 AM",
        revisions: "No Revisions",
      },
      {
        no: 3,
        task: "Prepare:",
        subtask: "Chapter 3",
        elements: "—",
        dueDate: "Feb 05, 2025",
        time: "8:00 AM",
        revisions: "No Revisions",
      },
    ],
  },
  {
    id: "foodfind",
    name: "FoodFind",
    membersShort: "Bernardo, Et Al",
    members: [
      { name: "Clyden Austin Bernardo", role: "Project Manager" },
      { name: "Member 2", role: "Member" },
      { name: "Member 3", role: "Member" },
      { name: "Member 4", role: "Member" },
    ],
    progress: { todo: 6, inprogress: 2, review: 1, done: 4, missed: 0 },
    tasks: [],
  },
  {
    id: "tasksphere",
    name: "TaskSphere IT",
    membersShort: "Mendoza, Et Al",
    members: [
      { name: "Project Manager Name", role: "Project Manager" },
      { name: "Member A", role: "Member" },
      { name: "Member B", role: "Member" },
      { name: "Member C", role: "Member" },
    ],
    progress: { todo: 3, inprogress: 2, review: 1, done: 5, missed: 1 },
    tasks: [],
  },
];

/* ---------------------- SMALL HELPERS ---------------------- */
const cardBase =
  "bg-white border border-neutral-200 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.08)] overflow-hidden hover:translate-y-[-2px] transition-transform";
const maroon = "#6A0F14";

/** Builds stroke segments for an SVG donut */
function useDonutSegments(progress) {
  return useMemo(() => {
    const parts = [
      { key: "todo", label: "To Do", color: "#F5B700" },
      { key: "inprogress", label: "In Progress", color: "#63A46C" },
      { key: "review", label: "To Review", color: "#7C5CC4" },
      { key: "done", label: "Completed", color: maroon },
      { key: "missed", label: "Missed", color: "#D11A2A" },
    ];

    const total = parts.reduce((s, p) => s + (progress[p.key] || 0), 0) || 1;
    let acc = 0;
    const segments = parts.map((p) => {
      const val = progress[p.key] || 0;
      const frac = val / total;
      const seg = {
        ...p,
        value: val,
        frac,
        dasharray: `${(frac * 100).toFixed(4)} ${(
          100 - frac * 100
        ).toFixed(4)}`,
        dashoffset: (-(acc * 100)).toFixed(4),
      };
      acc += frac;
      return seg;
    });

    const completion =
      (progress.done || 0) / total > 0 ? Math.round(((progress.done || 0) / total) * 100) : 0;

    return { segments, completion, total, parts };
  }, [progress]);
}

/* ----------------------- UI SUBPARTS ----------------------- */
function TeamCard({ team, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${cardBase} w-64 text-left`}
      aria-label={`Open ${team.name} summary`}
    >
      <div className="p-4 pb-5">
        <div className="grid place-items-center mb-2">
          <Users className="w-10 h-10" />
        </div>
        <div className="text-center">
          <p className="font-medium text-neutral-800">{team.name}</p>
          <p className="mt-4 text-sm font-medium text-neutral-700">{team.membersShort}</p>
        </div>
      </div>
      {/* bottom accent bar */}
      <div className="h-5" style={{ backgroundColor: maroon }} />
    </button>
  );
}

function Donut({ progress }) {
  const { segments, completion } = useDonutSegments(progress);
  const size = 220;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className={`${cardBase}`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Tasks Progress</p>
        </div>

        <div className="flex gap-6 items-center">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            className="shrink-0"
            style={{ transform: "rotate(-90deg)" }}
          >
            {/* background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#eee"
              strokeWidth={stroke}
            />
            {/* segments */}
            {segments.map((s) => (
              <circle
                key={s.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${(s.frac * c).toFixed(2)} ${(c - s.frac * c).toFixed(2)}`}
                strokeDashoffset={(s.dashoffset * c * 0.01).toFixed(2)}
                strokeLinecap="butt"
              />
            ))}
            {/* center label (upright) */}
            <foreignObject
              x={size * 0.25}
              y={size * 0.33}
              width={size * 0.5}
              height={size * 0.34}
              style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%" }}
            >
              <div className="w-full h-full grid place-items-center">
                <div className="text-4xl font-bold text-neutral-800">{completion}%</div>
              </div>
            </foreignObject>
          </svg>

          {/* Legend */}
          <div className="grid gap-2 text-sm">
            {segments.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-neutral-700">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersTable({ members }) {
  return (
    <div className={`${cardBase}`}>
      <div className="p-5">
        <p className="text-sm font-semibold mb-3">Team</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2 pr-3 w-16">NO</th>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.name} className="border-t border-neutral-200">
                  <td className="py-2 pr-3">{i + 1}.</td>
                  <td className="py-2 pr-3">{m.name}</td>
                  <td className="py-2 pr-3">{m.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TasksTable({ tasks }) {
  return (
    <div className={`${cardBase}`}>
      <div className="p-5">
        <p className="text-sm font-semibold mb-3">Team Tasks</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2 pr-3 w-16">NO</th>
                <th className="py-2 pr-3">Task</th>
                <th className="py-2 pr-3">Subtask</th>
                <th className="py-2 pr-3">Elements</th>
                <th className="py-2 pr-3">Due Date</th>
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3">Revisions NO</th>
                <th className="py-2 pr-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.no} className="border-t border-neutral-200">
                  <td className="py-2 pr-3">{t.no}.</td>
                  <td className="py-2 pr-3">{t.task}</td>
                  <td className="py-2 pr-3">{t.subtask}</td>
                  <td className="py-2 pr-3">{t.elements}</td>
                  <td className="py-2 pr-3">{t.dueDate}</td>
                  <td className="py-2 pr-3">{t.time}</td>
                  <td className="py-2 pr-3">{t.revisions}</td>
                  <td className="py-2 pr-3">
                    <button className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-100">
                      <FileText className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr className="border-t border-neutral-200">
                  <td className="py-6 pr-3 text-neutral-500" colSpan={8}>
                    No tasks yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- MAIN COMPONENT ----------------------- */
const TeamsSummary = () => {
  const [selected, setSelected] = useState(null);

  // If you want route-based detail later, you can lift state to URL params.
  if (selected) {
    const team = TEAMS.find((t) => t.id === selected);

    return (
      <div className="space-y-5">
        {/* Breadcrumb + title */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4" />
          <span className="font-medium">Teams Summary</span>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
          <span className="font-semibold">{team.membersShort}</span>
        </div>
        <div className="h-[2px] w-full" style={{ backgroundColor: maroon }} />

        {/* Back */}
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Teams
        </button>

        {/* Top row: members + donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MembersTable members={team.members} />
          <Donut progress={team.progress} />
        </div>

        {/* Tasks */}
        <TasksTable tasks={team.tasks} />
      </div>
    );
  }

  // CARD GRID VIEW
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Teams Summary</h2>
      </div>
      <div className="h-[2px] w-full" style={{ backgroundColor: maroon }} />

      <div className="flex flex-wrap gap-4">
        {TEAMS.map((team) => (
          <TeamCard key={team.id} team={team} onClick={() => setSelected(team.id)} />
        ))}
      </div>
    </div>
  );
};

export default TeamsSummary;
