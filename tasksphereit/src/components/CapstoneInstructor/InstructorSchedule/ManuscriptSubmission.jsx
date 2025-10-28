// src/components/CapstoneInstructor/ManuscriptSubmission.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Download,
  MoreVertical,
  Calendar as CalIcon,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
  Trash2,
  X,
  Filter,
} from "lucide-react";

/* ===== Firestore ===== */
import { db } from "../../../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const MAROON = "#6A0F14";
const COLLECTION = "manuscriptSubmissions";

/* ---------- small helpers ---------- */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDateHuman = (yyyy_mm_dd) => {
  if (!yyyy_mm_dd) return "";
  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  return `${MONTHS[(m || 1) - 1]} ${Number(d || 1)}, ${y}`;
};
const to12h = (t) => {
  if (!t) return "";
  const [H, M] = t.split(":").map(Number);
  const ampm = H >= 12 ? "PM" : "AM";
  const hh = ((H + 11) % 12) + 1;
  return `${hh}:${String(M).padStart(2, "0")} ${ampm}`;
};

/* ---------- your button (unchanged style) ---------- */
const Btn = ({ children, variant = "solid", icon: Icon, className = "", ...props }) => {
  const base =
    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium cursor-pointer " +
    "focus:outline-none focus:ring-2 focus:ring-neutral-200 " + className;
  const cls =
    variant === "solid"
      ? base + " text-white"
      : base + " border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50";
  const style = variant === "solid" ? { backgroundColor: MAROON } : undefined;
  return (
    <button {...props} className={cls} style={style}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const VerdictPill = ({ verdict }) => {
  const v = (verdict || "").toLowerCase();
  const styles =
    v === "passed"
      ? "bg-[#6BA34D] text-white"
      : v === "recheck"
      ? "bg-[#F59E0B] text-white"
      : "bg-[#9CA3AF] text-white"; // Pending
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${styles}`}>
      {verdict}
    </span>
  );
};

const Breadcrumbs = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 text-neutral-700">
      <button
        onClick={() => navigate("/instructor/schedule")}
        className="inline-flex items-center gap-2 text-[15px] font-medium text-neutral-600 hover:underline"
      >
        <FileText size={16} className="text-neutral-500" />
        Schedule
      </button>
      <ChevronRight size={16} className="text-neutral-400" />
      <span className="text-[15px] font-semibold">Manuscript Submission</span>
    </div>
  );
};

export default function ManuscriptSubmission() {
  const [showCreate, setShowCreate] = useState(false);

  /* ===== Teams (for pickers) ===== */
  const [teamOptions, setTeamOptions] = useState([]); // [{id, name}]
  const [loadingTeams, setLoadingTeams] = useState(true);

  /* ===== Submissions list ===== */
  const [rows, setRows] = useState([]); // firestore rows
  const [loadingRows, setLoadingRows] = useState(true);

  /* ===== Row actions ===== */
  const [query, setQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 }); // <-- fixed menu coords
  const [editRow, setEditRow] = useState(null);
  const [viewRow, setViewRow] = useState(null);

  // close menu on outside click / ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpenId(null);
    const onClick = (e) => {
      // if clicking a menu button, let it handle
      if (!(e.target.closest && e.target.closest("[data-menu-root]"))) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Fetch teams
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "teams"));
        const teams = [];
        snap.forEach((docX) => {
          const data = docX.data();
          if (data?.name) teams.push({ id: docX.id, name: data.name });
        });
        teams.sort((a, b) => a.name.localeCompare(b.name));
        if (alive) setTeamOptions(teams);
      } catch (e) {
        console.error("[Manuscripts] Failed to load teams:", e);
      } finally {
        if (alive) setLoadingTeams(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Load manuscript submissions
  const loadRows = async () => {
    setLoadingRows(true);
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      const arr = [];
      snap.forEach((docX) => {
        const d = docX.data();
        arr.push({
          id: docX.id,
          teamId: d?.teamId || null,
          team: d?.teamName || "",
          title: d?.title || "",
          date: d?.date || "",       // yyyy-mm-dd
          time: d?.time || "",       // HH:MM
          plag: Number(d?.plag ?? 0),
          ai: Number(d?.ai ?? 0),
          file: d?.file || "—",
          verdict: d?.verdict || "Pending",
          createdAt: d?.createdAt,
        });
      });
      // sort by due date + time
      arr.sort((a, b) => {
        const ad = a.date || "", bd = b.date || "";
        if (ad < bd) return -1;
        if (ad > bd) return 1;
        return (a.time || "").localeCompare(b.time || "");
      });
      setRows(arr);
    } catch (e) {
      console.error("[Manuscripts] Failed to load submissions:", e);
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  // verdict inline update (Pending / Recheck / Passed)
  const handleChangeVerdict = async (id, verdict) => {
    try {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, verdict } : r)));
      await updateDoc(doc(db, COLLECTION, id), { verdict });
    } catch (e) {
      console.error("[Manuscripts] Verdict update failed:", e);
      await loadRows();
      alert("Failed to update verdict.");
    }
  };

  // delete row
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this manuscript submission?")) return;
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      setMenuOpenId(null);
      await loadRows();
    } catch (e) {
      console.error("[Manuscripts] Delete failed:", e);
      alert("Failed to delete.");
    }
  };

  // search filter (client)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.team.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        (r.file || "").toLowerCase().includes(q)
    );
  }, [query, rows]);

  // open menu & anchor to button (viewport coords)
  const onOpenMenu = (id, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // align right edge, leave 4px gap below
    const menuWidth = 160;
    const x = Math.max(8, rect.right - menuWidth);
    const y = rect.bottom + 4;
    setMenuPos({ x, y });
    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  // cell color helper for ≤10% = green
  const pctClass = (n) => (Number(n) <= 10 ? "text-[#6BA34D]" : "text-[#E45454]");

  return (
    <div className="p-6">
      {/* breadcrumb + maroon divider */}
      <Breadcrumbs />
      <div className="mt-2 h-[2px] w-full bg-neutral-200">
        <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 320 }} />
      </div>

      {/* actions row */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Btn icon={Plus} onClick={() => setShowCreate(true)}>Create Schedule</Btn>
        </div>
        <Btn icon={Trash2} variant="outline" onClick={() => alert("Select a row’s ••• menu to delete.")}>
          Delete
        </Btn>
      </div>

      {/* table card */}
      <div className="mt-4 rounded-xl border border-neutral-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
        {/* header tools */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-3 py-2 w-72 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-neutral-400" />
          </div>

          <div className="flex items-center gap-2 pb-2">
            <Btn icon={Filter} variant="outline" className="!px-2">Filters</Btn>
            <Btn icon={Download} variant="outline">Export</Btn>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto"> {/* keep horizontal scroll; menu is fixed so it won't be clipped */}
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-left px-4 py-3 w-16">NO</th>
                <th className="text-left px-4 py-3">Team</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">
                  <div className="inline-flex items-center gap-2"><CalIcon size={16} /> Due Date</div>
                </th>
                <th className="text-left px-4 py-3">
                  <div className="inline-flex items-center gap-2"><Clock size={16} /> Time</div>
                </th>
                <th className="text-left px-4 py-3">Plagiarism</th>
                <th className="text-left px-4 py-3">AI</th>
                <th className="text-left px-4 py-3">File Uploaded</th>
                <th className="text-left px-4 py-3">Verdict</th>
                <th className="text-left px-4 py-3 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingRows ? (
                <tr>
                  <td className="px-4 py-8 text-neutral-500" colSpan={10}>Loading manuscript submissions…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-neutral-500" colSpan={10}>
                    No records match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id} className={idx % 2 ? "bg-neutral-50/60" : "bg-white"}>
                    <td className="px-4 py-3 text-neutral-600">{idx + 1}.</td>
                    <td className="px-4 py-3 font-medium text-neutral-800">{r.team}</td>
                    <td className="px-4 py-3 text-neutral-800">{r.title}</td>
                    <td className="px-4 py-3 text-neutral-700">{fmtDateHuman(r.date)}</td>
                    <td className="px-4 py-3 text-neutral-700">{to12h(r.time)}</td>
                    <td className={`px-4 py-3 font-semibold ${pctClass(r.plag)}`}>{r.plag}%</td>
                    <td className={`px-4 py-3 font-semibold ${pctClass(r.ai)}`}>{r.ai}%</td>
                    <td className="px-4 py-3 text-neutral-700">{r.file || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="relative inline-flex items-center">
                        <select
                          value={r.verdict || "Pending"}
                          onChange={(e) => handleChangeVerdict(r.id, e.target.value)}
                          className="appearance-none pr-8 pl-3 py-1.5 rounded-md border text-sm"
                          style={{ borderColor: MAROON, color: "#111827" }}
                        >
                          <option>Pending</option>
                          <option>Recheck</option>
                          <option>Passed</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-2 pointer-events-none text-neutral-500" />
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <button
                        data-menu-root
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 cursor-pointer"
                        onClick={(e) => onOpenMenu(r.id, e)}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {/* Fixed-position floating menu; not clipped by scroll containers */}
                      {menuOpenId === r.id && (
                        <div
                          data-menu-root
                          className="fixed z-50 w-40 rounded-md border bg-white shadow"
                          style={{ left: menuPos.x, top: menuPos.y }}
                        >
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                            onClick={() => { setViewRow(r); setMenuOpenId(null); }}
                          >
                            View
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                            onClick={() => { setEditRow(r); setMenuOpenId(null); }}
                          >
                            Edit
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-neutral-50"
                            onClick={() => handleDelete(r.id)}
                          >
                            Delete
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

        <div className="h-2" />
      </div>

      {/* dialogs */}
      {showCreate && (
        <CreateOrEditDialog
          mode="create"
          onClose={() => setShowCreate(false)}
          onSaved={loadRows}
          teamOptions={teamOptions}
          loadingTeams={loadingTeams}
        />
      )}
      {editRow && (
        <CreateOrEditDialog
          mode="edit"
          initial={editRow}
          onClose={() => setEditRow(null)}
          onSaved={loadRows}
          teamOptions={teamOptions}
          loadingTeams={loadingTeams}
        />
      )}
      {viewRow && (
        <ViewTeamDialog
          row={viewRow}
          onClose={() => setViewRow(null)}
        />
      )}
    </div>
  );
}

/* ---------------- Create/Edit Dialog ---------------- */
function CreateOrEditDialog({
  mode = "create",
  initial = null,
  onClose,
  onSaved,
  teamOptions = [],
  loadingTeams = false,
}) {
  const isEdit = mode === "edit";

  const [teamName, setTeamName] = useState(initial?.team || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [date, setDate] = useState(initial?.date || "2025-03-25");
  const [time, setTime] = useState(initial?.time || "08:00");
  const [plag, setPlag] = useState(String(initial?.plag ?? 0));
  const [ai, setAi] = useState(String(initial?.ai ?? 0));

  // File name is controlled by back office / uploader — keep as placeholder only
  const fileVal = "—";

  const disabled =
    !teamName || !title || !date || !time || Number(plag) < 0 || Number(ai) < 0;

  const handleSubmit = async () => {
    try {
      const team = teamOptions.find((t) => t.name === teamName);
      const payload = {
        teamId: team?.id || null,
        teamName,
        title,
        date,
        time,
        plag: Number(plag) || 0,
        ai: Number(ai) || 0,
        file: fileVal, // always placeholder here
      };

      if (isEdit) {
        await updateDoc(doc(db, COLLECTION, initial.id), payload);
      } else {
        await addDoc(collection(db, COLLECTION), {
          ...payload,
          verdict: "Pending",
          createdAt: serverTimestamp(),
        });
      }

      if (typeof onSaved === "function") onSaved();
      onClose();
    } catch (e) {
      console.error(isEdit ? "[Manuscripts] Update failed:" : "[Manuscripts] Create failed:", e);
      alert("Operation failed. See console for details.");
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div className="absolute left-1/2 top-1/2 w-[560px] -translate-x-1/2 -translate-y-1/2">
        <div className="rounded-2xl bg-white border border-neutral-200 shadow-2xl">
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="text-[16px] font-semibold" style={{ color: MAROON }}>
              {isEdit ? "Edit Submission" : "Create Submission"}
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 grid place-items-center rounded-md hover:bg-neutral-100"
            >
              <X size={18} className="text-neutral-500" />
            </button>
          </div>
          <div className="mt-3 h-[2px] w-full bg-neutral-200">
            <div className="h-[2px]" style={{ backgroundColor: MAROON, width: isEdit ? 150 : 160 }} />
          </div>

          {/* body */}
          <div className="px-5 py-5">
            <div className="grid grid-cols-2 gap-5">
              {/* Team */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Assign Team</label>
                <div className="relative">
                  <select
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full appearance-none pr-8 pl-3 py-2 rounded-md border border-neutral-300 text-sm bg-white"
                    disabled={loadingTeams}
                  >
                    <option value="">Select</option>
                    {loadingTeams && <option>Loading…</option>}
                    {!loadingTeams &&
                      teamOptions.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              {/* Title */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Manuscript Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 rounded-md border border-neutral-300 text-sm"
                  placeholder="e.g., FitTrack"
                />
              </div>

              {/* Date / Time */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Due Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 rounded-md border border-neutral-300 text-sm"
                  />
                  <Calendar size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 rounded-md border border-neutral-300 text-sm"
                  />
                  <Clock size={16} className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none" />
                </div>
              </div>

              {/* Plag / AI */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Plagiarism %</label>
                <input
                  type="number"
                  min="0"
                  value={plag}
                  onChange={(e) => setPlag(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 rounded-md border border-neutral-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">AI %</label>
                <input
                  type="number"
                  min="0"
                  value={ai}
                  onChange={(e) => setAi(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 rounded-md border border-neutral-300 text-sm"
                />
              </div>

              {/* File name (removed input; shown as read-only text to reflect policy) */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">File Uploaded (name)</label>
                <div className="w-full pl-3 pr-3 py-2 rounded-md border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
                  — (handled by uploader)
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={disabled}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                style={{ backgroundColor: MAROON }}
              >
                {isEdit ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- View Team Dialog ---------------- */
function ViewTeamDialog({ row, onClose }) {
  const [loading, setLoading] = useState(true);
  const [adviser, setAdviser] = useState("-");
  const [manager, setManager] = useState("-");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (row?.teamId) {
          const ref = doc(db, "teams", row.teamId);
          const snap = await getDoc(ref);
          const data = snap.exists() ? snap.data() : null;
          if (alive && data) {
            setAdviser(data?.adviser?.fullName || "-");
            setManager(data?.manager?.fullName || "-");
            setMembers(Array.isArray(data?.memberNames) ? data.memberNames : []);
          }
        } else {
          setAdviser("-");
          setManager("-");
          setMembers([]);
        }
      } catch (e) {
        console.error("[Manuscripts] View team failed:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [row?.teamId]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] max-w-[92vw]">
        <div className="rounded-2xl bg-white border border-neutral-200 shadow-2xl focus:outline-none p-0">
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="text-[16px] font-semibold" style={{ color: MAROON }}>
              View Team
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 grid place-items-center rounded-md hover:bg-neutral-100"
            >
              <X size={18} className="text-neutral-500" />
            </button>
          </div>
          <div className="mt-3 h-[2px] w-full bg-neutral-200">
            <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 110 }} />
          </div>

          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Team</label>
                <div className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
                  {row?.team || "-"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Adviser</label>
                <div className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
                  {loading ? "Loading…" : adviser}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Project Manager</label>
                <div className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
                  {loading ? "Loading…" : manager}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Members</label>
                <div className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-sm">
                  {loading ? (
                    "Loading…"
                  ) : members.length === 0 ? (
                    <span className="text-neutral-500">No members listed.</span>
                  ) : (
                    <ul className="list-disc ml-5 space-y-1">
                      {members.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
