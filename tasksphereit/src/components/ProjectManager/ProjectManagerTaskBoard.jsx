// src/components/ProjectManager/ProjectManagerTaskBoard.jsx
import React, { useMemo, useState } from "react";
import { Search, Image as ImageIcon, Paperclip, ClipboardList } from "lucide-react";

const MAROON = "#6A0F14";

const COLUMNS = [
  { key: "todo",       title: "To Do",       header: "#E6B645", strip: "#D1A236" },
  { key: "inprogress", title: "In Progress", header: "#8AA43A", strip: "#789132" },
  { key: "review",     title: "To Review",   header: "#5D8BBF", strip: "#4D79A8" },
  { key: "missed",     title: "Missed",      header: "#C62828", strip: "#B71C1C" },
];

/* --- sample data (replace with Firestore later) --- */
const RAW = [
  { id: "t1", status: "todo",       assignee: "Mendoza, Et Al",    chapter: "Chapter 4", subtask: "—",             phase: "Implementation", revision: "No Revision", date: "Feb 25, 2025", hasImg: true,  hasAttach: false },
  { id: "t2", status: "todo",       assignee: "Addrialene Mendoza", chapter: "Chapter 3", subtask: "Implementation", phase: "Implementation", revision: "No Revision", date: "Feb 15, 2025", hasImg: false, hasAttach: false },
  { id: "t3", status: "todo",       assignee: "Justine Pare",       chapter: "Chapter 3", subtask: "Implementation", phase: "Implementation", revision: "No Revision", date: "Feb 13, 2025", hasImg: false, hasAttach: true },
  { id: "t4", status: "inprogress", assignee: "Mendoza, Et Al",    chapter: "Chapter 3", subtask: "—",             phase: "Implementation", revision: "No Revision", date: "Feb 20, 2025", hasImg: true,  hasAttach: true },
  { id: "t5", status: "inprogress", assignee: "Alejandro Faustino", chapter: "Chapter 3", subtask: "Development",   phase: "Implementation", revision: "No Revision", date: "Feb  9, 2025", hasImg: false, hasAttach: false },
  { id: "t6", status: "inprogress", assignee: "John Reagan Pinpin", chapter: "Chapter 3", subtask: "Implementation", phase: "Implementation", revision: "No Revision", date: "Feb 11, 2025", hasImg: false, hasAttach: false },
  { id: "t7", status: "review",     assignee: "Julliana Castaneda", chapter: "Chapter 3", subtask: "Implementation", phase: "Implementation", revision: "No Revision", date: "Feb  7, 2025", hasImg: true,  hasAttach: true },
];

const PillDate = ({ date }) => (
  <div className="flex items-center gap-2 text-[12px] font-medium px-2 py-1 rounded-md border border-neutral-300">
    <span className="inline-block w-2 h-2 rounded-full bg-red-600" />
    {date}
  </div>
);

const Card = ({ item, stripColor }) => (
  <div className="relative rounded-xl bg-white shadow-md border border-neutral-200 px-3 py-3">
    {/* left colored strip */}
    <div
      className="absolute left-0 top-0 h-full w-[8px] rounded-l-xl"
      style={{ backgroundColor: stripColor }}
    />
    {/* content */}
    <div className="ml-2">
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold text-[14px] text-neutral-800">{item.assignee}</div>
        <div className="flex items-center gap-2 text-neutral-500">
          {item.hasImg && <ImageIcon className="w-4 h-4" />}
          {item.hasAttach && <Paperclip className="w-4 h-4" />}
        </div>
      </div>

      <div className="mt-2 text-[13px] text-neutral-700 leading-tight">
        <div>{item.chapter}</div>
        {item.subtask && <div>{item.subtask}</div>}
        <div>{item.phase}</div>
        <div className="text-neutral-500">{item.revision}</div>
      </div>

      <div className="mt-3">
        <PillDate date={item.date} />
      </div>
    </div>
  </div>
);

function Column({ title, headerColor, stripColor, items }) {
  return (
    <div className="flex-1 min-w-[260px]">
      {/* header */}
      <div
        className="rounded-t-xl px-4 py-3 text-white font-semibold shadow-sm"
        style={{ backgroundColor: headerColor }}
      >
        {title}
      </div>

      {/* body */}
      <div className="rounded-b-xl border border-neutral-200 border-t-0 bg-white/70 px-3 py-3 min-h-[460px] shadow">
        <div className="flex flex-col gap-3">
          {items.map((it) => (
            <Card key={it.id} item={it} stripColor={stripColor} />
          ))}
          {items.length === 0 && (
            <div className="h-[380px] rounded-lg border border-dashed border-neutral-300 bg-white/60" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectManagerTaskBoard() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return RAW;
    const s = q.toLowerCase();
    return RAW.filter(
      (x) =>
        x.assignee.toLowerCase().includes(s) ||
        x.chapter.toLowerCase().includes(s) ||
        (x.subtask || "").toLowerCase().includes(s) ||
        x.phase.toLowerCase().includes(s) ||
        x.revision.toLowerCase().includes(s) ||
        x.date.toLowerCase().includes(s)
    );
  }, [q]);

  const byStatus = useMemo(
    () => ({
      todo: filtered.filter((x) => x.status === "todo"),
      inprogress: filtered.filter((x) => x.status === "inprogress"),
      review: filtered.filter((x) => x.status === "review"),
      missed: filtered.filter((x) => x.status === "missed"),
    }),
    [filtered]
  );

  return (
    <div className="space-y-4">
      {/* ===== Title + underline (match ProjectManagerTasks header) ===== */}
      <div className="space-y-2">
        <div
          className="flex items-center gap-2 text-[18px] font-semibold"
          style={{ color: MAROON }}
        >
          <ClipboardList className="w-5 h-5" />
          <span>Tasks</span>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: MAROON }} />
      </div>

      {/* Search */}
      <div className="w-full max-w-[280px]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-neutral-300 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
          />
        </div>
      </div>

      {/* Columns */}
      <div className="flex gap-5">
        {COLUMNS.map((c) => (
          <Column
            key={c.key}
            title={c.title}
            headerColor={c.header}
            stripColor={c.strip}
            items={byStatus[c.key] || []}
          />
        ))}
      </div>
    </div>
  );
}
