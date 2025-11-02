import { useEffect, useMemo, useState } from "react";
import { db } from "../../../config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  getDocs,
  query,
  where,
  writeBatch, // <-- NEW
} from "firebase/firestore";

/* ---------- helpers (exported in case you want them elsewhere) ---------- */
export const fullNameOf = (u = {}) => {
  const m = u.middleName ? ` ${u.middleName}` : "";
  return `${u.firstName || ""}${m} ${u.lastName || ""}`
    .replace(/\s+/g, " ")
    .trim();
};
export const roleKey = (r = "") => r.toLowerCase();
export const isPM = (r) =>
  ["project manager", "project_manager", "pm", "manager"].includes(roleKey(r));
export const isMember = (r) => ["member", "student"].includes(roleKey(r));
export const isAdviser = (r) => ["adviser", "advisor"].includes(roleKey(r));

/* ---------- main hook ---------- */
export function useInstructorTeams() {
  // users directory
  const [allUsers, setAllUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [advisers, setAdvisers] = useState([]);

  // teams (live)
  const [teams, setTeams] = useState([]);

  // Create Team dialog
  const [ctManagerId, setCtManagerId] = useState("");
  const [ctTeamName, setCtTeamName] = useState("");
  const [ctMemberPick, setCtMemberPick] = useState("");
  const [ctMemberIds, setCtMemberIds] = useState([]); // array of user uid

  // Assign Adviser dialog
  const [asTeamId, setAsTeamId] = useState("");
  const [asAdviserUid, setAsAdviserUid] = useState("");

  // team card menu (3-dots)
  const [menuOpenId, setMenuOpenId] = useState(null);

  /* === live subscriptions === */
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, fullName: fullNameOf(data) };
      });
      setAllUsers(rows);
      setManagers(rows.filter((u) => isPM(u.role)));
      setMembers(rows.filter((u) => isMember(u.role)));
      setAdvisers(rows.filter((u) => isAdviser(u.role)));
    });

    const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTeams(rows);
    });

    return () => {
      unsubUsers();
      unsubTeams();
    };
  }, []);

  // In your useInstructorTeams hook, add this function
const transferTeamMember = async (memberUid, fromTeamId, toTeamId) => {
  try {
    // Get the teams
    const fromTeam = teams.find(t => t.id === fromTeamId);
    const toTeam = teams.find(t => t.id === toTeamId);
    
    if (!fromTeam || !toTeam) {
      throw new Error("Team not found");
    }

    // Get user details for the member being transferred
    const memberUser = allUsers.find(u => (u.uid || u.id) === memberUid);
    
    if (!memberUser) {
      throw new Error("Member user not found");
    }

    // Remove member from current team
    const updatedFromMembers = (fromTeam.memberUids || []).filter(uid => uid !== memberUid);
    const updatedFromMemberNames = (fromTeam.memberNames || []).filter(name => {
      // Remove the transferred member from memberNames
      return name !== memberUser.fullName;
    });
    
    // Add member to new team
    const updatedToMembers = [...(toTeam.memberUids || []), memberUid];
    const updatedToMemberNames = [...(toTeam.memberNames || []), memberUser.fullName];

    // Update BOTH teams in Firebase atomically using a batch
    const batch = writeBatch(db);

    // Update source team (remove member)
    const fromTeamRef = doc(db, "teams", fromTeamId);
    batch.update(fromTeamRef, {
      memberUids: updatedFromMembers,
      memberNames: updatedFromMemberNames,
      updatedAt: serverTimestamp()
    });

    // Update destination team (add member)
    const toTeamRef = doc(db, "teams", toTeamId);
    batch.update(toTeamRef, {
      memberUids: updatedToMembers,
      memberNames: updatedToMemberNames,
      updatedAt: serverTimestamp()
    });

    // Commit both updates atomically
    await batch.commit();

    return true;
  } catch (error) {
    console.error("Error transferring member:", error);
    return false;
  }
};

