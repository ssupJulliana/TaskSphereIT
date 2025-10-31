// src/components/CapstoneMember/MemberAdviserTasks.jsx
import React, { useState } from "react";
import { ClipboardList, Search, Filter, Eye } from "lucide-react";

const MAROON = "#6A0F14";

 function MemberAdviserTasks() {
  const [rows, setRows] = useState([
    {
      id: 1,
      assigned: "Mendoza, Et Al",
      task: "Prepare: Chapter 2",
      subtask: "Related Theories",
      element: "—",
      dateCreated: "Oct 14, 2025",
      dueDate: "Oct 20, 2025",
      time: "8:00 AM",
      revision: "2nd Revision",
      status: "In Progress",
      methodology: "Agile",
      phase: "Design",
    },
  ]);

  const revisionOptions = [
    "1st Revision",
    "2nd Revision",
    "3rd Revision",
    "4th Revision",
    "5th Revision",
    "6th Revision",
    "7th Revision",
    "8th Revision",
    "9th Revision",
    "10th Revision",
  ];

  const statusOptions = ["To Do", "In Progress", "Complete"];

  const handleRevisionChange = (id, value) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, revision: value } : row)));
  };

  const handleStatusChange = (id, value) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, status: value } : row)));
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
          <span>Adviser Tasks</span>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: MAROON }} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-400"
            style={{ boxShadow: `0 0 0 2px transparent` }}
            onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${MAROON}33`)}
            onBlur={(e) => (e.target.style.boxShadow = "0 0 0 2px transparent")}
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm hover:border-neutral-400"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-3 text-left w-14">NO</th>
                <th className="px-4 py-3 text-left">Assigned</th>
                <th className="px-4 py-3 text-left">Tasks</th>
                <th className="px-4 py-3 text-left">SubTasks</th>
                <th className="px-4 py-3 text-left">Elements</th>
                <th className="px-4 py-3 text-left">Date Created</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Revision No.</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Methodology</th>
                <th className="px-4 py-3 text-left">Project Phase</th>
                <th className="px-4 py-3 text-left w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={i % 2 ? "bg-neutral-50/60" : "bg-white"}>
                  <td className="px-4 py-3 text-neutral-600">{i + 1}.</td>
                  <td className="px-4 py-3">{r.assigned}</td>
                  <td className="px-4 py-3">{r.task}</td>
                  <td className="px-4 py-3">{r.subtask}</td>
                  <td className="px-4 py-3">{r.element}</td>
                  <td className="px-4 py-3">{r.dateCreated}</td>
                  <td className="px-4 py-3">{r.dueDate}</td>
                  <td className="px-4 py-3">{r.time}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.revision}
                      onChange={(e) => handleRevisionChange(r.id, e.target.value)}
                      className="w-full rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 outline-none focus:border-neutral-400"
                    >
                      {revisionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      className={`w-full rounded-md px-3 py-1 text-xs font-medium outline-none ${
                        r.status === "Complete"
                          ? "bg-[#6b8f3c] text-white"
                          : r.status === "In Progress"
                          ? "bg-[#f59e0b] text-white"
                          : "bg-[#3b82f6] text-white"
                      }`}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">{r.methodology}</td>
                  <td className="px-4 py-3">{r.phase}</td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100"
                      aria-label="View"
                      title="View"
                    >
                      <Eye className="h-4 w-4 text-neutral-700" />
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-10 text-center text-neutral-500">
                    No adviser tasks found.
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

export default MemberAdviserTasks
