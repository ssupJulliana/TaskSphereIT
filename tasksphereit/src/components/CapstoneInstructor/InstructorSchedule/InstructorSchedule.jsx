import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  FileText,
  Mic,
  GraduationCap,
  ChevronLeft,
} from "lucide-react";

const MAROON = "#6A0F14";

const Card = ({ title, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="relative w-[240px] h-[300px] rounded-2xl bg-white border border-neutral-200 shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)] transition-shadow"
  >
    {/* L-accent */}
    <div className="absolute inset-y-0 left-0 w-14 rounded-l-2xl" style={{ backgroundColor: MAROON }} />
    {/* icon */}
    <div className="grid place-items-center mt-16">
      <div className="grid place-items-center h-20 w-20 rounded-xl border border-neutral-300 bg-white">
        {icon}
      </div>
    </div>
    {/* label */}
    <div className="mt-8 px-4 text-center text-[18px] font-semibold" style={{ color: MAROON }}>
      {title}
    </div>
    {/* bottom band */}
    <div className="absolute bottom-0 left-0 right-0 h-7 rounded-b-2xl" style={{ backgroundColor: "#4a0a0d" }} />
  </button>
);

const Breadcrumbs = () => (
  <div className="flex items-center gap-2 text-neutral-700">
    <ChevronLeft size={18} className="text-neutral-400" />
    <span className="text-[15px] font-semibold">Schedule</span>
  </div>
);

export default function InstructorSchedule() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Title Defense",
      icon: <CalendarDays size={40} strokeWidth={2.2} />,
      onClick: () => navigate("/instructor/schedule/title-defense"),
    },
    {
      title: "Manuscript Submission",
      icon: <FileText size={40} strokeWidth={2.2} />,
      onClick: () => navigate("/instructor/schedule/manuscript"),
    },
    {
      title: "Oral Defense",
      icon: <Mic size={40} strokeWidth={2.2} />,
      onClick: () => navigate("/instructor/schedule/oral-defense"),
    },
    {
      title: "Final Defense",
      icon: <GraduationCap size={40} strokeWidth={2.2} />,
      onClick: () => navigate("/instructor/schedule/final-defense"),
    },
  ];

  return (
    <div className="p-6">
      {/* breadcrumbs + divider */}
      <div className="flex items-center justify-between">
        <Breadcrumbs />
        {/* optional: a back-to-dashboard link; remove if not needed */}
        <NavLink to="/instructor/dashboard" className="text-sm text-neutral-500 hover:underline">
          Back to Dashboard
        </NavLink>
      </div>
      <div className="mt-2 h-[2px] w-full bg-neutral-200">
        <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 220 }} />
      </div>

      {/* cards */}
      <div className="mt-8 flex flex-wrap gap-8">
        {cards.map((c) => (
          <Card key={c.title} title={c.title} icon={c.icon} onClick={c.onClick} />
        ))}
      </div>
    </div>
  );
}
