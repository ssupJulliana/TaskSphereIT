// src/components/ProjectManager/tasks/Allocation.jsx
import React, { useMemo } from "react";
import { ChevronLeft, Users as UsersIcon } from "lucide-react";

const MAROON = "#6A0F14";

export default function Allocation({ onBack, members }) {
  // Sample data (override by passing `members` prop)
  const rows = useMemo(
    () =>
      members || [
        { name: "Addrialene G Mendoza", role: "Project Manager", assigned: 5, completed: 3 },
        { name: "Harzwel Zhen B Lacson", role: "Member", assigned: 3, completed: 2 },
        { name: "Julliana N Castaneda", role: "Member", assigned: 2, completed: 0 },
        { name: "Alenjandro C Faustino", role: "Member", assigned: 4, completed: 2 },
        { name: "Justine I Pare", role: "Member", assigned: 5, completed: 1 },
        { name: "John Reagan S Pinpin", role: "Member", assigned: 3, completed: 2 },
      ],
    [members]
  );

  return (
    <div className="space-y-4">
      {/* Back */}
      <div>
        <button
          onClick={() => (typeof onBack === "function" ? onBack() : window.history.back())}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100 cursor-pointer"
          title="Back to Tasks"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tasks
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600">
                <th className="py-3 pl-6 pr-3 text-left w-20">NO</th>
                <th className="py-3 pr-3 text-left">Name</th>
                <th className="py-3 pr-3 text-left">Role</th>
                <th className="py-3 pr-3 text-left">Assigned Tasks</th>
                <th className="py-3 pr-6 text-left">Completed Tasks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.name + i}
                  className={i % 2 ? "bg-white" : "bg-neutral-50/40"}
                >
                  <td className="py-4 pl-6 pr-3 whitespace-nowrap text-neutral-700">
                    {i + 1}.
                  </td>
                  <td className="py-4 pr-3 whitespace-nowrap text-neutral-800">
                    {r.name}
                  </td>
                  <td className="py-4 pr-3 whitespace-nowrap">
                    <span style={{ color: MAROON }} className="font-medium">
                      {r.role}
                    </span>
                  </td>
                  <td className="py-4 pr-3 whitespace-nowrap text-neutral-800">
                    {r.assigned}
                  </td>
                  <td className="py-4 pr-6 whitespace-nowrap text-neutral-800">
                    {r.completed}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-500">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
            {/* optional totals */}
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t border-neutral-200">
                  <td className="py-3 pl-6 pr-3 text-neutral-500 text-xs" colSpan={3}>
                    Totals
                  </td>
                  <td className="py-3 pr-3 font-semibold">
                    {rows.reduce((s, r) => s + Number(r.assigned || 0), 0)}
                  </td>
                  <td className="py-3 pr-6 font-semibold">
                    {rows.reduce((s, r) => s + Number(r.completed || 0), 0)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
