import React, { useState } from "react";
import { ExternalLink } from "lucide-react";

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

  const filteredData = tableData.filter((row) => {
    return row.task.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span className="text-2xl">📋</span> Tasks
        </h1>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="border border-gray-300 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button className="border border-gray-300 rounded-md px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filter
        </button>
      </div>

      {/* Table with horizontal scroll */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                NO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Subtask
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Element
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Date Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Revision NO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Project Phase
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.task}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.subtask}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.element}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.dateCreated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.dueDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.projectPhase}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button className="text-blue-600 hover:text-blue-800">
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
