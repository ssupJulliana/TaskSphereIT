// src/components/ProjectManager/ProjectManagerDashboard.jsx
import React from "react";
import { ClipboardList, CalendarDays, FileText, Users } from "lucide-react";

const maroon = "#6A0F14";

const CARD_BASE =
  "relative bg-white border border-neutral-200 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.08)] overflow-hidden w-56 h-56 grid place-items-center hover:-translate-y-0.5 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500";

const items = [
  { key: "title", label: "Title Defense", Icon: CalendarDays },
  { key: "oral", label: "Oral Defense", Icon: FileText },
  { key: "final", label: "Final Defense", Icon: CalendarDays },
  { key: "redefense", label: "Final\nRe-Defense", Icon: FileText },
  { key: "allocation", label: "Tasks\nAllocation", Icon: Users },
];

function TaskCard({ label, Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={CARD_BASE}
      aria-label={label.replace("\n", " ")}
    >
      {/* left accent strip */}
      <div className="absolute left-0 top-0 h-full w-6" style={{ backgroundColor: maroon }} />
      {/* bottom accent bar */}
      <div className="absolute left-0 bottom-0 h-8 w-full" style={{ backgroundColor: maroon }} />
      {/* content */}
      <div className="z-[1] -mt-4 flex flex-col items-center gap-3 px-6 text-center cursor-pointer">
        <Icon className="w-14 h-14 text-neutral-800" />
        <span className="whitespace-pre-line text-sm font-semibold text-neutral-800">
          {label}
        </span>
      </div>
    </button>
  );
}

export default function ProjectManagerDashboard() {
  // Hook up real navigation later if you want.
  const handleClick = (key) => {
    // e.g., navigate(`/projectmanager/tasks?type=${key}`)
    // For now static / no-op.
    console.log("Clicked:", key);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-neutral-800" />
        <h2 className="text-lg font-semibold text-neutral-800">Tasks</h2>
      </div>
      <div className="h-[2px] w-full" style={{ backgroundColor: maroon }} />

      {/* Cards */}
      <div className="flex flex-wrap gap-6">
        {items.map(({ key, label, Icon }) => (
          <TaskCard key={key} label={label} Icon={Icon} onClick={() => handleClick(key)} />
        ))}
      </div>
    </div>
  );
}
