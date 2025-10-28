// src/components/CapstoneInstructor/InstructorEnroll.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  PlusCircle,
  X,
  Trash2,
  Undo2,
  KeyRound,
  CheckSquare,
} from "lucide-react";

import { auth, db } from "../../config/firebase";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

const DEFAULT_PASSWORD = "UserUser321";
const ROLES = ["Adviser", "Project Manager", "Member"];

const InstructorEnroll = () => {
  // role filter
  const [selectedRole, setSelectedRole] = useState("Adviser");

  // dialog
  const [openAddUser, setOpenAddUser] = useState(false);

  // add-user form
  const [form, setForm] = useState({
    email: "",
    lastName: "",
    firstName: "",
    middleName: "",
    idNumber: "",
    role: "Adviser",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // list + search
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [qText, setQText] = useState("");

  // per-row menu + password modal
  const [openMenuId, setOpenMenuId] = useState(null);
  const [pwdModal, setPwdModal] = useState({ open: false, user: null });

  // bulk selection
  const [selectedIds, setSelectedIds] = useState([]);
  const allSelected = selectedIds.length > 0 && selectedIds.length === users.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < users.length;

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // live query by role
  useEffect(() => {
    setLoadingList(true);
    setSelectedIds([]); // clear selections on role switch
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", selectedRole));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(data);
        setLoadingList(false);
      },
      (err) => {
        console.error(err);
        setLoadingList(false);
      }
    );
    return () => unsub();
  }, [selectedRole]);

  // client search
  const filteredUsers = useMemo(() => {
    if (!qText.trim()) return users;
    const needle = qText.toLowerCase();
    return users.filter((u) => {
      const mid = u.middleName || "";
      return (
        (u.idNumber || "").toLowerCase().includes(needle) ||
        (u.firstName || "").toLowerCase().includes(needle) ||
        (u.lastName || "").toLowerCase().includes(needle) ||
        mid.toLowerCase().includes(needle)
      );
    });
  }, [users, qText]);

  const middleInitial = (name) => (name ? `${name[0].toUpperCase()}.` : "");

  const handleSaveUser = async () => {
    setError("");
    setSaving(true);
    try {
      // 1) Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        DEFAULT_PASSWORD
      );

      // 2) Firestore (do NOT store password)
      await addDoc(collection(db, "users"), {
        uid: cred.user.uid,
        email: form.email.trim(),
        idNumber: form.idNumber.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        middleName: form.middleName.trim(),
        role: form.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        mustChangePassword: true, // they should change after first login
      });

      // reset + close
      setForm({
        email: "",
        lastName: "",
        firstName: "",
        middleName: "",
        idNumber: "",
        role: selectedRole, // keep current tab as default
      });
      setOpenAddUser(false);
    } catch (e) {
      console.error(e);
      const msg =
        e?.code === "auth/email-already-in-use"
          ? "Email is already in use."
          : e?.code === "auth/invalid-email"
          ? "Please enter a valid email."
          : e?.message || "Failed to add user.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ===== row actions =====

  const deleteAndBlock = async (u) => {
    // move to blockedUsers and remove from users
    try {
      const fromRef = doc(db, "users", u.id);
      const snap = await getDoc(fromRef);
      if (!snap.exists()) return;

      const data = snap.data();
      await setDoc(doc(db, "blockedUsers", u.id), {
        ...data,
        blockedAt: serverTimestamp(),
        // include both uid and email for sign-in checks
        uid: data.uid || null,
        email: data.email || null,
      });

      await deleteDoc(fromRef);
    } catch (e) {
      console.error("Block failed:", e);
      alert("Failed to delete/block this account.");
    }
  };

  const resetToDefault = async (u) => {
    try {
      await updateDoc(doc(db, "users", u.id), {
        forceDefaultPassword: true,
        updatedAt: serverTimestamp(),
      });
      alert("Password will be reset to default on the user's next successful login.");
    } catch (e) {
      console.error(e);
      alert("Failed to set reset flag.");
    }
  };

  const sendResetEmail = async (u) => {
    try {
      await sendPasswordResetEmail(auth, u.email);
      alert(`Password reset email sent to ${u.email}.`);
    } catch (e) {
      console.error(e);
      alert("Failed to send reset email.");
    }
  };

  // ===== bulk actions =====
  const toggleOne = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () => {
    if (selectedIds.length === users.length) setSelectedIds([]);
    else setSelectedIds(users.map((u) => u.id));
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete/Block ${selectedIds.length} account(s)?`)) return;

    for (const id of selectedIds) {
      const u = users.find((x) => x.id === id);
      if (u) await deleteAndBlock(u);
    }
    setSelectedIds([]);
  };

  const bulkResetDefault = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Reset password to default for ${selectedIds.length} account(s)?`)) return;

    for (const id of selectedIds) {
      await updateDoc(doc(db, "users", id), {
        forceDefaultPassword: true,
        updatedAt: serverTimestamp(),
      });
    }
    alert("Selected users will get default password on next successful login.");
    setSelectedIds([]);
  };

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
            {selectedIds.length > 0 ? (
              <>
                <button
                  onClick={bulkResetDefault}
                  className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  title="Reset selected to default"
                >
                  <Undo2 className="w-4 h-4" />
                  Reset Selected
                </button>
                <button
                  onClick={bulkDelete}
                  className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  title="Delete/Block selected"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected
                </button>
              </>
            ) : (
              <>
                <button className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                  <Upload className="w-4 h-4" />
                  Import
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters & search */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Role filter pills */}
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
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
                value={qText}
                onChange={(e) => setQText(e.target.value)}
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
            <div className="border border-neutral-200 rounded-2xl shadow-lg overflow-visible bg-white">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => el && (el.indeterminate = someSelected)}
                        onChange={toggleAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">No.</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">ID Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Last Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">First Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Middle Initial</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-200">
                  {loadingList ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-sm text-neutral-500">
                        Loading…
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-sm text-neutral-500">
                        No users found for <span className="font-medium">{selectedRole}</span>.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, idx) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(u.id)}
                            onChange={() => toggleOne(u.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{u.idNumber || "—"}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{u.lastName || "—"}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{u.firstName || "—"}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">
                          {middleInitial(u.middleName)}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700 text-center relative">
                          <button
                            className="p-2 rounded-full hover:bg-neutral-100"
                            onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                          >
                            <MoreVertical className="w-4 h-4 text-neutral-500" />
                          </button>

                          {/* tiny menu */}
                          {openMenuId === u.id && (
                            <div
                              className="absolute right-0 top-full mt-2 z-50 w-52 bg-white border border-neutral-200 rounded-xl shadow-xl"
                            >
                              <button
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50"
                                onClick={() => {
                                  setPwdModal({ open: true, user: u });
                                  setOpenMenuId(null);
                                }}
                              >
                                <KeyRound className="w-4 h-4 text-[#6A0F14]" />
                                Change Password
                              </button>
                              <button
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50"
                                onClick={() => {
                                  resetToDefault(u);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Undo2 className="w-4 h-4 text-[#6A0F14]" />
                                Reset to Default
                              </button>
                              <button
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50 text-red-700"
                                onClick={() => {
                                  if (confirm("Delete/Block this account?")) deleteAndBlock(u);
                                  setOpenMenuId(null);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Account
                              </button>
                            </div>
                          )}


                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add-User trigger card */}
          <div className="w-full md:w-64">
            <button
              type="button"
              onClick={() => {
                setForm((f) => ({ ...f, role: selectedRole }));
                setOpenAddUser(true);
              }}
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
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onClick={() => setOpenAddUser(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex items-center justify-center min-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-neutral-200">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-2 text-[#6A0F14]">
                  <PlusCircle className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Add User</h3>
                </div>
                <button className="p-2 rounded-full hover:bg-neutral-100" onClick={() => setOpenAddUser(false)} aria-label="Close">
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={onChange("email")}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Last Name</label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={onChange("lastName")}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Student ID number</label>
                    <input
                      type="text"
                      placeholder="ID Number"
                      value={form.idNumber}
                      onChange={onChange("idNumber")}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Password</label>
                    <input
                      type="text"
                      readOnly
                      value={DEFAULT_PASSWORD}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-neutral-100 text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">First Name</label>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={onChange("firstName")}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Select Role</label>
                    <select
                      value={form.role}
                      onChange={onChange("role")}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    >
                      {ROLES.map((role) => (
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
                      value={form.middleName}
                      onChange={onChange("middleName")}
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                    />
                  </div>
                  {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}
                </div>
              </div>

              <div className="px-6 pb-6 flex justify-end gap-3">
                <button className="px-4 py-2 rounded-full border border-[#6A0F14] text-sm font-medium text-[#6A0F14] hover:bg-[#6A0F14]/10" onClick={() => setOpenAddUser(false)} disabled={saving}>
                  Cancel
                </button>
                <button
                  className="px-6 py-2 rounded-full bg-[#6A0F14] text-sm font-medium text-white hover:bg-[#5c0d12] disabled:opacity-60"
                  onClick={handleSaveUser}
                  disabled={saving || !form.email.trim() || !form.firstName.trim() || !form.lastName.trim()}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change password dialog (explains limitation + offers reset email) */}
      {pwdModal.open && pwdModal.user && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onClick={() => setPwdModal({ open: false, user: null })}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex items-center justify-center min-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-2 text-[#6A0F14]">
                  <KeyRound className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Manage Password</h3>
                </div>
                <button className="p-2 rounded-full hover:bg-neutral-100" onClick={() => setPwdModal({ open: false, user: null })}>
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-3 text-sm text-neutral-700">
                <p>
                  For security, changing another user's password directly requires the Firebase <b>Admin SDK</b>.
                  From the web app we can either:
                </p>
                <ul className="list-disc pl-5">
                  <li>Send a password reset email to <b>{pwdModal.user.email}</b>.</li>
                  <li>Mark the account to <b>reset to default</b> on next successful login.</li>
                </ul>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button className="px-4 py-2 rounded-full border border-neutral-300 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => sendResetEmail(pwdModal.user)}>
                  Send Reset Email
                </button>
                <button
                  className="px-4 py-2 rounded-full border border-[#6A0F14] text-sm text-[#6A0F14] hover:bg-[#6A0F14]/10"
                  onClick={() => {
                    resetToDefault(pwdModal.user);
                    setPwdModal({ open: false, user: null });
                  }}
                >
                  Reset to Default
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
