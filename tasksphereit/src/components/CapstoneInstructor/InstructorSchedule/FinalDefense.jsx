// src/components/CapstoneInstructor/InstructorSchedule/FinalDefense.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  MoreVertical,
  Calendar as CalIcon,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  User2,
  X,
  PlusCircle,
} from "lucide-react";

/* ===== Firestore ===== */
import { db } from "../../../config/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

/* ===== PDF ===== */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MAROON = "#6A0F14";

/* ===== helpers ===== */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const fmtDate = (yyyy_mm_dd) => {
  if (!yyyy_mm_dd) return "";
  const [y, m, d] = yyyy_mm_dd.split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
};

const fmtTimeRange = (start, end) => {
  const isBlankish = (v) =>
    v == null || ["", "-", "—", "——"].includes(String(v).trim());
  const to12h = (t) => {
    if (isBlankish(t)) return "";
    const [H, M] = String(t).split(":").map(Number);
    if (Number.isNaN(H) || Number.isNaN(M)) return "";
    const ampm = H >= 12 ? "PM" : "AM";
    const hh = ((H + 11) % 12) + 1;
    return `${hh}:${String(M).padStart(2, "0")} ${ampm}`;
  };
  const a = to12h(start);
  const b = to12h(end);
  if (!a && !b) return "";
  if (a && !b) return `${a} —`;
  if (!a && b) return `— ${b}`;
  return `${a} - ${b}`;
};

const Breadcrumbs = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 text-neutral-700">
      <button
        onClick={() => navigate("/instructor/schedule")}
        className="text-[15px] font-medium text-neutral-600 hover:underline"
      >
        Schedule
      </button>
      <ChevronRight size={16} className="text-neutral-400" />
      <span className="text-[15px] font-semibold">Final Defense</span>
      <ChevronRight size={16} className="text-neutral-400" />
      <span className="text-[15px]">Scheduled Teams</span>
    </div>
  );
};

