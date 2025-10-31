// src/components/CapstoneMember/MemberTasksBoard.jsx
import React, { useMemo, useState } from "react";
import { ClipboardList, Search as SearchIcon, FileSearch, User2 } from "lucide-react";

const MAROON = "#6A0F14";

const COLS = [
  { key: "todo",        title: "To Do",       color: "#f0b429" }, // amber
  { key: "inprogress",  title: "In Progress", color: "#6b8f3c" }, // olive green
  { key: "review",      title: "To Review",   color: "#5b8bb6" }, // slate blue
  { key: "missed",      title: "Missed Task", color: "#cc1f1a" }, // red
];

const INITIAL = [
  { id: "t1", assignee: "Mendoza, Et Al",     chapter: "Chapter 4", subtask: "—",             revision: "No Revision", due: "Feb 25, 2025", status: "todo" },
  { id: "t2", assignee: "Addrialene Mendoza", chapter: "Chapter 3", subtask: "Implementation", revision: "No Revision", due: "Feb 15, 2025", status: "todo" },
  { id: "t3", assignee: "Justine Pare",       chapter: "Chapter 3", subtask: "Implementation", revision: "No Revision", due: "Feb 13, 2025", status: "todo" },
  { id: "t4", assignee: "Mendoza, Et Al",     chapter: "Chapter 3", subtask: "—",             revision: "No Revision", due: "Feb 20, 2025", status: "inprogress" },
  { id: "t5", assignee: "Alejandro Faustino", chapter: "Chapter 3", subtask: "Development",    revision: "No Revision", due: "Feb 9, 2025",  status: "inprogress" },
  { id: "t6", assignee: "John Reagan Pinpin", chapter: "Chapter 3", subtask: "Implementation", revision: "No Revision", due: "Feb 11, 2025", status: "inprogress" },
  { id: "t7", assignee: "Julliana Castaneda", chapter: "Chapter 3", subtask: "Implementation", revision: "No Revision", due: "Feb 7, 2025",  status: "review" },
];

function ColumnHeader({ title, color }) {
  return (
    <div
      className="rounded-t-xl px-4 py-3 text-white font-semibold shadow-sm"
      style={{ backgroundColor: color }}
    >
      {title}
    </div>
  );
}

function TaskCard({ task, color, onOpenAttachment }) {
  return (
    <div className="relative rounded-lg bg-white shadow-md border border-neutral-200 overflow-hidden">
      <div
        className="absolute left-0 top-2 bottom-2 w-2 rounded-md"
        style={{ backgroundColor: color }}
      />
      <div className="pl-4 pr-3 pt-3 pb-2">
        {/* top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-800">
            <User2 className="w-4 h-4 text-neutral-700" />
            <span className="truncate max-w-[180px]" title={task.assignee}>
              {task.assignee}
            </span>
          </div>

          {/* Clickable attachment icon */}
          <button
            type="button"
            onClick={() => onOpenAttachment(task)}
            className="shrink-0 p-1 rounded hover:bg-neutral-100 cursor-pointer"
            title="Open attachments"
            aria-label="Open attachments"
          >
            <FileSearch className="w-4 h-4 text-neutral-700" />
          </button>
        </div>

        <div className="mt-2 text-[12px] text-neutral-700">
          <div className="border-t border-neutral-300/70 my-1" />
          <div>{task.chapter}</div>
          <div>{task.subtask}</div>
          <div>{task.revision}</div>
          <div className="border-t border-neutral-300/70 my-1" />
        </div>

        <div className="flex items-center gap-2 text-[12px] text-neutral-800">
          <span className="inline-block w-2 h-2 rounded-full bg-red-600" />
          <span className="font-medium">{task.due}</span>
        </div>
      </div>
    </div>
  );
}

 function MemberTasksBoard() {
  const [q, setQ] = useState("");
  const [tasks] = useState(INITIAL);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tasks;
    return tasks.filter(
      (t) =>
        t.assignee.toLowerCase().includes(s) ||
        t.chapter.toLowerCase().includes(s) ||
        t.subtask.toLowerCase().includes(s) ||
        t.revision.toLowerCase().includes(s)
    );
  }, [q, tasks]);

  const grouped = useMemo(() => {
    return COLS.reduce((acc, c) => {
      acc[c.key] = filtered.filter((t) => t.status === c.key);
      return acc;
    }, /** @type {Record<string, typeof INITIAL>} */ ({}));
  }, [filtered]);

  const handleOpenAttachment = (task) => {
    // Replace with your modal/navigation
    alert(`Open attachments for: ${task.assignee} • ${task.chapter}`);
  };

  return (
    <div className=" space-y-4">
      {/* ===== Title + underline (matches PM Tasks design) ===== */}
      <div className="space-y-2">
        <div
          className="flex items-center gap-2 text-[18px] font-semibold"
          style={{ color: MAROON }}
        >
          <ClipboardList className="w-5 h-5" />
          <span>Tasks Board</span>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: MAROON }} />
      </div>

      {/* Search */}
      <div className="mb-2">
        <div className="relative w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-400"
          />
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {COLS.map((col) => (
          <div
            key={col.key}
            className="rounded-xl border border-neutral-200 bg-white shadow-md flex flex-col"
          >
            <ColumnHeader title={col.title} color={col.color} />
            <div className="p-4 space-y-4 min-h-[420px]">
              {grouped[col.key]?.length ? (
                grouped[col.key].map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    color={col.color}
                    onOpenAttachment={handleOpenAttachment}
                  />
                ))
              ) : (
                <div className="text-sm text-neutral-400 italic">—</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemberTasksBoard
