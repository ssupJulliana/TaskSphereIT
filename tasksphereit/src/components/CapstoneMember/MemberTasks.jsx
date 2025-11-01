// src/components/CapstoneMember/MemberTasks.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, ExternalLink, Search, SlidersHorizontal } from "lucide-react";
import { db } from "../../config/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const MAROON = "#6A0F14";

// No static tableData; loads from Firestore

export default function MemberTasks() {
  const uid = typeof window !== "undefined" ? localStorage.getItem("uid") : null;
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState([]); // live
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All"); // All | To Do | In Progress | To Review | Missed

  const to12h = (t) => {
    if (!t) return "";
    const [H, M] = String(t).split(":").map(Number);
    const ampm = H >= 12 ? "PM" : "AM";
    const hh = ((H + 11) % 12) + 1;
    return `${hh}:${String(M || 0).padStart(2, "0")} ${ampm}`;
  };
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtDate = (yyyy_mm_dd) => {
    if (!yyyy_mm_dd) return "";
    const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
    return `${MONTHS[(m || 1) - 1]} ${Number(d || 1)}, ${y}`;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const cols = [
          { coll: "titleDefenseTasks" },
          { coll: "oralDefenseTasks" },
          { coll: "finalDefenseTasks" },
          { coll: "finalRedefenseTasks" },
        ];
        const snaps = await Promise.all(cols.map((c) => getDocs(collection(db, c.coll))));
        const all = [];
        snaps.forEach((s, i) => {
          const collName = cols[i].coll;
          s.forEach((dx) => all.push({ id: dx.id, sourceColl: collName, ...(dx.data() || {}) }));
        });
        // Only tasks assigned to this member
        const mine = all.filter((t) => Array.isArray(t.assignees) && t.assignees.some((a) => a?.uid === uid));
        const mapped = mine.map((t) => ({
          id: t.id,
          sourceColl: t.sourceColl,
          task: t.task || t.type || "Task",
          subtask: t.type || "—",
          element: t.team?.name || "—",
          dateCreated: t.createdAt?.toDate?.()?.toLocaleDateString?.() || "—",
          dueDate: fmtDate(t.dueDate || ""),
          time: to12h(t.dueTime || ""),
          revision: t.revision || "No Revision",
          status: t.status || "To Do",
          projectPhase: t.phase || "Design",
          dueAtMs: typeof t.dueAtMs === "number" ? t.dueAtMs : null,
          _missed: typeof t.dueAtMs === "number" && t.dueAtMs < Date.now() && (t.status || "") !== "Completed",
        }));
        // Sort by created date desc (if available), else by due date asc
        mapped.sort((a, b) => {
          const ak = mine.find((x) => x.id === a.id)?.createdAt?.toMillis?.() || 0;
          const bk = mine.find((x) => x.id === b.id)?.createdAt?.toMillis?.() || 0;
          if (bk !== ak) return bk - ak;
          return (a.dueDate || "").localeCompare(b.dueDate || "");
        });
        if (alive) setRows(mapped);
      } catch (e) {
        console.error("MemberTasks load failed:", e);
        if (alive) setRows([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [uid]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let base = rows;
    if (statusFilter && statusFilter !== "All") {
      if (statusFilter === "Missed") base = base.filter((r) => r._missed);
      else base = base.filter((r) => (r.status || "").toLowerCase() === statusFilter.toLowerCase());
    }
    if (!q) return base;
    return base.filter((r) =>
      [r.task, r.subtask, r.element, r.status, r.projectPhase]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, searchQuery, statusFilter]);

  const allowedStatuses = ["To Do", "In Progress", "To Review"]; // member can update up to To Review
  const canUpdateRow = (row) => allowedStatuses.includes(row.status || "") || row.status === "To Do" || row.status === "In Progress" || row.status === "To Review";
  const handleUpdateStatus = async (row, newStatus) => {
    if (!row?.id || !row?.sourceColl) return;
    if (!allowedStatuses.includes(newStatus)) return;
    try {
      await updateDoc(doc(db, row.sourceColl, row.id), { status: newStatus });
      setRows((prev) => prev.map((r) => (r.id === row.id && r.sourceColl === row.sourceColl ? { ...r, status: newStatus } : r)));
    } catch (e) {
      console.error("Update status failed:", e);
      alert("Failed to update status.");
    }
  };

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
    <div className="space-y-4">
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

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-neutral-300 rounded-md px-3 py-2 text-sm"
          >
            <option>All</option>
            <option>To Do</option>
            <option>In Progress</option>
            <option>To Review</option>
            <option>Missed</option>
          </select>
        </div>
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
                    <select
                      value={allowedStatuses.includes(row.status) ? row.status : "To Do"}
                      onChange={(e) => handleUpdateStatus(row, e.target.value)}
                      className="border border-neutral-300 rounded-md px-2 py-1 text-sm"
                      disabled={!canUpdateRow(row)}
                    >
                      {allowedStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {(!loading && filteredData.length === 0) && (
                <tr>
                  <td className="px-6 py-6 text-center text-neutral-500" colSpan={11}>No tasks found.</td>
                </tr>
              )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
