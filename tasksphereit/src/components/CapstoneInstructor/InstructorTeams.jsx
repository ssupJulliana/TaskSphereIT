// src/components/CapstoneInstructor/InstructorTeams.jsx
import React, { useEffect, useState } from "react";
import {
  Users,
  ChevronRight,
  PlusCircle,
  MoreVertical,
  X,
  CirclePlus,
  Edit3,
  Trash2,
} from "lucide-react";
import TeamIcon from "../../assets/imgs/InstructorTeamIcon.png";
import AdviserIcon from "../../assets/imgs/InstructoIconAdviser.png";

import { useInstructorTeams } from "./InstructorFunctions/InstructorTeamsFunction";

const MAROON = "#6A0F14";

const InstructorTeams = () => {
  const [view, setView] = useState("teams"); // "teams" | "advisers"
  const [openCreate, setOpenCreate] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  // Edit dialog state
  const [etTeam, setEtTeam] = useState(null);
  const [etManagerId, setEtManagerId] = useState("");
  const [etTeamName, setEtTeamName] = useState("");
  const [etMemberPick, setEtMemberPick] = useState("");
  const [etMemberIds, setEtMemberIds] = useState([]);

  const idOf = (u) => u?.uid || u?.id;
  const [activeMenu, setActiveMenu] = useState(null);
  const [dropUp, setDropUp] = useState(false);

  const [transferUser, setTransferUser] = useState(null);
  const [transferFromTeam, setTransferFromTeam] = useState(null);
  const [transferToTeamId, setTransferToTeamId] = useState("");


  const {
    allUsers,
    members,
    advisers,
    teams,
    availableManagers,
    availableMembers,
   

    // create team
    ctManagerId,
    setCtManagerId,
    ctTeamName,
    setCtTeamName,
    ctMemberPick,
    setCtMemberPick,
    ctMemberIds,
    addMember,
    removeMember,
    saveCreateTeam,

    // assign adviser
    asTeamId,
    setAsTeamId,
    asAdviserUid,
    setAsAdviserUid,
    saveAssign,

    // misc
    menuOpenId,
    setMenuOpenId,
    dissolveTeam,
    editTeam,

      transferTeamMember,
  
  } = useInstructorTeams();

  const uniqByUid = (arr) => {
    const m = new Map();
    for (const u of arr || []) {
      const k = u?.uid || u?.id;
      if (!k) continue;
      if (!m.has(k)) m.set(k, u);
    }
    return Array.from(m.values());
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenCreate(false);
        setOpenAssign(false);
        setMenuOpenId(null);
        setEtTeam(null);
      }
    };
    if (openCreate || openAssign || menuOpenId || etTeam)
      window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCreate, openAssign, menuOpenId, etTeam, setMenuOpenId]);

  const LabelBar = ({ children }) => (
    <div className="mt-auto w-full bg-[#6A0F14] text-white text-xs font-medium px-4 py-2 rounded-b-xl whitespace-normal break-words leading-snug min-h-[40px]">
      {children}
    </div>
  );

const TeamCard = ({ team }) => (
  <div
    className="
      relative flex flex-col bg-white border border-neutral-200 rounded-xl 
      shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer
      h-48 sm:h-52 md:h-56 lg:h-60
    "
    onClick={() => {
      setEtTeam(team);
      setEtManagerId(team.manager?.uid || "");
      setEtTeamName(team.name || "");
      setEtMemberIds(team.memberUids || []);
      setEtMemberPick("");
      setMenuOpenId(null);
    }}
  >
    {/* Menu Button */}
    <button
      className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-100 z-30"
      aria-label="More actions"
      onClick={(e) => {
        e.stopPropagation(); // prevent triggering card click
        setMenuOpenId(menuOpenId === team.id ? null : team.id);
      }}
    >
      <MoreVertical className="w-4 h-4 text-neutral-500" />
    </button>

    {menuOpenId === team.id && (
      <div
        className="absolute right-2 top-9 z-40 w-40 rounded-lg border border-neutral-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          onClick={() => {
            setMenuOpenId(null);
            if (window.confirm(`Dissolve team "${team.name}"?`)) {
              dissolveTeam(team.id);
            }
          }}
        >
          <Trash2 className="w-4 h-4" /> Dissolve
        </button>
      </div>
    )}
