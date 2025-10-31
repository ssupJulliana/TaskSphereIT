// src/components/CapstoneInstructor/InstructorEnroll.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Download,
  Upload,
  Search,
  Filter as FilterIcon,
  PlusCircle,
  Undo2,
  Trash2,
  FileText,
  X,
} from "lucide-react";
import { db } from "../../config/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { parseExcelFile, validateExcelFile } from "../../assets/scripts/excel";
import {
  createUser,
  saveImportedUsers,
  bulkDeleteUsers,
  bulkResetPasswords,
  getMiddleInitial,
} from "../../assets/scripts/enroll";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelModal from "../../assets/modals/excelModal.js";
import AddUserModal from "../../assets/modals/addUserModal.jsx";

/* ---------- tabs & role mapping ---------- */
const TABS = ["Adviser", "Student"];
const STUDENT_ROLES = ["Project Manager", "Member"];
const displayPlural = (tab) => (tab === "Student" ? "Students" : "Advisers");

const InstructorEnroll = () => {
  /* ---------------- Role & dialogs ---------------- */
  const [selectedTab, setSelectedTab] = useState("Adviser");
  const [openAddUserModal, setOpenAddUserModal] = useState(false);

  /* ---------------- Add user form ---------------- */
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

  /* ---------------- Users list ---------------- */
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [qText, setQText] = useState("");

  /* ---------------- Filters ---------------- */
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [fTos, setFTos] = useState("any");
  const [fMustChange, setFMustChange] = useState("any");
  const [fCreatedFrom, setFCreatedFrom] = useState("");
  const [fCreatedTo, setFCreatedTo] = useState("");
  const [sortBy, setSortBy] = useState("lastName");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    const onDocClick = (e) => {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    if (filterOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [filterOpen]);

  /* ---------------- Excel import ---------------- */
  const [importState, setImportState] = useState({
    open: false,
    rows: [],
    parsing: false,
    saving: false,
    err: "",
  });

  const fileRef = useRef(null);
  const triggerExcelModal = () => fileRef.current?.click();

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
      const rows = await parseExcelFile(file, selectedTab === "Student" ? "Student" : "Adviser");
      ExcelModal.show({
        rows,
        parsing: false,
        saving: false,
        err: "",
        onFileChange: handleImportChange,
        onSave: saveImportedRows,
        onClose: () =>
          setImportState({ open: false, rows: [], parsing: false, saving: false, err: "" }),
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

  const saveImportedRows = async () => {
    const rows = importState.rows.filter((r) => r._select);
    if (rows.length === 0) {
      setImportState((p) => ({ ...p, err: "Nothing selected to save." }));
      return;
    }
    setImportState((p) => ({ ...p, saving: true, err: "" }));
    try {
      await saveImportedUsers(rows, selectedTab);
      setImportState({ open: false, rows: [], parsing: false, saving: false, err: "" });
    } catch (error) {
      setImportState((p) => ({ ...p, saving: false, err: error.message }));
    }
  };

  /* ---------------- Create user ---------------- */
  const handleSaveUser = async () => {
    setError("");
    setSaving(true);
    try {
      await createUser({ ...form });
      setForm({
        email: "",
        lastName: "",
        firstName: "",
        middleName: "",
        idNumber: "",
        role: selectedTab === "Adviser" ? "Adviser" : "Project Manager",
      });
      setOpenAddUserModal(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Firestore subscription ---------------- */
  useEffect(() => {
    setLoadingList(true);
    const usersRef = collection(db, "users");
    let qy;
    if (selectedTab === "Student") {
      qy = query(usersRef, where("role", "in", STUDENT_ROLES));
    } else {
      qy = query(usersRef, where("role", "==", "Adviser"));
    }
    const unsub = onSnapshot(
      qy,
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
  }, [selectedTab]);

  /* ---------------- Search + Filter + Sort (client-side) ---------------- */
  const filteredUsers = useMemo(() => {
    let arr = [...users];

    const needle = qText.trim().toLowerCase();
    if (needle) {
      arr = arr.filter((u) => {
        const mid = u.middleName || "";
        return (
          (u.idNumber || "").toLowerCase().includes(needle) ||
          (u.firstName || "").toLowerCase().includes(needle) ||
          (u.lastName || "").toLowerCase().includes(needle) ||
          mid.toLowerCase().includes(needle) ||
          (u.email || "").toLowerCase().includes(needle)
        );
      });
    }

    if (fTos !== "any") {
      const want = fTos === "accepted";
      arr = arr.filter((u) => !!u.isTosAccepted === want);
    }

    if (fMustChange !== "any") {
      const want = fMustChange === "true";
      arr = arr.filter((u) => !!u.mustChangePassword === want);
    }

    const from = fCreatedFrom ? new Date(`${fCreatedFrom}T00:00:00`) : null;
    const to = fCreatedTo ? new Date(`${fCreatedTo}T23:59:59`) : null;
    if (from) {
      arr = arr.filter((u) => {
        const d = u.createdAt?.toDate ? u.createdAt.toDate() : u.createdAt;
        return d ? new Date(d) >= from : false;
      });
    }
    if (to) {
      arr = arr.filter((u) => {
        const d = u.createdAt?.toDate ? u.createdAt.toDate() : u.createdAt;
        return d ? new Date(d) <= to : false;
      });
    }

    const field = sortBy;
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      const va =
        field === "createdAt"
          ? (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0)
          : (a[field] || "").toString().toLowerCase();
      const vb =
        field === "createdAt"
          ? (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0)
          : (b[field] || "").toString().toLowerCase();

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    return arr;
  }, [users, qText, fTos, fMustChange, fCreatedFrom, fCreatedTo, sortBy, sortDir]);

  /* ---------------- Bulk actions ---------------- */
  const [selectedIds, setSelectedIds] = useState([]);
  const toggleOne = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () =>
    setSelectedIds((prev) => (prev.length === filteredUsers.length ? [] : filteredUsers.map((u) => u.id)));

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete/Block ${selectedIds.length} account(s)?`)) return;
    await bulkDeleteUsers(selectedIds, users);
    setSelectedIds([]);
  };

  const handleBulkResetDefault = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Reset password to default for ${selectedIds.length} account(s)?`)) return;
    await bulkResetPasswords(selectedIds);
    alert("Selected users will get default password on next successful login.");
    setSelectedIds([]);
  };

  /* ---------------- Export PDF (ONLY the 4 visible columns) ---------------- */
  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt" });
    const title = `TaskSphere IT — ${displayPlural(selectedTab)} (${filteredUsers.length})`;
    doc.setFontSize(14);
    doc.text(title, 40, 40);

    const head = [["ID Number", "Last Name", "First Name", "Middle Initial"]];
    const body = filteredUsers.map((u) => [
      u.idNumber || "",
      u.lastName || "",
      u.firstName || "",
      getMiddleInitial(u.middleName),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 60,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [106, 15, 20] },
    });

    const fname = `users_${selectedTab}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fname);
  };

  const resetFilters = () => {
    setFTos("any");
    setFMustChange("any");
    setFCreatedFrom("");
    setFCreatedTo("");
    setSortBy("lastName");
    setSortDir("asc");
  };

  /* ---------- allowed roles for modal ---------- */
  const roleOptions = selectedTab === "Student" ? STUDENT_ROLES : ["Adviser"];
  const lockRole = roleOptions.length === 1; // lock when only one choice

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleImportChange}
      />

      <main className="flex-1 flex flex-col px-6 md:px-10 py-6">
        {/* ===== Header + underline ===== */}
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-semibold text-neutral-900">
              {displayPlural(selectedTab)}
            </h2>
          </div>

          {/* thin wide bar only */}
          <div className="mt-3 h-[2px] w-full bg-[#6A0F14]" />
        </div>

        {/* ===== Action buttons (LEFT aligned) ===== */}
        <div className="mt-5 flex justify-start">
          {selectedIds.length > 0 ? (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleBulkResetDefault}
                className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                <Undo2 className="w-4 h-4" />
                Reset Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              <button className="cursor-pointer flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                <Download className="w-4 h-4" />
                Download Template
              </button>
              <button
                onClick={exportPdf}
                className="cursor-pointer flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={triggerExcelModal}
                className="cursor-pointer flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              >
                <Upload className="w-4 h-4" />
                Import File
              </button>
            </div>
          )}
        </div>

        {/* ===== Tabs + search/filters row ===== */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setForm((f) => ({
                    ...f,
                    role:
                      tab === "Adviser"
                        ? "Adviser"
                        : STUDENT_ROLES.includes(f.role)
                        ? f.role
                        : "Project Manager",
                  }));
                }}
                className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium ${
                  selectedTab === tab
                    ? "bg-[#6A0F14] text-white"
                    : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search + filter */}
          <div className="relative flex items-center w-full md:max-w-xl gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-4 h-4 text-neutral-500" />
              </span>
              <input
                type="text"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Search by ID, name, or email"
                className="w-full rounded-full border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
              />
            </div>

            <button
              onClick={() => setFilterOpen((s) => !s)}
              className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-100 cursor-pointer"
              aria-haspopup="dialog"
              aria-expanded={filterOpen}
              aria-controls="enroll-filter-popover"
            >
              <FilterIcon className="w-5 h-5 text-neutral-600" />
            </button>

            {filterOpen && (
              <div
                id="enroll-filter-popover"
                ref={filterRef}
                className="absolute right-0 top-11 z-20 w-[min(560px,92vw)] rounded-2xl border border-neutral-200 bg-white shadow-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Filters</div>
                  <button
                    className="p-1.5 rounded-md hover:bg-neutral-100 cursor-pointer "
                    onClick={() => setFilterOpen(false)}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 " />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      ToS Status
                    </label>
                    <select
                      value={fTos}
                      onChange={(e) => setFTos(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                    >
                      <option value="any">Any</option>
                      <option value="accepted">Accepted</option>
                      <option value="not">Not accepted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Must Change Password
                    </label>
                    <select
                      value={fMustChange}
                      onChange={(e) => setFMustChange(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                    >
                      <option value="any">Any</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Created From
                    </label>
                    <input
                      type="date"
                      value={fCreatedFrom}
                      onChange={(e) => setFCreatedFrom(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Created To
                    </label>
                    <input
                      type="date"
                      value={fCreatedTo}
                      onChange={(e) => setFCreatedTo(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                    >
                      <option value="lastName">Last Name</option>
                      <option value="firstName">First Name</option>
                      <option value="idNumber">ID Number</option>
                      <option value="createdAt">Created Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Direction
                    </label>
                    <select
                      value={sortDir}
                      onChange={(e) => setSortDir(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="text-sm text-neutral-700 underline underline-offset-2"
                    onClick={resetFilters}
                  >
                    Reset all
                  </button>
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 rounded-lg border border-neutral-300 text-sm hover:bg-neutral-100"
                      onClick={() => setFilterOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== User list ===== */}
        <div className="mt-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="border border-neutral-200 rounded-2xl shadow-lg overflow-visible bg-white">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={toggleAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">ID Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Last Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">First Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Middle Initial</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-200">
                  {loadingList ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-neutral-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-neutral-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(u.id)}
                            onChange={() => toggleOne(u.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{u.idNumber || ""}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{u.lastName || ""}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{u.firstName || ""}</td>
                        <td className="px-4 py-3 text-sm text-neutral-700">{getMiddleInitial(u.middleName)}</td>
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
              onClick={() => {
                setForm((f) => ({
                  ...f,
                  role:
                    selectedTab === "Adviser"
                      ? "Adviser"
                      : STUDENT_ROLES.includes(f.role)
                      ? f.role
                      : "Project Manager",
                }));
                setOpenAddUserModal(true);
              }}
              className="w-full h-full focus:outline-none"
              aria-haspopup="dialog"
              aria-expanded={openAddUserModal}
            >
              <div className="flex flex-col items-center justify-center border border-neutral-200 rounded-2xl shadow-lg p-6 h-full hover:bg-neutral-50">
                <div className="flex items-center justify-center h-16 w-16 rounded-full border border-neutral-300">
                  <PlusCircle className="w-8 h-8 text-[#6A0F14]" />
                </div>
                <p className="mt-4 text-base font-semibold text-[#6A0F14] text-center uppercase tracking-wide">
                  Add {selectedTab === "Student" ? "Student" : "Adviser"}
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Add User Modal (role list/lock passed in) */}
      <AddUserModal
        open={openAddUserModal}
        form={form}
        onChange={(key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        handleSaveUser={handleSaveUser}
        saving={saving}
        closeModal={() => setOpenAddUserModal(false)}
        error={error}
        roleOptions={roleOptions}     // ← only show valid roles
        lockRole={lockRole}           // ← disable/hide dropdown when single option
      />
    </div>
  );
};

export default InstructorEnroll;
