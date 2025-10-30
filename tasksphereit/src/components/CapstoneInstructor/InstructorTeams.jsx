import React, { useEffect, useState } from "react";
import {
  Users,
  ChevronRight,
  PlusCircle,
  MoreVertical,
  X,
  CirclePlus,
  Edit3,        // NEW
  Trash2,       // NEW
} from "lucide-react";
import TeamIcon from "../../assets/imgs/InstructorTeamIcon.png";
import AdviserIcon from "../../assets/imgs/InstructoIconAdviser.png";

import { useInstructorTeams } from "./InstructorFunctions/InstructorTeamsFunction";

const MAROON = "#6A0F14";

const InstructorTeams = () => {
  /* ---------- UI-only state ---------- */
  const [view, setView] = useState("teams"); // "teams" | "advisers"
  const [openCreate, setOpenCreate] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  // NEW: Edit dialog state
  const [etTeam, setEtTeam] = useState(null);     // team object being edited
  const [etManagerId, setEtManagerId] = useState("");
  const [etTeamName, setEtTeamName] = useState("");
  const [etMemberPick, setEtMemberPick] = useState("");
  const [etMemberIds, setEtMemberIds] = useState([]);

  /* ---------- data + actions from hook ---------- */
  const {
    allUsers,
    members,
    advisers,
    teams,
    availableManagers,
    availableMembers,
    unassignedPeople,

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
    editTeam,           // NEW
  } = useInstructorTeams();

  // helpers
  const uniqByUid = (arr) => {
    const m = new Map();
    for (const u of arr || []) {
      const k = u?.uid || u?.id;
      if (!k) continue;
      if (!m.has(k)) m.set(k, u);
    }
    return Array.from(m.values());
  };

  // ESC closes modals / menus
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenCreate(false);
        setOpenAssign(false);
        setMenuOpenId(null);
        setEtTeam(null);
      }
    };
    if (openCreate || openAssign || menuOpenId || etTeam) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCreate, openAssign, menuOpenId, etTeam, setMenuOpenId]);

  /* ---------- UI subcomponents ---------- */
  const LabelBar = ({ children }) => (
    <div className="mt-auto w-full bg-[#6A0F14] text-white text-xs font-medium px-4 py-2 rounded-b-xl whitespace-normal break-words leading-snug min-h-[40px]">
      {children}
    </div>
  );

  const TeamCard = ({ team }) => (
    <div className="relative flex flex-col bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <button
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-100"
        aria-label="More actions"
        onClick={() => setMenuOpenId(menuOpenId === team.id ? null : team.id)}
      >
        <MoreVertical className="w-4 h-4 text-neutral-500" />
      </button>

      {/* NEW: actions dropdown */}
      {menuOpenId === team.id && (
        <div className="absolute right-2 top-9 z-20 w-40 rounded-lg border border-neutral-200 bg-white shadow-lg">
          <button
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-neutral-100"
            onClick={() => {
              // prefill edit dialog
              setEtTeam(team);
              setEtManagerId(team.manager?.uid || "");
              setEtTeamName(team.name || "");
              setEtMemberIds(team.memberUids || []);
              setEtMemberPick("");
              setMenuOpenId(null);
            }}
          >
            <Edit3 className="w-4 h-4" /> Edit
          </button>
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

      <div className="px-6 pt-8 pb-10 flex items-center justify-center">
        <img src={TeamIcon} alt="" className="w-12 h-12 object-contain" />
      </div>
      <LabelBar>{team.name}</LabelBar>
    </div>
  );

  const PersonCard = ({ name }) => (
    <div className="relative flex flex-col bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="px-6 pt-8 pb-10 flex items-center justify-center">
        <Users className="w-10 h-10 text-neutral-800" />
      </div>
      <LabelBar>{name}</LabelBar>
    </div>
  );

  const AdviserCard = ({ name }) => (
    <div className="relative bg-white border border-neutral-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-3" style={{ background: MAROON }} />
      <div className="px-6 py-8 flex flex-col items-center justify-center gap-4">
        <img src={AdviserIcon} alt="" className="w-14 h-14 object-contain" />
        <div className="text-neutral-900 font-semibold text-lg text-center leading-snug">
          {name}
        </div>
      </div>
    </div>
  );

  const teamCards = teams.map((t) => <TeamCard key={t.id} team={t} />);
  const peopleCards = unassignedPeople.map((p) => (
    <PersonCard key={p.uid || p.id} name={p.fullName} />
  ));
  const adviserItems = advisers.map((a) => (
    <AdviserCard key={a.uid || a.id} name={a.fullName} />
  ));

  /* ---------- component ---------- */
  return (
    <div className="min-h-full flex flex-col">
      {/* Top: breadcrumb + actions */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center text-sm text-neutral-700 gap-2">
          <span className="inline-flex items-center gap-2 font-semibold text-neutral-800">
            <Users className="w-4 h-4" /> Teams
          </span>
          <ChevronRight className="w-3 h-3 text-neutral-500" />
          <span className="text-neutral-700">‎</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-neutral-300 p-1 flex">
            <button
              onClick={() => setView("teams")}
              className={`px-3 py-1.5 text-sm rounded-full ${
                view === "teams" ? "bg-[#6A0F14] text-white" : "text-neutral-800 hover:bg-neutral-100"
              }`}
            >
              Teams
            </button>
            <button
              onClick={() => setView("advisers")}
              className={`px-3 py-1.5 text-sm rounded-full ${
                view === "advisers" ? "bg-[#6A0F14] text-white" : "text-neutral-800 hover:bg-neutral-100"
              }`}
            >
              Adviser
            </button>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100"
          >
            <PlusCircle className="w-4 h-4" /> Create Team
          </button>
          <button
            onClick={() => setOpenAssign(true)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100"
          >
            <PlusCircle className="w-4 h-4" /> Assign Adviser
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {view === "teams" ? (
          <>
            {teamCards}
            {peopleCards}
          </>
        ) : (
          adviserItems
        )}
      </div>

      {/* Create Team Dialog */}
      {openCreate && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onClick={() => setOpenCreate(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex items-center justify-center min-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-2xl">
              <div className="px-5 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-900">
                    <PlusCircle className="w-5 h-5 text-[#6A0F14]" />
                    <h3 className="text-base font-semibold">Create Team</h3>
                  </div>
                  <button className="p-2 rounded-full hover:bg-neutral-100" onClick={() => setOpenCreate(false)} aria-label="Close">
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
                <div className="mt-3 h-[2px] bg-[#6A0F14]" />
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Project Manager</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={ctManagerId}
                      onChange={(e) => setCtManagerId(e.target.value)}
                    >
                      <option value="">Select</option>
                      {availableManagers.map((m) => (
                        <option key={m.uid || m.id} value={m.uid || m.id}>
                          {m.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Team Name</label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={ctTeamName}
                      onChange={(e) => setCtTeamName(e.target.value)}
                      placeholder="e.g., Bernardo, Et Al"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">Add Member</label>
                  <div className="mt-1 flex gap-2">
                    <select
                      className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={ctMemberPick}
                      onChange={(e) => setCtMemberPick(e.target.value)}
                    >
                      <option value="">Select</option>
                      {availableMembers.map((s) => (
                        <option key={s.uid || s.id} value={s.uid || s.id}>
                          {s.fullName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addMember}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
                    >
                      <CirclePlus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">Members List</label>
                  <div className="mt-1 rounded-lg border border-neutral-200">
                    {ctMemberIds.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-neutral-500">No members added.</div>
                    ) : (
                      <ul className="divide-y divide-neutral-200">
                        {ctMemberIds.map((uid) => {
                          const u =
                            members.find((m) => (m.uid || m.id) === uid) ||
                            allUsers.find((m) => (m.uid || m.id) === uid) ||
                            null;
                          return (
                            <li key={uid} className="flex items-center justify-between px-3 py-2">
                              <span className="text-sm">{u?.fullName || uid}</span>
                              <button onClick={() => removeMember(uid)} className="p-1 rounded hover:bg-neutral-100" aria-label={`Remove ${u?.fullName || ""}`}>
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
                <button onClick={() => setOpenCreate(false)} className="px-4 py-2 rounded-full border border-neutral-300 text-sm hover:bg-neutral-100">
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
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onClick={() => setOpenAssign(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex items-center justify-center min-h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-xl bg-white rounded-2xl border border-neutral-200 shadow-2xl">
              <div className="px-5 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-900">
                    <PlusCircle className="w-5 h-5 text-[#6A0F14]" />
                    <h3 className="text-base font-semibold">Assign Adviser</h3>
                  </div>
                  <button className="p-2 rounded-full hover:bg-neutral-100" onClick={() => setOpenAssign(false)} aria-label="Close">
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
                <div className="mt-3 h-[2px] bg-[#6A0F14]" />
              </div>

              <div className="px-5 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Team/s</label>
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
                    {asTeamId && teams.find((t) => t.id === asTeamId)?.adviser?.uid && (
                      <p className="mt-1 text-xs text-red-600">This team already has an adviser.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Adviser</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={asAdviserUid}
                      onChange={(e) => setAsAdviserUid(e.target.value)}
                      disabled={!!(asTeamId && teams.find((t) => t.id === asTeamId)?.adviser?.uid)}
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
                <button onClick={() => setOpenAssign(false)} className="px-4 py-2 rounded-full border border-neutral-300 text-sm hover:bg-neutral-100">
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
                    !!(asTeamId && teams.find((t) => t.id === asTeamId)?.adviser?.uid)
                  }
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Edit Team Dialog (prefilled, same layout style as Create) */}
      {etTeam && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setEtTeam(null)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative z-10 flex items-center justify-center min-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-2xl">
              {/* header */}
              <div className="px-5 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-900">
                    <PlusCircle className="w-5 h-5 text-[#6A0F14]" />
                    <h3 className="text-base font-semibold">Edit Team</h3>
                  </div>
                  <button
                    className="p-2 rounded-full hover:bg-neutral-100"
                    onClick={() => setEtTeam(null)}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
                <div className="mt-3 h-[2px] bg-[#6A0F14]" />
              </div>

              {/* body */}
              <div className="px-5 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Project Manager
                    </label>
                    {(() => {
                      // include current PM even if "assigned"
                      const currentPM =
                        allUsers.find((u) => (u.uid || u.id) === etManagerId) ||
                        null;
                      const managersForEdit = uniqByUid([
                        ...(currentPM ? [currentPM] : []),
                        ...availableManagers,
                      ]);
                      return (
                        <select
                          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                          value={etManagerId}
                          onChange={(e) => setEtManagerId(e.target.value)}
                        >
                          <option value="">Select</option>
                          {managersForEdit.map((m) => (
                            <option key={m.uid || m.id} value={m.uid || m.id}>
                              {m.fullName}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Team Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={etTeamName}
                      onChange={(e) => setEtTeamName(e.target.value)}
                      placeholder="Team name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Add Member
                  </label>
                  {(() => {
                    // include current members so they stay selectable
                    const currentMembers = etMemberIds
                      .map((uid) => allUsers.find((u) => (u.uid || u.id) === uid))
                      .filter(Boolean);
                    const membersForEdit = uniqByUid([
                      ...currentMembers,
                      ...availableMembers,
                    ]);
                    return (
                      <div className="mt-1 flex gap-2">
                        <select
                          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                          value={etMemberPick}
                          onChange={(e) => setEtMemberPick(e.target.value)}
                        >
                          <option value="">Select</option>
                          {membersForEdit.map((s) => (
                            <option key={s.uid || s.id} value={s.uid || s.id}>
                              {s.fullName}
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
                          className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
                        >
                          <CirclePlus className="w-4 h-4" /> Add
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Members List
                  </label>
                  <div className="mt-1 rounded-lg border border-neutral-200">
                    {etMemberIds.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-neutral-500">
                        No members added.
                      </div>
                    ) : (
                      <ul className="divide-y divide-neutral-200">
                        {etMemberIds.map((uid) => {
                          const u =
                            allUsers.find((m) => (m.uid || m.id) === uid) ||
                            members.find((m) => (m.uid || m.id) === uid) ||
                            null;
                          return (
                            <li key={uid} className="flex items-center justify-between px-3 py-2">
                              <span className="text-sm">{u?.fullName || uid}</span>
                              <button
                                onClick={() =>
                                  setEtMemberIds((v) => v.filter((x) => x !== uid))
                                }
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

              {/* footer */}
              <div className="px-5 pb-5 flex justify-end gap-2">
                <button
                  onClick={() => setEtTeam(null)}
                  className="px-4 py-2 rounded-full border border-neutral-300 text-sm hover:bg-neutral-100"
                >
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
                  className="px-5 py-2 rounded-full bg-[#6A0F14] text-white text-sm hover:bg-[#5c0d12]"
                  disabled={!etManagerId || !etTeamName.trim()}
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

export default InstructorTeams;
