// src/components/CapstoneInstructor/InstructorTeams.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  ChevronRight,
  PlusCircle,
  MoreVertical,
  X,
  CirclePlus,
} from "lucide-react";

const InstructorTeams = () => {
  // --- sample data (swap with API later) --------------------
  const initialTeams = useMemo(
    () => [
      { id: 1, name: "Aguas, Et Al" },
      { id: 2, name: "Bernardo, Et Al" },
      { id: 3, name: "Haraki, Et Al" },
      { id: 4, name: "Hawke, Et Al" },
      { id: 5, name: "Mendoza, Et Al" },
      { id: 6, name: "Quinlan, Et Al" },
      { id: 7, name: "Trinidad, Et Al" },
    ],
    []
  );

  const students = [
    "Castaneda Julliana N",
    "Pinpin John Reagan S",
    "Faustino Alejandro C",
    "Pare Justine",
    "Aguas Xavielle",
    "Bernardo Clyden",
  ];

  const managers = [
    "Mendoza Addrialene G",
    "Haraki Ken",
    "Quinlan Ruth",
    "Trinidad Carlo",
  ];

  const advisers = ["Grayson B Tolentino", "Ava R Cruz", "Noah P Hernandez"];

  // --- page state -------------------------------------------
  const [teams, setTeams] = useState(initialTeams);

  // dialogs
  const [openCreate, setOpenCreate] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpenCreate(false);
        setOpenAssign(false);
      }
    };
    if (openCreate || openAssign) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCreate, openAssign]);

  // --- Create Team dialog state -----------------------------
  const [ctManager, setCtManager] = useState(managers[0]);
  const [ctTeamName, setCtTeamName] = useState("Mendoza, Et Al");
  const [ctMemberPick, setCtMemberPick] = useState("");
  const [ctMembers, setCtMembers] = useState([
    "Castaneda Julliana N",
    "Faustino Alejandro C",
    "Pinpin John Reagan S",
    "Pare Justine",
  ]);

  const addMember = () => {
    if (ctMemberPick && !ctMembers.includes(ctMemberPick)) {
      setCtMembers((m) => [...m, ctMemberPick]);
      setCtMemberPick("");
    }
  };
  const removeMember = (name) =>
    setCtMembers((m) => m.filter((s) => s !== name));

  const saveCreateTeam = () => {
    // minimal mock: push to local list
    setTeams((t) => [
      ...t,
      { id: Math.max(...t.map((x) => x.id)) + 1, name: ctTeamName },
    ]);
    setOpenCreate(false);
  };

  // --- Assign Adviser dialog state --------------------------
  const [asPickTeam, setAsPickTeam] = useState("");
  const [asTeamsList, setAsTeamsList] = useState(["Aguas, Et Al", "Bernardo, Et Al", "Mendoza, Et Al"]);
  const [asAdviser, setAsAdviser] = useState(advisers[0]);

  const addAssignTeam = () => {
    if (asPickTeam && !asTeamsList.includes(asPickTeam)) {
      setAsTeamsList((l) => [...l, asPickTeam]);
      setAsPickTeam("");
    }
  };
  const removeAssignTeam = (n) =>
    setAsTeamsList((l) => l.filter((x) => x !== n));

  const saveAssign = () => {
    // mock only
    setOpenAssign(false);
  };

  // card UI
  const TeamCard = ({ name }) => (
    <div className="relative bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <button
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-100"
        aria-label="More actions"
      >
        <MoreVertical className="w-4 h-4 text-neutral-500" />
      </button>
      <div className="px-6 pt-8 pb-10 flex items-center justify-center">
        <Users className="w-10 h-10 text-neutral-800" />
      </div>
      <div className="bg-[#6A0F14] text-white text-xs font-medium px-4 py-2 rounded-b-xl">
        {name}
      </div>
    </div>
  );

  return (
    <div className="min-h-full flex flex-col">
      {/* Top: breadcrumb + actions */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center text-sm text-neutral-700 gap-2">
          <span className="inline-flex items-center gap-2 font-semibold text-neutral-800">
            <Users className="w-4 h-4" />
            Teams
          </span>
          <ChevronRight className="w-3 h-3 text-neutral-500" />
          <span className="text-neutral-700">‎</span>
        </nav>
        <div className="flex gap-2">
          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100"
          >
            <PlusCircle className="w-4 h-4" />
            Create Team
          </button>
          <button
            onClick={() => setOpenAssign(true)}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100"
          >
            <PlusCircle className="w-4 h-4" />
            Assign Adviser
          </button>
        </div>
      </div>


      {/* Cards grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {teams.map((t) => (
          <TeamCard key={t.id} name={t.name} />
        ))}
      </div>

      {/* --------------- Create Team Dialog ------------------ */}
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
              {/* header */}
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

              {/* body */}
              <div className="px-5 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Project Manager
                    </label>
                    <select
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={ctManager}
                      onChange={(e) => setCtManager(e.target.value)}
                    >
                      {managers.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Team Name
                    </label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={ctTeamName}
                      onChange={(e) => setCtTeamName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Members
                  </label>
                  <div className="mt-1 flex gap-2">
                    <select
                      className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={ctMemberPick}
                      onChange={(e) => setCtMemberPick(e.target.value)}
                    >
                      <option value="">Select</option>
                      {students.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addMember}
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
                    >
                      <CirclePlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Members List
                  </label>
                  <div className="mt-1 rounded-lg border border-neutral-200">
                    {ctMembers.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-neutral-500">
                        No members added.
                      </div>
                    ) : (
                      <ul className="divide-y divide-neutral-200">
                        {ctMembers.map((m) => (
                          <li
                            key={m}
                            className="flex items-center justify-between px-3 py-2"
                          >
                            <span className="text-sm">{m}</span>
                            <button
                              onClick={() => removeMember(m)}
                              className="p-1 rounded hover:bg-neutral-100"
                              aria-label={`Remove ${m}`}
                            >
                              <X className="w-4 h-4 text-neutral-500" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="px-5 pb-5 flex justify-end gap-2">
                <button
                  onClick={() => setOpenCreate(false)}
                  className="px-4 py-2 rounded-full border border-neutral-300 text-sm hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCreateTeam}
                  className="px-5 py-2 rounded-full bg-[#6A0F14] text-white text-sm hover:bg-[#5c0d12]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------- Assign Adviser Dialog --------------- */}
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
              {/* header */}
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

              {/* body */}
              <div className="px-5 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Team/s
                    </label>
                    <div className="mt-1 flex gap-2">
                      <select
                        className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                        value={asPickTeam}
                        onChange={(e) => setAsPickTeam(e.target.value)}
                      >
                        <option value="">Select</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addAssignTeam}
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
                      >
                        <CirclePlus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">
                      Adviser
                    </label>
                    <select
                      className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                      value={asAdviser}
                      onChange={(e) => setAsAdviser(e.target.value)}
                    >
                      {advisers.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700">
                    Teams List
                  </label>
                  <div className="mt-1 rounded-lg border border-neutral-200">
                    {asTeamsList.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-neutral-500">
                        No teams selected.
                      </div>
                    ) : (
                      <ul className="divide-y divide-neutral-200">
                        {asTeamsList.map((n) => (
                          <li
                            key={n}
                            className="flex items-center justify-between px-3 py-2"
                          >
                            <span className="text-sm">{n}</span>
                            <button
                              onClick={() => removeAssignTeam(n)}
                              className="p-1 rounded hover:bg-neutral-100"
                              aria-label={`Remove ${n}`}
                            >
                              <X className="w-4 h-4 text-neutral-500" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="px-5 pb-5 flex justify-end gap-2">
                <button
                  onClick={() => setOpenAssign(false)}
                  className="px-4 py-2 rounded-full border border-neutral-300 text-sm hover:bg-neutral-100"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAssign}
                  className="px-5 py-2 rounded-full bg-[#6A0F14] text-white text-sm hover:bg-[#5c0d12]"
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
