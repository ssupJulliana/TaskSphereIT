import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronRight,
  Download,
  Upload,
  Search,
  Filter,
  PlusCircle,
  Undo2,
  Trash2,
} from "lucide-react";
import { db } from "../../config/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { parseExcelFile, validateExcelFile } from "../../assets/scripts/excel";
import {
  createUser,
  saveImportedUsers,
  deleteAndBlockUser,
  resetPasswordToDefault,
  sendPasswordResetEmailToUser,
  bulkDeleteUsers,
  bulkResetPasswords,
  getMiddleInitial,
} from "../../assets/scripts/enroll";

// Import the modals
import ExcelModal from "../../assets/modals/excelModal.js";
import AddUserModal from "../../assets/modals/addUserModal.jsx";

const DEFAULT_PASSWORD = "UserUser321";
const ROLES = ["Adviser", "Project Manager", "Member"];

const InstructorEnroll = () => {
  // Role filter
  const [selectedRole, setSelectedRole] = useState("Adviser");

  // Dialog state
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [openExcelModal, setOpenExcelModal] = useState(false);

  // Add user form state
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

  // User list state
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [qText, setQText] = useState("");

  // Excel import state
  const [importState, setImportState] = useState({
    open: false,
    rows: [],
    parsing: false,
    saving: false,
    err: "",
  });

  const fileRef = useRef(null);

  // Handle search and filter
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

  // Open and close modal functions
  const closeAddUserModal = () => setOpenAddUserModal(false);
  const closeExcelModal = () => setOpenExcelModal(false);

  // Trigger Excel file import
  //const triggerExcelModal = () => setOpenExcelModal(true);
  const triggerExcelModal = () => {
    // Open file picker immediately
    if (fileRef.current) {
      fileRef.current.click();
    }
  };
  const triggerAddUserModal = () => setOpenAddUserModal(true);

  // Handle Excel file import change
  /*const handleImportChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateExcelFile(file)) {
      setImportState({
        open: true,
        rows: [],
        parsing: false,
        saving: false,
        err: "Please select a .xlsx Excel file.",
      });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    try {
      setImportState((p) => ({ ...p, parsing: true, err: "" }));
      const rows = await parseExcelFile(file, selectedRole);
      setImportState({
        open: true,
        rows,
        parsing: false,
        saving: false,
        err: "",
      });
    } catch (error) {
      setImportState({
        open: true,
        rows: [],
        parsing: false,
        saving: false,
        err: error.message,
      });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };*/

  const handleImportChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateExcelFile(file)) {
      ExcelModal.show({
        rows: [],
        parsing: false,
        saving: false,
        err: "Please select a .xlsx Excel file.",
        onFileChange: handleImportChange,
        onSave: saveImportedRows,
        onClose: () => {},
      });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    try {
      setImportState((p) => ({ ...p, parsing: true, err: "" }));
      const rows = await parseExcelFile(file, selectedRole);

      // Show the SweetAlert2 modal with parsed rows
      ExcelModal.show({
        rows: rows,
        parsing: false,
        saving: false,
        err: "",
        onFileChange: handleImportChange,
        onSave: saveImportedRows,
        onClose: () => {
          setImportState({
            open: false,
            rows: [],
            parsing: false,
            saving: false,
            err: "",
          });
        },
      });
    } catch (error) {
      ExcelModal.show({
        rows: [],
        parsing: false,
        saving: false,
        err: error.message,
        onFileChange: handleImportChange,
        onSave: saveImportedRows,
        onClose: () => {},
      });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Save imported users to Firestore
  const saveImportedRows = async () => {
    const rows = importState.rows.filter((r) => r._select);
    if (rows.length === 0) {
      setImportState((p) => ({ ...p, err: "Nothing selected to save." }));
      return;
    }

    setImportState((p) => ({ ...p, saving: true, err: "" }));
    try {
      await saveImportedUsers(rows, selectedRole);
      setImportState({
        open: false,
        rows: [],
        parsing: false,
        saving: false,
        err: "",
      });
    } catch (error) {
      setImportState((p) => ({
        ...p,
        saving: false,
        err: error.message,
      }));
    }
  };

  // Create user function
  const handleSaveUser = async () => {
    setError("");
    setSaving(true);
    try {
      await createUser(form);
      setForm({
        email: "",
        lastName: "",
        firstName: "",
        middleName: "",
        idNumber: "",
        role: selectedRole,
      });
      setOpenAddUserModal(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Fetch users from Firestore based on selected role
  useEffect(() => {
    setLoadingList(true);
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

  // Bulk delete users
  const [selectedIds, setSelectedIds] = useState([]);
  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete/Block ${selectedIds.length} account(s)?`)) return;

    await bulkDeleteUsers(selectedIds, users);
    setSelectedIds([]);
  };

  const handleBulkResetDefault = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Reset password to default for ${selectedIds.length} account(s)?`
      )
    )
      return;

    await bulkResetPasswords(selectedIds);
    alert("Selected users will get default password on next successful login.");
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Hidden file input for Excel */}
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleImportChange}
      />

      <main className="flex-1 flex flex-col px-6 md:px-10 py-6">
        {/* Top actions */}
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
                  onClick={handleBulkResetDefault}
                  className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                  title="Reset selected to default"
                >
                  <Undo2 className="w-4 h-4" />
                  Reset Selected
                </button>
                <button
                  onClick={handleBulkDelete}
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
                  Download Template
                </button>
                <button
                  onClick={triggerExcelModal}
                  className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <Upload className="w-4 h-4" />
                  Import File
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter, search, and user list */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

        {/* User list */}
        <div className="mt-6 flex flex-col md:flex-row gap-6">
          {/* User Table */}
          <div className="flex-1">
            <div className="border border-neutral-200 rounded-2xl shadow-lg overflow-visible bg-white">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === users.length}
                        onChange={() =>
                          setSelectedIds(
                            selectedIds.length === users.length
                              ? []
                              : users.map((u) => u.id)
                          )
                        }
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                      ID Number
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                      Last Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                      First Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                      Middle Initial
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-200">
                  {loadingList ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-neutral-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-neutral-500"
                      >
                        No users found.
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
                        <td className="px-4 py-3 text-sm text-neutral-700">
                          {u.idNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700">
                          {u.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700">
                          {u.firstName}
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700">
                          {getMiddleInitial(u.middleName)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Button */}
          <div className="w-full md:w-64">
            <button
              type="button"
              onClick={triggerAddUserModal}
              className="w-full h-full focus:outline-none"
              aria-haspopup="dialog"
              aria-expanded={openAddUserModal}
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

      {/* Add User Modal */}
      <AddUserModal
        open={openAddUserModal}
        form={form}
        onChange={(key) => (e) =>
          setForm((f) => ({ ...f, [key]: e.target.value }))}
        handleSaveUser={handleSaveUser}
        saving={saving}
        closeModal={closeAddUserModal}
        error={error}
      />
    </div>
  );
};

export default InstructorEnroll;
