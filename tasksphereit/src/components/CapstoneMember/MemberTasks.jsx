// src/components/CapstoneMember/MemberTasks.jsx
import React, { useState } from "react";
import { ClipboardList, ExternalLink, Search, SlidersHorizontal } from "lucide-react";

const MAROON = "#6A0F14";

const tableData = [
  {
    task: "Chapter 3",
    subtask: "Development",
    element: "Software",
    dateCreated: "Jan 5, 2025",
    dueDate: "Jan 10, 2025",
    time: "8:00 AM",
    revision: "No Revision",
    status: "To Review",
    projectPhase: "Agile",
  },
  {
    task: "Chapter 4",
    subtask: "Testing",
    element: "UI",
    dateCreated: "Jan 7, 2025",
    dueDate: "Jan 14, 2025",
    time: "10:00 AM",
    revision: "Reviewed",
    status: "Completed",
    projectPhase: "Waterfall",
  },
  {
    task: "Chapter 5",
    subtask: "Design",
    element: "UI",
    dateCreated: "Feb 1, 2025",
    dueDate: "Feb 7, 2025",
    time: "9:00 AM",
    revision: "No Revision",
    status: "To Do",
    projectPhase: "Agile",
  },
  {
    task: "Chapter 6",
    subtask: "Development",
    element: "Backend",
    dateCreated: "Feb 3, 2025",
    dueDate: "Feb 10, 2025",
    time: "12:00 PM",
    revision: "Reviewed",
    status: "In Progress",
    projectPhase: "Agile",
  },
  {
    task: "Chapter 7",
    subtask: "Testing",
    element: "Mobile",
    dateCreated: "Jan 12, 2025",
    dueDate: "Jan 20, 2025",
    time: "3:00 PM",
    revision: "No Revision",
    status: "To Review",
    projectPhase: "Waterfall",
  },
  {
    task: "Chapter 8",
    subtask: "Development",
    element: "Frontend",
    dateCreated: "Feb 5, 2025",
    dueDate: "Feb 12, 2025",
    time: "11:00 AM",
    revision: "No Revision",
    status: "Completed",
    projectPhase: "Agile",
  },
];

export default function MemberTasks() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = tableData.filter((row) =>
    row.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "To Review":
        return "bg-blue-500 text-white";
      case "Completed":
        return "bg-green-500 text-white";
      case "In Progress":
        return "bg-yellow-500 text-white";
      case "To Do":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 p-6">
      {/* ===== Title + underline (matches PM Tasks design) ===== */}
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

      {/* Search and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="border border-neutral-300 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ boxShadow: `0 0 0 2px transparent` }}
            onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${MAROON}33`)}
            onBlur={(e) => (e.target.style.boxShadow = "0 0 0 2px transparent")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        </div>

        <button className="border border-neutral-300 rounded-md px-4 py-2 text-sm flex items-center gap-2 hover:bg-neutral-50">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table with horizontal scroll */}
      <div className="overflow-x-auto border border-neutral-200 rounded-lg">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {[
                "NO",
                "Task",
                "Subtask",
                "Element",
                "Date Created",
                "Due Date",
                "Time",
                "Revision NO",
                "Status",
                "Project Phase",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredData.map((row, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {row.task}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {row.subtask}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {row.element}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {row.dateCreated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {row.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {row.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {row.revision}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-md ${getStatusColor(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {row.projectPhase}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    <button
                      className="text-neutral-700 hover:text-neutral-900"
                      title="Open task"
                      aria-label="Open task"
                      style={{ color: MAROON }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