<div className="flex flex-1 items-center justify-center">
  <img src={TeamIcon} alt="" className="w-15 h-15 object-contain" />
</div>


    <LabelBar>{team.name}</LabelBar>
  </div>
);


const handleTransferMember = async () => {
  if (!transferUser || !transferFromTeam || !transferToTeamId) return;
  
  try {
    const success = await transferTeamMember(transferUser, transferFromTeam, transferToTeamId);
    
    if (success) {
      setTransferUser(null);
      setTransferFromTeam(null);
      setTransferToTeamId("");
      
      // Refresh the current team data in the edit dialog
      if (etTeam && etTeam.id === transferFromTeam) {
        // Remove the transferred member from the local state immediately
        setEtMemberIds(prev => prev.filter(id => id !== transferUser));
      }
      
      // Optional: Show success message
      console.log("Member transferred successfully!");
    }
  } catch (error) {
    console.error("Failed to transfer member:", error);
    alert("Failed to transfer member. Please try again.");
  }
};



  const AdviserCard = ({ name }) => (
    <div className="relative bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 w-3"
        style={{ background: MAROON }}
      />
      <div className="px-6 py-8 flex flex-col items-center justify-center gap-4">
        <img src={AdviserIcon} alt="" className="w-14 h-14 object-contain" />
        <div className="text-neutral-900 font-semibold text-lg text-center leading-snug">
          {name}
        </div>
      </div>
    </div>
  );

  const teamCards = teams.map((t) => <TeamCard key={t.id} team={t} />);

  const adviserItems = advisers.map((a) => (
    <AdviserCard key={a.uid || a.id} name={a.fullName} />
  ));

  return (
    <div className="min-h-full flex flex-col">
      {/* ===== Header (matches InstructorEnroll) ===== */}
      <div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-5 h-5 text-neutral-800" />
          <h2 className="text-base font-semibold text-neutral-900">
            {view === "teams" ? "Teams" : "Advisers"}
          </h2>
        </div>
        <div className="mt-3 h-[2px] w-full bg-[#6A0F14]" />
      </div>

      {/* ===== Toggle + Actions under the header (left-aligned) ===== */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="cursor-pointer rounded-full border border-neutral-300 p-1 flex">
          <button
            onClick={() => setView("teams")}
            className={`px-3 py-1.5 text-sm rounded-full cursor-pointer  ${
              view === "teams"
                ? "bg-[#6A0F14] text-white"
                : "text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setView("advisers")}
            className={`px-3 py-1.5 text-sm rounded-full cursor-pointer  ${
              view === "advisers"
                ? "bg-[#6A0F14] text-white"
                : "text-neutral-800 hover:bg-neutral-100"
            }`}
          >
            Adviser
          </button>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100"
        >
          <PlusCircle className="w-4 h-4" /> Create Team
        </button>
        <button
          onClick={() => setOpenAssign(true)}
          className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100"
        >
          <PlusCircle className="w-4 h-4" /> Assign Adviser
        </button>
      </div>

      {/* Cards grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {view === "teams" ? (
          <>
            {teamCards}

          </>
        ) : (
          adviserItems
        )}
      </div>

      {/* Create Team Dialog */}
      {openCreate && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenCreate(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative z-10 flex items-center justify-center min-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-2xl">
              <div className="px-5 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-900">
                    <PlusCircle className="w-5 h-5 text-[#6A0F14]" />
                    <h3 className="text-base font-semibold">Create Team</h3>
                  </div>
                  <button
                    className="p-2 rounded-full hover:bg-neutral-100"
                    onClick={() => setOpenCreate(false)}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
                <div className="mt-3 h-[2px] bg-[#6A0F14]" />
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Project Manager
                    </label>
                    <select
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={ctManagerId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setCtManagerId(id);
                        
                        // Auto-set team name to "Lastname, Et Al"
                        if (id) {
                          const selectedManager = availableMembers.find(s => idOf(s) === id);
                          if (selectedManager && selectedManager.lastName) {
                            setCtTeamName(`${selectedManager.lastName}, Et Al`);
                          } else if (selectedManager && selectedManager.fullName) {
                            // Fallback to full name if no lastName
                            const names = selectedManager.fullName.split(' ');
                            const lastName = names[names.length - 1];
                            setCtTeamName(`${lastName}, Et Al`);
                          }
                        } else {
                          // Clear team name if no manager selected
                          setCtTeamName("");
                        }
                        
                        // if the chosen manager is already in the members list, remove them
                        if (ctMemberIds.includes(id)) removeMember(id);
                      }}
                    >
                      <option value="">Select</option>
                      {availableMembers.map((s) => (
                        <option key={idOf(s)} value={idOf(s)}>
                          {s.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Team Name
                    </label>
                    <input
                       type="text"
  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30 bg-gray-100 cursor-not-allowed"value={ctTeamName}
                      onChange={(e) => setCtTeamName(e.target.value)}
                      placeholder="e.g., Bernardo, Et Al"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Add Member
                  </label>
                  <div className="mt-1 flex gap-2">
                    <select
                      className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={ctMemberPick}
                      onChange={(e) => setCtMemberPick(e.target.value)}
                    >
                    <option value="">Select</option>
                  {availableMembers
                    .filter((s) => idOf(s) !== ctManagerId) // exclude the selected Project Manager
                    .filter((s) => !ctMemberIds.includes(idOf(s))) // exclude already picked members
                    .map((s) => (
                      <option key={idOf(s)} value={idOf(s)}>
                        {s.fullName}
                      </option>
                    ))}
                    </select>
                    <button
                      type="button"
                      onClick={addMember}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
                    >
                      <CirclePlus className="w-4 h-4 " /> Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Members List
                  </label>
                  <div className="mt-1 rounded-lg border border-neutral-200">
                    {ctMemberIds.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-neutral-500">
                        No members added.
                      </div>
                    ) : (
                      <ul className="divide-y divide-neutral-200">
                        {ctMemberIds.map((uid) => {
                          const u =
                            members.find((m) => (m.uid || m.id) === uid) ||
                            allUsers.find((m) => (m.uid || m.id) === uid) ||
                            null;
                          return (
                            <li
                              key={uid}
                              className="flex items-center justify-between px-3 py-2"
                            >
                              <span className="text-sm">
                                {u?.fullName || uid}
                              </span>
                              <button
                                onClick={() => removeMember(uid)}
                                className="p-1 rounded hover:bg-neutral-100"
                                aria-label={`Remove ${u?.fullName || ""}`}
                              >
                                <X className="w-4 h-4 text-neutral-500" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex justify-end gap-2">
                <button
                  onClick={() => setOpenCreate(false)}
                  className="px-4 py-2 rounded-full border border-neutral-300 text-sm hover:bg-neutral-100 "
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const ok = await saveCreateTeam();
                    if (ok) setOpenCreate(false);
                  }}
                  className="px-5 py-2 rounded-full bg-[#6A0F14] text-white text-sm hover:bg-[#5c0d12]"
                  disabled={!ctManagerId}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Adviser Dialog */}
      {openAssign && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenAssign(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative z-10 flex items-center justify-center min-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-xl bg-white rounded-2xl border border-neutral-200 shadow-2xl">
              <div className="px-5 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-900">
                    <PlusCircle className="w-5 h-5 text-[#6A0F14]" />
                    <h3 className="text-base font-semibold">Assign Adviser</h3>
                  </div>
                  <button
                    className="p-2 rounded-full hover:bg-neutral-100"
                    onClick={() => setOpenAssign(false)}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
                <div className="mt-3 h-[2px] bg-[#6A0F14]" />
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Team/s
                    </label>
                    <select
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={asTeamId}
                      onChange={(e) => setAsTeamId(e.target.value)}
                    >
                      <option value="">Select</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                          {t.adviser?.uid ? " (has adviser)" : ""}
                        </option>
                      ))}
                    </select>
                    {asTeamId &&
                      teams.find((t) => t.id === asTeamId)?.adviser?.uid && (
                        <p className="mt-1 text-xs text-red-600">
                          This team already has an adviser.
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Adviser
                    </label>
                    <select
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={asAdviserUid}
                      onChange={(e) => setAsAdviserUid(e.target.value)}
                      disabled={
                        !!(
                          asTeamId &&
                          teams.find((t) => t.id === asTeamId)?.adviser?.uid
                        )
                      }
                    >
                      <option value="">Select</option>
                      {advisers.map((a) => (
                        <option key={a.uid || a.id} value={a.uid || a.id}>
                          {a.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex justify-end gap-2">
                <button
                  onClick={() => setOpenAssign(false)}
                  className="px-4 py-2 rounded-full border border-neutral-300 text-sm hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const ok = await saveAssign();
                    if (ok) setOpenAssign(false);
                  }}
                  className="px-5 py-2 rounded-full bg-[#6A0F14] text-white text-sm hover:bg-[#5c0d12]"
                  disabled={
                    !asTeamId ||
                    !asAdviserUid ||
                    !!(
                      asTeamId &&
                      teams.find((t) => t.id === asTeamId)?.adviser?.uid
                    )
                  }
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Dialog */}
          {etTeam && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4"
              role="dialog"
              aria-modal="true"
              onClick={() => setEtTeam(null)}
            >
              <div
                className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-neutral-900 truncate">
                    Edit Team: <span className="text-[#6A0F14]">{etTeamName}</span>
                  </h2>
                  <button
                    onClick={() => setEtTeam(null)}
                    className="p-2 hover:bg-neutral-100 rounded-full flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  {/* Members Title + Add Button */}
                  <div className="px-4 sm:px-6 mt-4 sm:mt-6">
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <select
                          className="border rounded-lg px-3 py-2 text-sm w-full sm:w-48"
                          value={etMemberPick}
                          onChange={(e) => setEtMemberPick(e.target.value)}
                        >
                          <option value="">Add member...</option>
                          {availableMembers.map((m) => (
                            <option key={m.uid || m.id} value={m.uid || m.id}>
                              {m.fullName}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            if (!etMemberPick) return;
                            if (!etMemberIds.includes(etMemberPick)) {
                              setEtMemberIds((v) => [...v, etMemberPick]);
                            }
                            setEtMemberPick("");
                          }}
                          className="bg-[#6A0F14] text-white px-4 py-2 rounded-md text-sm hover:bg-[#5c0d12] whitespace-nowrap"
                        >
                          Add Member
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Members Table */}
                  <div className="px-4 sm:px-6 mt-3 pb-4">
                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-3">
                      {etMemberIds.length === 0 && (
                        <div className="text-center py-4 text-neutral-500 border rounded-lg">
                          No members yet.
                        </div>
                      )}

                      {(
                        etManagerId && !etMemberIds.includes(etManagerId)
                          ? [etManagerId, ...etMemberIds]
                          : etMemberIds
                      ).map((uid, index) => {
                        const u = allUsers.find((m) => (m.uid || m.id) === uid);
                        const isPM = uid === etManagerId;

                        return (
                          <div key={uid} className="border rounded-lg p-3 bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-neutral-100 text-neutral-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </span>
                                <span className="font-medium text-sm">
                                  {u?.lastName}, {u?.firstName}
                                </span>
                              </div>
                              <div className="relative">
                                <button
                                  onClick={() => setActiveMenu(activeMenu === uid ? null : uid)}
                                  className="p-1"
                                >
                                  <MoreVertical className="w-4 h-4 text-neutral-600 hover:text-black cursor-pointer" />
                                </button>

                                {activeMenu === uid && (
                                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border rounded-md shadow-lg text-left z-50">
                                    <button
                                      className={`w-full text-left px-3 py-2 text-xs ${
                                        isPM 
                                          ? "text-neutral-400 cursor-not-allowed opacity-50"
                                          : "hover:bg-neutral-100 cursor-pointer"
                                      }`}
                                      disabled={isPM}
                                      onClick={() => {
                                        if (isPM) return;
                                        setTransferUser(uid);
                                        setTransferFromTeam(etTeam.id);
                                        setActiveMenu(null);
                                      }}
                                    >
                                      Transfer Member
                                    </button>

                                    <button
                                      disabled={isPM}
                                      className={`w-full text-left px-3 py-2 text-xs ${
                                        isPM 
                                          ? "text-neutral-400 cursor-default" 
                                          : "text-red-600 hover:bg-neutral-100"
                                      }`}
                                      onClick={() => {
                                        setEtMemberIds((prev) => prev.filter((x) => x !== uid));
                                        setActiveMenu(null);
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 mb-3">
                              <div>
                                <span className="font-medium">ID:</span> {u?.idNumber}
                              </div>
                              <div>
                                <span className="font-medium">Middle:</span> {u?.middleName || '-'}
                              </div>
                            </div>

                            <select
                              className="border rounded-md px-2 py-1 text-xs w-full"
                              value={isPM ? "Project Manager" : "Member"}
                              onChange={(e) => {
                                const newRole = e.target.value;
                                if (newRole === "Project Manager") {
                                  setEtManagerId(uid);
                                  const pmUser = allUsers.find(m => (m.uid || m.id) === uid);
                                  if (pmUser) {
                                    setEtTeamName(`${pmUser.lastName}, Et Al`);
                                  }
                                } else {
                                  if (isPM) setEtManagerId("");
                                }
                              }}
                            >
                              <option value="Member">Member</option>
                              <option value="Project Manager">Project Manager</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-sm border rounded-lg overflow-hidden">
                        <thead className="text-left bg-neutral-50">
                          <tr className="border-b">
                            <th className="px-4 py-2 w-12">No</th>
                            <th className="px-4 py-2">ID No</th>
                            <th className="px-4 py-2">Last Name</th>
                            <th className="px-4 py-2">First Name</th>
                            <th className="px-4 py-2">Middle Name</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2 w-16 text-center">Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {etMemberIds.length === 0 && (
                            <tr>
                              <td colSpan="7" className="px-4 py-3 text-center text-neutral-500">
                                No members yet.
                              </td>
                            </tr>
                          )}

                          {(
                            etManagerId && !etMemberIds.includes(etManagerId)
                              ? [etManagerId, ...etMemberIds]
                              : etMemberIds
                          ).map((uid, index) => {
                            const u = allUsers.find((m) => (m.uid || m.id) === uid);
                            const isPM = uid === etManagerId;

                            return (
                              <tr key={uid} className="border-b hover:bg-neutral-50">
                                <td className="px-4 py-3 text-center">{index + 1}</td>
                                <td className="px-4 py-3">{u?.idNumber}</td>
                                <td className="px-4 py-3">{u?.lastName}</td>
                                <td className="px-4 py-3">{u?.firstName}</td>
                                <td className="px-4 py-3">{u?.middleName}</td>

                                <td className="px-4 py-2">
                                  <select
                                    className="border rounded-md px-2 py-1 text-xs w-full max-w-32"
                                    value={isPM ? "Project Manager" : "Member"}
                                    onChange={(e) => {
                                      const newRole = e.target.value;
                                      if (newRole === "Project Manager") {
                                        setEtManagerId(uid);
                                        const pmUser = allUsers.find(m => (m.uid || m.id) === uid);
                                        if (pmUser) {
                                          setEtTeamName(`${pmUser.lastName}, Et Al`);
                                        }
                                      } else {
                                        if (isPM) setEtManagerId("");
                                      }
                                    }}
                                  >
                                    <option value="Member">Member</option>
                                    <option value="Project Manager">Project Manager</option>
                                  </select>
                                </td>

                                <td className="px-4 py-2 text-center relative">
                                  <button
                                    onClick={() => setActiveMenu(activeMenu === uid ? null : uid)}
                                    className="p-1 hover:bg-neutral-100 rounded"
                                  >
                                    <MoreVertical className="w-5 h-5 text-neutral-600 hover:text-black cursor-pointer" />
                                  </button>

                                  {activeMenu === uid && (
                                    <div className={`absolute right-0 min-w-44 bg-white border rounded-md shadow-lg text-left z-50 ${
                                      // Check if it's in the last few rows and position above
                                      index >= etMemberIds.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'
                                    }`}>
                                      <button
                                        className={`w-full text-left px-4 py-2 text-sm ${
                                          isPM 
                                            ? "text-neutral-400 cursor-not-allowed opacity-50"
                                            : "hover:bg-neutral-100 cursor-pointer"
                                        }`}
                                        disabled={isPM}
                                        onClick={() => {
                                          if (isPM) return;
                                          setTransferUser(uid);
                                          setTransferFromTeam(etTeam.id);
                                          setActiveMenu(null);
                                        }}
                                      >
                                        Transfer Member
                                      </button>

                                      <button
                                        disabled={isPM}
                                        className={`w-full text-left px-4 py-2 text-sm ${
                                          isPM 
                                            ? "text-neutral-400 cursor-default" 
                                            : "text-red-600 hover:bg-neutral-100"
                                        }`}
                                        onClick={() => {
                                          setEtMemberIds((prev) => prev.filter((x) => x !== uid));
                                          setActiveMenu(null);
                                        }}
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {/* Footer */}
                  <div className="px-4 sm:px-6 py-4 flex justify-end gap-2 border-t bg-neutral-50">
                    <button
                      onClick={() => setEtTeam(null)}
                      className="px-4 py-2 border rounded-full text-sm hover:bg-neutral-100">
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        const ok = await editTeam(etTeam.id, {
                          managerUid: etManagerId,
                          teamName: etTeamName,
                          memberUids: etMemberIds,
                        });
                        if (ok) setEtTeam(null);
                      }}
                      disabled={!String(etTeamName).trim() || !etManagerId}
                      className="bg-[#6A0F14] text-white px-6 py-2 rounded-full text-sm hover:bg-[#5c0d12] disabled:bg-neutral-400 disabled:cursor-not-allowed"
                    >
                      Save Changes
                    </button>
                  </div>

              </div>
            </div>
          )}
           {/* Add the Transfer Member Modal RIGHT HERE - after Edit Team Dialog and before the final closing div */}
      {transferUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setTransferUser(null);
            setTransferFromTeam(null);
            setTransferToTeamId("");
          }}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 pt-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-neutral-900">Transfer Member</h3>
                <button
                  className="p-2 rounded-full hover:bg-neutral-100"
                  onClick={() => {
                    setTransferUser(null);
                    setTransferFromTeam(null);
                    setTransferToTeamId("");
                  }}
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>
              <div className="mt-3 h-[2px] bg-[#6A0F14]" />
            </div>

            {/* Content */}
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select a new team
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={transferToTeamId}
                  onChange={(e) => setTransferToTeamId(e.target.value)}
                >
                  <option value="">Select team</option>
                  {teams
                    .filter(team => team.id !== transferFromTeam) // Exclude current team
                    .map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))
                  }
                </select>
              </div>
              

            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setTransferUser(null);
                  setTransferFromTeam(null);
                  setTransferToTeamId("");
                }}
                className="px-4 py-2 rounded-full border border-neutral-300 text-sm hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferMember}
                disabled={!transferToTeamId}
                className="px-5 py-2 rounded-full bg-[#6A0F14] text-white text-sm hover:bg-[#5c0d12] disabled:bg-neutral-400 disabled:cursor-not-allowed"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorTeams;