// Button
const Btn = ({ children, variant = "solid", icon: Icon, className = "", ...props }) => {
  const base =
    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium cursor-pointer " +
    "focus:outline-none focus:ring-2 focus:ring-neutral-200 " +
    className;

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

export default function FinalDefense() {
  const navigate = useNavigate();
  const [queryText, setQueryText] = useState("");

  const [editSchedule, setEditSchedule] = useState(null);
  const [viewSchedule, setViewSchedule] = useState(null);

  /* ===== Firestore-backed options ===== */
  const [teamOptions, setTeamOptions] = useState([]); // [{id, name}]
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [adviserOptions, setAdviserOptions] = useState([]); // ["Full Name", ...]
  const [loadingAdvisers, setLoadingAdvisers] = useState(true);

  /* ===== Schedules list ===== */
  const [schedules, setSchedules] = useState([]); // [{id, ...}]
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // Row menu
  const [menuOpenId, setMenuOpenId] = useState(null);

  /* ===== Bulk delete state ===== */
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const exitBulk = () => {
    setBulkMode(false);
    setSelected(new Set());
  };
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Load Advisers from users where role == "Adviser"
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const qUsers = query(
          collection(db, "users"),
          where("role", "==", "Adviser")
        );
        const snap = await getDocs(qUsers);
        const names = [];
        snap.forEach((docX) => {
          const d = docX.data() || {};
          const full = [d.firstName, d.middleName, d.lastName]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          if (full) names.push(full);
        });
        names.sort((a, b) => a.localeCompare(b));
        if (!alive) return;
        setAdviserOptions(names);
      } catch (e) {
        console.error("Failed to load advisers from users:", e);
      } finally {
        if (alive) setLoadingAdvisers(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Fetch teams that passed Oral Defense (no time check needed since verdict indicates completion)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        console.log("🔍 Loading eligible teams for Final Defense...");
        
        // Load oral defense schedules first
        const oralDefenseSnap = await getDocs(collection(db, "oralDefenseSchedules"));
        const eligibleTeamIds = new Set();
        
        console.log("📊 Oral Defense schedules found:", oralDefenseSnap.size);
        
        oralDefenseSnap.forEach((docX) => {
          const data = docX.data();
          const teamId = data?.teamId;
          const verdict = data?.verdict;
          const teamName = data?.teamName;
          
          console.log(`Team ${teamId} (${teamName}): verdict=${verdict}`);
          
          // If verdict is "Passed", the oral defense is completed - no time check needed
          if (teamId && verdict === "Passed") {
            eligibleTeamIds.add(teamId);
            console.log(`✅ Team ${teamId} is eligible for Final Defense`);
          }
        });

        console.log("🎯 Eligible team IDs:", Array.from(eligibleTeamIds));

        // Now load teams but only include eligible ones
        const teamsSnap = await getDocs(collection(db, "teams"));
        const teams = [];
        teamsSnap.forEach((docX) => {
          const data = docX.data();
          if (data?.name && eligibleTeamIds.has(docX.id)) {
            teams.push({ id: docX.id, name: data.name });
            console.log(`🏷️ Adding team: ${data.name} (${docX.id})`);
          }
        });
        teams.sort((a, b) => a.name.localeCompare(b.name));
        if (alive) setTeamOptions(teams);
        
        console.log("📋 Final team options:", teams);
      } catch (e) {
        console.error("[FinalDefense] Failed to load eligible teams:", e);
      } finally {
        if (alive) setLoadingTeams(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load Schedules with Oral Defense filtering
  const loadSchedules = async () => {
    setLoadingSchedules(true);
    try {
      console.log("🔄 Loading Final Defense schedules...");
      
      // Create a map of team IDs that passed Oral Defense
      const oralDefenseSnap = await getDocs(collection(db, "oralDefenseSchedules"));
      const eligibleTeams = new Map();
      
      oralDefenseSnap.forEach((docX) => {
        const data = docX.data();
        const teamId = data?.teamId;
        const teamName = data?.teamName;
        const verdict = data?.verdict;
        
        if (teamId && teamName && verdict === "Passed") {
          eligibleTeams.set(teamId, teamName);
          console.log(`✅ Team ${teamName} (${teamId}) is eligible`);
        }
      });

      console.log("🎯 Eligible teams for Final Defense:", Array.from(eligibleTeams.entries()));

      // Load final defense schedules for eligible teams
      const finalDefenseSnap = await getDocs(collection(db, "finalDefenseSchedules"));
      const rows = [];
      
      console.log("📋 Final Defense schedules found:", finalDefenseSnap.size);
      
      finalDefenseSnap.forEach((docX) => {
        const data = docX.data();
        const teamId = data?.teamId;
        const teamName = data?.teamName;
        
        console.log(`Processing Final Defense schedule for team ${teamId} (${teamName})`);
        
        if (eligibleTeams.has(teamId)) {
          rows.push({
            id: docX.id,
            teamName: data?.teamName || "",
            teamId: teamId,
            date: data?.date || "",
            timeStart: data?.timeStart || "",
            timeEnd: data?.timeEnd || "",
            panelists: Array.isArray(data?.panelists) ? data.panelists : [],
            verdict: data?.verdict || "Pending",
            createdAt: data?.createdAt,
          });
          console.log(`✅ Added schedule for team ${teamName}`);
        } else {
          console.log(`❌ Skipped schedule for team ${teamName} - not eligible`);
        }
      });
      
      console.log("📄 Final rows to display:", rows);
      
      // Sorting and setting state
      rows.sort((a, b) => {
        const ad = a.date || "", bd = b.date || "";
        if (ad < bd) return -1;
        if (ad > bd) return 1;
        return (a.timeStart || "").localeCompare(b.timeStart || "");
      });
      
      setSchedules(rows);
      console.log("🎉 Schedules state updated with", rows.length, "items");
      
    } catch (e) {
      console.error("Failed to load schedules:", e);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  // verdict updater
  const handleChangeVerdict = async (scheduleId, newVerdict) => {
    try {
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === scheduleId ? { ...s, verdict: newVerdict } : s
        )
      );
      await updateDoc(doc(db, "finalDefenseSchedules", scheduleId), {
        verdict: newVerdict,
      });
    } catch (e) {
      console.error("Failed to update verdict:", e);
      await loadSchedules();
      alert("Failed to update verdict.");
    }
  };

 /* ===== PDF export (fits Verdict column) ===== */
  const handleExportPDF = () => {
    const title = "Final Defense Schedule";
    const doc = new jsPDF({ unit: "pt", format: "a4" }); // portrait A4
    const pageWidth = doc.internal.pageSize.getWidth();   // 595pt
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 40;                                   // 40pt margins
    const headerY = 46;

    const drawHeader = () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("DOMINICAN COLLEGE OF TARLAC, INC.", pageWidth / 2, headerY, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text("COLLEGE OF COMPUTER STUDIES", pageWidth / 2, headerY + 16, { align: "center" });
      doc.setFontSize(10);
      doc.text(
        "McArthur Highway, Poblacion (Sto. Rosario), Capas, 2315 Tarlac, Philippines",
        pageWidth / 2, headerY + 32, { align: "center" }
      );
      doc.text(
        "Institutional Contact Nos.: +63938-918-4093    Website: dct.edu.ph",
        pageWidth / 2, headerY + 48, { align: "center" }
      );
      doc.text(
        "E-mail: domct_2315@yahoo.com.ph / domct_2315@dct.edu.ph",
        pageWidth / 2, headerY + 64, { align: "center" }
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(title, pageWidth / 2, headerY + 96, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`As of ${new Date().toLocaleDateString()}`, pageWidth / 2, headerY + 112, { align: "center" });

      doc.setDrawColor(180);
      doc.line(marginX, headerY + 122, pageWidth - marginX, headerY + 122);
    };

    autoTable(doc, {
      startY: headerY + 134,
      head: [["NO", "Team", "Date", "Time", "Panelists", "Verdict"]],
      body: filtered.map((s, i) => [
        `${i + 1}.`,
        s.teamName || "",
        fmtDate(s.date) || "",
        fmtTimeRange(s.timeStart, s.timeEnd) || "",
        (s.panelists || []).join(", "),
        s.verdict || "",
      ]),
      styles: {
        fontSize: 9,
        cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: 60,
        lineWidth: 0.4,
        lineColor: [220, 220, 220],
        fontStyle: "bold",
      },
      bodyStyles: { lineWidth: 0.3, lineColor: [235, 235, 235] },
      columnStyles: {
        0: { cellWidth: 35 },               // NO
        1: { cellWidth: 150 },              // Team
        2: { cellWidth: 85 },               // Date
        3: { cellWidth: 95 },               // Time
        4: { cellWidth: 80 },               // Panelists
        5: { cellWidth: 70, halign: "center" }, // Verdict
      },
      margin: { left: marginX, right: marginX },
      tableWidth: pageWidth - marginX * 2,
      didDrawPage: () => {
        drawHeader();
        const str = `Page ${doc.internal.getNumberOfPages()}`;
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(str, pageWidth - marginX, pageHeight - 24, { align: "right" });
      },
    });

    const fname = `final_defense_schedule_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fname);
  };
  // search filter (client-side)
  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return schedules;
    return schedules.filter((t) =>
      [
        t.teamName,
        fmtDate(t.date),
        fmtTimeRange(t.timeStart, t.timeEnd),
        (t.panelists || []).join(", "),
        t.verdict,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [queryText, schedules]);

  // Select-all works on visible list
  const allVisibleIds = useMemo(() => filtered.map((s) => s.id), [filtered]);
  const allSelected =
    selected.size > 0 && allVisibleIds.every((id) => selected.has(id));
  const toggleSelectAll = () => {
    setSelected((prev) => (allSelected ? new Set() : new Set(allVisibleIds)));
  };

  // Delete button behavior
  const handleBulkDeleteClick = async () => {
    if (!bulkMode) {
      setBulkMode(true);
      return;
    }
    if (selected.size === 0) {
      alert("Select at least one schedule to delete.");
      return;
    }
    const ok = window.confirm(
      `Delete ${selected.size} selected schedule(s)? This cannot be undone.`
    );
    if (!ok) return;

    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          deleteDoc(doc(db, "finalDefenseSchedules", id))
        )
      );
      exitBulk();
      await loadSchedules();
    } catch (e) {
      console.error("Bulk delete failed:", e);
      alert("Failed to delete some schedules. See console for details.");
      await loadSchedules();
    }
  };

  // Debug log for table rendering
  console.log("🎯 Table rendering - schedules:", schedules.length, "filtered:", filtered.length);

  return (
    <div className="">
      <Breadcrumbs />
      <div className="mt-2 h-[2px] w-full bg-neutral-200">
        <div className="h-[2px]" style={{ backgroundColor: MAROON, width: 260 }} />
      </div>

      {/* actions */}
      <div className="mt-6 space-y-4">
        {/* Row 1: Back + Export PDF */}
        <div className="flex items-center gap-3">
          <Btn
            icon={ChevronLeft}
            variant="outline"
            onClick={() =>
              window.history.length
                ? window.history.back()
                : navigate("/instructor/schedule")
            }
          >
            Back to Schedule
          </Btn>
          <Btn icon={Download} variant="outline" onClick={handleExportPDF}>
            Export PDF
          </Btn>
        </div>

        {/* Row 2: Search (left) + Bulk controls (right) */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              className="pl-10 pr-3 py-2 w-72 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-neutral-400" />
          </div>

          <div className="flex items-center">
            {bulkMode && (
              <button
                onClick={exitBulk}
                className="mr-3 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 border border-neutral-300 bg-white"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* table */}
      <div className="mt-5 rounded-xl border border-neutral-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              {bulkMode ? (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4"
                  />
                </th>
              ) : (
                <th className="text-left px-4 py-3 w-16">NO</th>
              )}
              <th className="text-left px-4 py-3">Team</th>
              <th className="text-left px-4 py-3">
                <div className="inline-flex items-center gap-2">
                  <CalIcon size={16} /> Date
                </div>
              </th>
              <th className="text-left px-4 py-3">
                <div className="inline-flex items-center gap-2">
                  <Clock size={16} /> Time
                </div>
              </th>
              <th className="text-left px-4 py-3">Panelists</th>
              <th className="text-left px-4 py-3">Verdict</th>
              <th className="text-left px-4 py-3 w-16">Action</th>
            </tr>
          </thead>
          <tbody>
            {loadingSchedules ? (
              <tr>
                <td className="px-4 py-6 text-neutral-500" colSpan={7}>
                  Loading schedules…
                </td>
              </tr>
            ) : schedules.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-neutral-500" colSpan={7}>
                  No final defense schedules found for teams that passed Oral Defense.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-neutral-500" colSpan={7}>
                  No matches for "{queryText}".
                </td>
              </tr>
            ) : (
              filtered.map((s, idx) => {
                const isChecked = selected.has(s.id);
                return (
                  <tr
                    key={s.id}
                    className={idx % 2 ? "bg-neutral-50/60" : "bg-white"}
                  >
                    {/* first column: checkbox or row number */}
                    {bulkMode ? (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${s.teamName}`}
                          checked={isChecked}
                          onChange={() => toggleSelect(s.id)}
                          className="h-4 w-4"
                        />
                      </td>
                    ) : (
                      <td className="px-4 py-3 text-neutral-600">{idx + 1}.</td>
                    )}

                    <td className="px-4 py-3 font-medium text-neutral-800">
                      {s.teamName}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-neutral-700">
                      {fmtDate(s.date) || "—"}
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3 text-neutral-700">
                      {fmtTimeRange(s.timeStart, s.timeEnd) || "—"}
                    </td>

                    {/* Panelists */}
                    <td className="px-4 py-3 text-neutral-700">
                      {s.panelists.length > 0
                        ? s.panelists.join(", ")
                        : "—"}
                    </td>

                    {/* Verdict */}
                    <td className="px-4 py-3">
                      <div className="relative inline-flex items-center">
                        <select
                          value={s.verdict || "Pending"}
                          onChange={(e) =>
                            handleChangeVerdict(s.id, e.target.value)
                          }
                          disabled={bulkMode}
                          className={`appearance-none pr-8 pl-3 py-1.5 rounded-md border text-sm ${
                            bulkMode ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                          style={{ borderColor: MAROON, color: "#111827" }}
                        >
                          <option>Pending</option>
                          <option>Passed</option>
                          <option>Re-Defense</option>
                          <option>Failed</option>
                        </select>
                        <ChevronDown
                          size={16}
                          className="absolute right-2 pointer-events-none text-neutral-500"
                        />
                      </div>
                    </td>

                    {/* Row actions */}
                    <td className="px-2 py-3 relative">
                      <button
                        disabled={bulkMode}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                          bulkMode
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-neutral-100"
                        }`}
                        onClick={() =>
                          setMenuOpenId(menuOpenId === s.id ? null : s.id)
                        }
                      >
                        <MoreVertical size={18} />
                      </button>

                      {!bulkMode && menuOpenId === s.id && (
                        <div className="absolute right-2 mt-1 z-20 w-40 rounded-md border bg-white shadow">
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                            onClick={() => {
                              setViewSchedule(s);
                              setMenuOpenId(null);
                            }}
                          >
                            View Team
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                            onClick={() => {
                              setEditSchedule(s);
                              setMenuOpenId(null);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Schedule Dialog */}
      {editSchedule && (
        <ScheduleDialog
          initial={editSchedule}
          onClose={() => setEditSchedule(null)}
          onSaved={loadSchedules}
          teamOptions={teamOptions}
          loadingTeams={loadingTeams}
          adviserOptions={adviserOptions}
          loadingAdvisers={loadingAdvisers}
        />
      )}

      {/* View Team Dialog */}
      {viewSchedule && (
        <ViewTeamDialog
          schedule={viewSchedule}
          onClose={() => setViewSchedule(null)}
        />
      )}
    </div>
  );
}

/* ------- Edit Dialog (Create flow removed) ------- */
function ScheduleDialog({
  initial = null,
  onClose,
  onSaved,
  teamOptions = [],
  loadingTeams = false,
  adviserOptions = [],
  loadingAdvisers = false,
}) {
  const [team, setTeam] = useState(initial?.teamName || "");
  const [date, setDate] = useState(initial?.date || "");
  const [time, setTime] = useState(initial?.timeStart || "");
  const [timeEnd, setTimeEnd] = useState(initial?.timeEnd || "");

  const [panelistPick, setPanelistPick] = useState("");
  const [panelists, setPanelists] = useState(
    Array.isArray(initial?.panelists) ? initial.panelists : []
  );

  const addPanelist = (name) => {
    if (!name) return;
    if (!panelists.includes(name)) setPanelists((p) => [...p, name]);
    setPanelistPick("");
  };
  const removePanelist = (name) =>
    setPanelists((p) => p.filter((n) => n !== name));

  const timeIsValid = time && timeEnd && time < timeEnd;

  const handleSubmit = async () => {
    try {
      const selected = teamOptions.find((t) => t.name === team);
      const teamId = selected?.id || null;

      const payload = {
        teamId,
        teamName: team,
        date,
        timeStart: time,
        timeEnd,
        panelists: Array.isArray(panelists) ? panelists : [],
      };

      await updateDoc(doc(db, "finalDefenseSchedules", initial.id), payload);

      if (typeof onSaved === "function") onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to update schedule:", err);
      alert("Operation failed. See console for details.");
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* panel */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] max-w-[92vw]">
        <div className="rounded-2xl bg-white border border-neutral-200 shadow-2xl focus:outline-none p-0">
          {/* header */}
          <div className="px-6 pt-5 pb-3">
            <div
              className="flex items-center gap-2 text-[16px] font-semibold"
              style={{ color: MAROON }}
            >
              <PlusCircle size={18} />
              Edit Schedule
            </div>
            <div className="mt-3 h-[2px] w-full bg-neutral-200">
              <div
                className="h-[2px]"
                style={{ backgroundColor: MAROON, width: 130 }}
              />
            </div>
          </div>

          {/* body */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              {/* Assign Team */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Assign Team
                </label>
                <div className="relative">
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
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
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none"
                  />
                </div>
              </div>

              {/* Assign Panelists */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Assign Panelists
                </label>
                <div className="relative">
                  <select
                    value={panelistPick}
                    onChange={(e) => addPanelist(e.target.value)}
                    className="w-full appearance-none pr-8 pl-3 py-2 rounded-md border border-neutral-300 text-sm bg-white"
                    disabled={loadingAdvisers}
                  >
                    <option value="">Select</option>
                    {loadingAdvisers && <option>Loading…</option>}
                    {!loadingAdvisers &&
                      adviserOptions.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 rounded-md border border-neutral-300 text-sm"
                  />
                  <Calendar
                    size={16}
                    className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none"
                  />
                </div>
              </div>

              {/* Panelists chips */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Panelists
                </label>
                <div className="w-full rounded-md border border-neutral-300 bg-white px-2 py-2 flex flex-wrap gap-2 min-h-[40px]">
                  {panelists.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-2 py-1 text-sm bg-white"
                    >
                      <User2 size={16} className="text-neutral-600" />
                      {p}
                      <button
                        className="ml-1 rounded hover:bg-neutral-100 p-0.5"
                        onClick={() => removePanelist(p)}
                        title="Remove"
                      >
                        <X size={14} className="text-neutral-500" />
                      </button>
                    </span>
                  ))}
                  {panelists.length === 0 && (
                    <span className="text-xs text-neutral-400 px-1 py-1">
                      No panelists selected.
                    </span>
                  )}
                </div>
              </div>

              {/* Time range */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Time
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pr-10 pl-3 py-2 rounded-md border border-neutral-300 text-sm"
                    />
                    <Clock
                      size={16}
                      className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none"
                    />
                  </div>
                  <span className="text-neutral-400">—</span>
                  <div className="relative flex-1">
                    <input
                      type="time"
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                      className="w-full pr-10 pl-3 py-2 rounded-md border border-neutral-300 text-sm"
                    />
                    <Clock
                      size={16}
                      className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none"
                    />
                  </div>
                </div>
                {!time || !timeEnd || time < timeEnd ? null : (
                  <p className="mt-1 text-xs text-red-600">
                    End time must be after start time.
                  </p>
                )}
              </div>
            </div>

            {/* footer buttons */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!team || !(time && timeEnd && time < timeEnd)}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white ${
                  !team || !(time && timeEnd && time < timeEnd)
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
                style={{ backgroundColor: MAROON }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------- View Team Dialog ------- */
function ViewTeamDialog({ schedule, onClose }) {
  const [loading, setLoading] = useState(true);
  const [adviser, setAdviser] = useState("-");
  const [manager, setManager] = useState("-");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (schedule?.teamId) {
          const ref = doc(db, "teams", schedule.teamId);
          const snap = await getDoc(ref);
          const data = snap.exists() ? snap.data() : null;
          if (alive && data) {
            setAdviser(data?.adviser?.fullName || "-");
            setManager(data?.manager?.fullName || "-");
            setMembers(
              Array.isArray(data?.memberNames) ? data.memberNames : []
            );
          }
        } else {
          setAdviser("-");
          setManager("-");
          setMembers([]);
        }
      } catch (e) {
        console.error("Failed to load team for view:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [schedule?.teamId]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] max-w-[92vw]">
        <div className="rounded-2xl bg-white border border-neutral-200 shadow-2xl focus:outline-none p-0">
          {/* header */}
          <div className="px-6 pt-5 pb-3">
            <div
              className="flex items-center gap-2 text-[16px] font-semibold"
              style={{ color: MAROON }}
            >
              <PlusCircle size={18} />
              View Team
            </div>
            <div className="mt-3 h-[2px] w-full bg-neutral-200">
              <div
                className="h-[2px]"
                style={{ backgroundColor: MAROON, width: 110 }}
              />
            </div>
          </div>

          {/* body */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              {/* Team Name */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Team
                </label>
                <div className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
                  {schedule?.teamName || "-"}
                </div>
              </div>

              {/* Adviser */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Adviser
                </label>
                <div className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
                  {loading ? "Loading…" : adviser}
                </div>
              </div>

              {/* Project Manager */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Project Manager
                </label>
                <div className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm">
                  {loading ? "Loading…" : manager}
                </div>
              </div>

              {/* Members */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Members
                </label>
                <div className="w-full rounded-md border border-neutral-300 bg-white px-3 py-3 text-sm">
                  {loading ? (
                    "Loading…"
                  ) : members.length === 0 ? (
                    <span className="text-neutral-500">No members listed.</span>
                  ) : (
                    <ul className="list-disc ml-5 space-y-1">
                      {members.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* footer */}
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