// src/components/ProjectManager/ProjectManagerAdviserTaskRecord.jsx
import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList, CalendarRange, ChevronLeft } from "lucide-react";

// === Import the TASK RECORD pages (under tasksrecords) ===
import PMRecTitleDefense from "./tasksrecords/TitleDefense.jsx";
import PMRecOralDefense from "./tasksrecords/OralDefense.jsx";
import PMRecFinalDefense from "./tasksrecords/FinalDefense.jsx";
import PMRecFinalRedefense from "./tasksrecords/FinalRedefense.jsx";

const MAROON = "#6A0F14";

/* --------------------------- Card configuration --------------------------- */
const CARDS = [
  { key: "title",     label: "Title Defense",    icon: CalendarRange },
  { key: "oral",      label: "Oral Defense",     icon: CalendarRange },
  { key: "final",     label: "Final Defense",    icon: CalendarRange },
  { key: "redefense", label: "Final Re-Defense", icon: CalendarRange },
];

/* --------------------------- Local view renderer -------------------------- */
const VIEW_COMPONENT = {
  title: PMRecTitleDefense,
  oral: PMRecOralDefense,
  final: PMRecFinalDefense,
  redefense: PMRecFinalRedefense,
};

function TaskCard({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer relative w-[210px] h-[160px] rounded-2xl bg-white border border-neutral-200 shadow transition
                 hover:shadow-md active:scale-[0.99] text-neutral-800"
    >
      <div className="absolute left-0 top-0 h-full w-10 rounded-l-2xl" style={{ background: MAROON }} />
      <div className="absolute bottom-0 left-0 right-0 h-6 rounded-b-2xl" style={{ background: MAROON }} />
      <div className="absolute inset-0 pl-12 pr-4 pt-6 grid place-items-start">
        <div className="flex flex-col items-start gap-4">
          <Icon className="w-14 h-14 text-neutral-800" />
          <span className="text-sm font-semibold leading-tight">{label}</span>
        </div>
      </div>
    </button>
  );
}

export default function ProjectManagerAdviserTaskRecord() {
  // We’ll “navigate” using the query string so you DON'T need to add routes.
  // /projectmanager/tasks-record          -> grid
  // /projectmanager/tasks-record?view=xx -> renders the matching record page
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view");

  const ActiveView = useMemo(
    () => (view ? VIEW_COMPONENT[view] : null),
    [view]
  );

  const currentLabel = useMemo(
    () => (view ? CARDS.find((c) => c.key === view)?.label : "Tasks Record"),
    [view]
  );

  const open = (key) => setSearchParams({ view: key });
  const goBack = () => setSearchParams({}); // clears ?view=...

  return (
     <div className="space-y-4">
       {/* ===== Title + underline ===== */}
       <div className="space-y-2">
         <div
           className="flex items-center gap-2 text-[18px] font-semibold"
           style={{ color: MAROON }}
         >
           <ClipboardList className="w-5 h-5" />
           <span>Tasks Record</span>
         </div>
         <div className="h-[3px] w-full" style={{ backgroundColor: MAROON }} />
       </div>

      {/* If a view is selected, render it; else show the cards */}
      {ActiveView ? (
        <div className="space-y-3">

          {/* Render the selected record page; each gets an optional onBack */}
          <ActiveView onBack={goBack} />
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {CARDS.map(({ key, label, icon }) => (
            <TaskCard key={key} label={label} icon={icon} onClick={() => open(key)} />
          ))}
        </div>
      )}
    </div>
  );
}