// Add this to your useInstructorTeams hook if you don't have it
const updateTeam = async (teamId, updates) => {
  try {
    // Replace with your actual Firebase update logic
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating team:", error);
    return false;
  }
};

  /* === computed === */
  const assignedMemberUids = useMemo(
    () => new Set(teams.flatMap((t) => t.memberUids || [])),
    [teams]
  );
  const assignedManagerUids = useMemo(
    () => new Set(teams.map((t) => t.manager?.uid).filter(Boolean)),
    [teams]
  );

  const availableManagers = useMemo(
    () => managers.filter((u) => !assignedManagerUids.has(u.uid || u.id)),
    [managers, assignedManagerUids]
  );
  const availableMembers = useMemo(
    () => members.filter((u) => !assignedMemberUids.has(u.uid || u.id)),
    [members, assignedMemberUids]
  );

  const unassignedPeople = useMemo(() => {
    const map = new Map();
    for (const u of availableManagers.concat(availableMembers)) {
      const key = u.uid || u.id;
      if (!map.has(key)) map.set(key, u);
    }
    return Array.from(map.values());
  }, [availableManagers, availableMembers]);

  // auto-fill team name when PM changes
  useEffect(() => {
    if (!ctManagerId) return;
    const pm =
      managers.find((m) => (m.uid || m.id) === ctManagerId) ||
      availableManagers.find((m) => (m.uid || m.id) === ctManagerId);
    if (pm?.lastName) setCtTeamName(`${pm.lastName}, Et Al`);
  }, [ctManagerId, managers, availableManagers]);

  /* === actions === */
  const addMember = () => {
    if (!ctMemberPick) return;
    if (!ctMemberIds.includes(ctMemberPick)) {
      setCtMemberIds((v) => [...v, ctMemberPick]);
    }
    setCtMemberPick("");
  };

  const removeMember = (uid) =>
    setCtMemberIds((v) => v.filter((x) => x !== uid));

  // ⬇️ UPDATED: promote PM + create team + placeholders in ONE batch
  const saveCreateTeam = async () => {
    try {
      if (!ctManagerId) return false;

      // resolve selected PM from any list
      const pm =
        allUsers.find((u) => (u.uid || u.id) === ctManagerId) ||
        managers.find((u) => (u.uid || u.id) === ctManagerId) ||
        null;
      if (!pm) return false;

      // team name
      const teamName = (
        ctTeamName ||
        (pm.lastName
          ? `${pm.lastName}, Et Al`
          : `${pm.fullName || "Team"}, Et Al`)
      ).trim();

      // members (exclude the PM if accidentally selected)
      const pickedMembers = members
        .filter((m) => ctMemberIds.includes(m.uid || m.id))
        .filter((m) => (m.uid || m.id) !== (pm.uid || pm.id));

      const memberUids = pickedMembers.map((m) => m.uid || m.id);
      const memberNames = pickedMembers.map((m) => m.fullName);

      const batch = writeBatch(db);

      // 1) Promote selected user to Project Manager
      const managerDocRef = doc(db, "users", pm.id);
      batch.update(managerDocRef, {
        role: "Project Manager",
        updatedAt: serverTimestamp(),
      });

      // 2) Create team document
      const teamRef = doc(collection(db, "teams"));
      batch.set(teamRef, {
        name: teamName,
        manager: {
          uid: pm.uid || pm.id,
          fullName: pm.fullName,
        },
        memberUids,
        memberNames,
        adviser: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 3) Placeholders (same fields as your previous code)
      const tdRef = doc(collection(db, "titleDefenseSchedules"));
      batch.set(tdRef, {
        teamId: teamRef.id,
        teamName,
        date: "",
        timeStart: "",
        timeEnd: "",
        panelists: [],
        verdict: "Pending",
        createdAt: serverTimestamp(),
      });

      const msRef = doc(collection(db, "manuscriptSubmissions"));
      batch.set(msRef, {
        teamId: teamRef.id,
        teamName,
        title: "",
        date: "",
        time: "",
        plag: 0,
        ai: 0,
        file: "",
        verdict: "Pending",
        createdAt: serverTimestamp(),
      });

      const odRef = doc(collection(db, "oralDefenseSchedules"));
      batch.set(odRef, {
        teamId: teamRef.id,
        teamName,
        date: "",
        timeStart: "",
        timeEnd: "",
        panelists: [],
        verdict: "Pending",
        createdAt: serverTimestamp(),
      });

      const fdRef = doc(collection(db, "finalDefenseSchedules"));
      batch.set(fdRef, {
        teamId: teamRef.id,
        teamName,
        date: "",
        timeStart: "",
        timeEnd: "",
        panelists: [],
        verdict: "Pending",
        createdAt: serverTimestamp(),
      });

      // 4) Commit all changes atomically
      await batch.commit();

      // 5) reset UI state
      setCtManagerId("");
      setCtTeamName("");
      setCtMemberPick("");
      setCtMemberIds([]);

      return true;
    } catch (err) {
      console.error("saveCreateTeam failed", err);
      alert(err?.message || "Failed to create team");
      return false;
    }
  };

  const saveAssign = async () => {
    if (!asTeamId || !asAdviserUid) return false;
    const team = teams.find((t) => t.id === asTeamId);
    if (!team) return false;
    if (team.adviser?.uid) return false;

    const adv = advisers.find((a) => (a.uid || a.id) === asAdviserUid);
    if (!adv) return false;

    await updateDoc(doc(db, "teams", asTeamId), {
      adviser: { uid: adv.uid || adv.id, fullName: adv.fullName },
    });

    setAsTeamId("");
    setAsAdviserUid("");
    return true;
  };

  const dissolveTeam = async (teamId) => {
    try {
      // 1) Delete the team document
      await deleteDoc(doc(db, "teams", teamId));

      // 2) Delete related schedules from all the necessary collections
      const collectionsToDelete = [
        "titleDefenseSchedules",
        "manuscriptSubmissions",
        "oralDefenseSchedules",
        "finalDefenseSchedules",
      ];

      await Promise.all(
        collectionsToDelete.map(async (collectionName) => {
          const snapshot = await getDocs(
            query(collection(db, collectionName), where("teamId", "==", teamId))
          );
          snapshot.forEach((docSnap) => deleteDoc(docSnap.ref));
        })
      );

      setMenuOpenId(null);
    } catch (err) {
      console.error("Failed to dissolve team:", err);
      alert("Failed to dissolve team. See console for details.");
    }
  };

  /* === edit team (rename / change PM / members) === */
  const editTeam = async (teamId, { managerUid, teamName, memberUids }) => {
    if (!teamId) return false;

    // resolve manager
    const pm =
      managers.find((m) => (m.uid || m.id) === managerUid) ||
      allUsers.find((m) => (m.uid || m.id) === managerUid) ||
      null;

    // resolve member names
    const picked = (memberUids || []).map(
      (uid) =>
        allUsers.find((u) => (u.uid || u.id) === uid) ||
        members.find((u) => (u.uid || u.id) === uid) || { uid, fullName: uid }
    );

    await updateDoc(doc(db, "teams", teamId), {
      ...(teamName ? { name: teamName } : {}),
      ...(pm
        ? { manager: { uid: pm.uid || pm.id, fullName: pm.fullName } }
        : {}),
      memberUids: picked.map((m) => m.uid || m.id),
      memberNames: picked.map((m) => m.fullName),
    });

    return true;
  };

  return {
    // data
    allUsers,
    members,
    managers,
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
    setCtMemberIds,
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

    // edit
    editTeam,
    transferTeamMember,
  };
}
