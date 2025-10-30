// src/components/CapstoneInstructor/AddUserModal.jsx
import React from "react";
import { X, PlusCircle } from "lucide-react";

const AddUserModal = ({
  open,
  form,
  onChange,
  handleSaveUser,
  saving,
  closeModal,
  error,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      onClick={closeModal}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 flex items-center justify-center min-h-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-neutral-200">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2 text-[#6A0F14]">
              <PlusCircle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Add User</h3>
            </div>
            <button
              className="p-2 rounded-full hover:bg-neutral-100"
              onClick={closeModal}
            >
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={onChange("email")}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={onChange("lastName")}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Student ID number
                </label>
                <input
                  type="text"
                  placeholder="ID Number"
                  value={form.idNumber}
                  onChange={onChange("idNumber")}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <input
                  type="text"
                  readOnly
                  value="UserUser321"
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-neutral-100 text-neutral-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={onChange("firstName")}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Select Role
                </label>
                <select
                  value={form.role}
                  onChange={onChange("role")}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                >
                  <option value="Adviser">Adviser</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Member">Member</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Middle Name
                </label>
                <input
                  type="text"
                  placeholder="Middle Name"
                  value={form.middleName}
                  onChange={onChange("middleName")}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                />
              </div>
              {error && (
                <div className="md:col-span-2 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-full border border-[#6A0F14] text-sm font-medium text-[#6A0F14] hover:bg-[#6A0F14]/10"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 rounded-full bg-[#6A0F14] text-sm font-medium text-white hover:bg-[#5c0d12] disabled:opacity-60"
              onClick={handleSaveUser}
              disabled={
                saving ||
                !form.email.trim() ||
                !form.firstName.trim() ||
                !form.lastName.trim()
              }
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
