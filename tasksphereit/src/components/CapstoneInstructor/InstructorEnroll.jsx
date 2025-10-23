// src/components/CapstoneInstructor/InstructorEnroll.jsx
import React, { useEffect, useState } from "react";
import {
  ChevronRight,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  PlusCircle,
  X,
} from "lucide-react";

const InstructorEnroll = () => {
  // role filter state
  const [selectedRole, setSelectedRole] = useState("Adviser");
  const roles = ["Adviser", "Project Manager", "Proponents"];

  // dialog state
  const [openAddUser, setOpenAddUser] = useState(false);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpenAddUser(false);
    if (openAddUser) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openAddUser]);

  // sample data – replace with actual API data later
  const instructors = [
    { id: 1, idNumber: "582736194", password: "pass123", lastName: "Aguas", firstName: "Xavielle Elie", middleInitial: "Y." },
    { id: 2, idNumber: "194728365", password: "pass123", lastName: "Bernardo", firstName: "Clyden Austin", middleInitial: "C." },
    { id: 3, idNumber: "247193856", password: "pass123", lastName: "Castaneda", firstName: "Julliana", middleInitial: "N." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <main className="flex-1 flex flex-col px-6 md:px-10 py-6">
        {/* Breadcrumb & top actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <nav className="flex items-center text-sm text-neutral-600 space-x-2">
            <span className="font-medium text-[#6A0F14]">Enroll</span>
            <ChevronRight className="w-3 h-3 text-neutral-500" />
            <span className="font-medium text-[#6A0F14]">Instructor</span>
          </nav>
          <div className="flex gap-2 flex-wrap">
            <button className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium text-white bg-[#6A0F14] hover:bg-[#5c0d12]">
              Save
            </button>
            <button className="flex items-center gap-2 rounded-full border border-[#6A0F14] px-6 py-2 text-sm font-medium text-[#6A0F14] hover:bg-[#6A0F14]/10">
              Cancel
            </button>
          </div>
        </div>

        {/* Filters & search */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Role filter pills */}
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedRole === role
                    ? "bg-[#6A0F14] text-white"
                    : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          {/* Search bar & filter icon */}
          <div className="flex items-center w-full md:max-w-xs">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-4 h-4 text-neutral-500" />
              </span>
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-full border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
              />
            </div>
            <button className="ml-3 p-2 rounded-lg border border-neutral-300 hover:bg-neutral-100">
              <Filter className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Table & add-user column */}
        <div className="mt-6 flex flex-col md:flex-row gap-6">
          {/* Table card */}
          <div className="flex-1">
            <div className="border border-neutral-200 rounded-2xl shadow-lg overflow-hidden bg-white">
              {/* Table header */}
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">No.</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">ID Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Password</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Last Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">First Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Middle Initial</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700">Action</th>
                  </tr>
                </thead>
                {/* Table body */}
                <tbody className="divide-y divide-neutral-200">
                  {instructors.map((inst, index) => (
                    <tr key={inst.id}>
                      <td className="px-4 py-3 text-sm text-neutral-700">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{inst.idNumber}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{inst.password}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{inst.lastName}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{inst.firstName}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{inst.middleInitial}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700 text-center">
                        <button className="p-2 rounded-full hover:bg-neutral-100">
                          <MoreVertical className="w-4 h-4 text-neutral-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add-User trigger card (opens dialog) */}
          <div className="w-full md:w-64">
            <button
              type="button"
              onClick={() => setOpenAddUser(true)}
              className="w-full h-full focus:outline-none"
              aria-haspopup="dialog"
              aria-expanded={openAddUser}
            >
              <div className="flex flex-col items-center justify-center border border-neutral-200 rounded-2xl shadow-lg p-6 h-full hover:bg-neutral-50">
                <div className="flex items-center justify-center h-16 w-16 rounded-full border border-neutral-300">
                  <PlusCircle className="w-8 h-8 text-[#6A0F14]" />
                </div>
                <p className="mt-4 text-base font-semibold text-[#6A0F14] text-center uppercase tracking-wide">
                  Add User
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Add User Dialog */}
      {openAddUser && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenAddUser(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Panel */}
          <div
            className="relative z-10 flex items-center justify-center min-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-neutral-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-2 text-[#6A0F14]">
                  <PlusCircle className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Add User</h3>
                </div>
                <button
                  className="p-2 rounded-full hover:bg-neutral-100"
                  onClick={() => setOpenAddUser(false)}
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Student ID number</label>
                    <input
                      type="text"
                      placeholder="ID Number"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Password</label>
                    <input
                      type="text"
                      readOnly
                      value="5XDSF#@@"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-neutral-100 text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">First Name</label>
                    <input
                      type="text"
                      placeholder="First Name"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Select Role</label>
                    <select className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30">
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Middle Name</label>
                    <input
                      type="text"
                      placeholder="Middle Name"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    />
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-full border border-[#6A0F14] text-sm font-medium text-[#6A0F14] hover:bg-[#6A0F14]/10"
                  onClick={() => setOpenAddUser(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 rounded-full bg-[#6A0F14] text-sm font-medium text-white hover:bg-[#5c0d12]"
                  onClick={() => {
                    // TODO: handle save
                    setOpenAddUser(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorEnroll;
