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
  where
} from "firebase/firestore";

/* ---------- helpers (exported in case you want them elsewhere) ---------- */
export const fullNameOf = (u = {}) => {
  const m = u.middleName ? ` ${u.middleName}` : "";
  return `${u.firstName || ""}${m} ${u.lastName || ""}`.replace(/\s+/g, " ").trim();
};
export const roleKey = (r = "") => r.toLowerCase();
export const isPM = (r) => ["project manager", "project_manager", "pm", "manager"].includes(roleKey(r));
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

  const removeMember = (uid) => setCtMemberIds((v) => v.filter((x) => x !== uid));

    const saveCreateTeam = async () => {
        const pm =
            managers.find((m) => (m.uid || m.id) === ctManagerId) ||
            availableManagers.find((m) => (m.uid || m.id) === ctManagerId);
        if (!pm) return false;

        const pickedMembers = members.filter((m) => ctMemberIds.includes(m.uid || m.id));
        const teamName = (ctTeamName || `${pm.lastName}, Et Al`).trim();

        // 1) Create the team doc
        const teamDocRef = await addDoc(collection(db, "teams"), {
            name: teamName,
            manager: {
            uid: pm.uid || pm.id,
            fullName: pm.fullName,
            },
            memberUids: pickedMembers.map((m) => m.uid || m.id),
            memberNames: pickedMembers.map((m) => m.fullName),
            adviser: null,
            createdAt: serverTimestamp(),
        });

        // 2) Create placeholder schedule/docs (Title Defense already existed; kept)
        await Promise.all([
            // Title Defense (existing pattern)
            addDoc(collection(db, "titleDefenseSchedules"), {
            teamId: teamDocRef.id,
            teamName,
            date: "",
            timeStart: "",
            timeEnd: "",
            panelists: [],
            verdict: "Pending",
            createdAt: serverTimestamp(),
            }),

            // Manuscript Submissions (extra params)
            addDoc(collection(db, "manuscriptSubmissions"), {
            teamId: teamDocRef.id,
            teamName,
            title: "",
            date: "",
            time: "",
            plag: 0,
            ai: 0,
            file: "",
            verdict: "Pending",
            createdAt: serverTimestamp(),
            }),

            // Oral Defense
            addDoc(collection(db, "oralDefenseSchedules"), {
            teamId: teamDocRef.id,
            teamName,
            date: "",
            timeStart: "",
            timeEnd: "",
            panelists: [],
            verdict: "Pending",
            createdAt: serverTimestamp(),
            }),

            // Final Defense
            addDoc(collection(db, "finalDefenseSchedules"), {
            teamId: teamDocRef.id,
            teamName,
            date: "",
            timeStart: "",
            timeEnd: "",
            panelists: [],
            verdict: "Pending",
            createdAt: serverTimestamp(),
            }),
        ]);

        // 3) reset UI state
        setCtManagerId("");
        setCtTeamName("");
        setCtMemberIds([]);
        return true;
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
      "finalDefenseSchedules"
    ];

    // 2.1) Loop through each collection and delete documents that contain teamId as a field
    await Promise.all(
      collectionsToDelete.map(async (collectionName) => {
        const snapshot = await getDocs(
          query(collection(db, collectionName), where("teamId", "==", teamId))
        );
        snapshot.forEach((doc) => deleteDoc(doc.ref)); // delete each matched document
      })
    );

    setMenuOpenId(null); // Close the team menu after dissolution
  } catch (err) {
    console.error("Failed to dissolve team:", err);
    alert("Failed to dissolve team. See console for details.");
  }
};



  /* === NEW: edit team (rename / change PM / members) === */
  const editTeam = async (teamId, { managerUid, teamName, memberUids }) => {
    if (!teamId) return false;

    // resolve manager
    const pm =
      managers.find((m) => (m.uid || m.id) === managerUid) ||
      allUsers.find((m) => (m.uid || m.id) === managerUid) ||
      null;

    // resolve member names
    const picked = (memberUids || []).map((uid) =>
      allUsers.find((u) => (u.uid || u.id) === uid) ||
      members.find((u) => (u.uid || u.id) === uid) ||
      { uid, fullName: uid }
    );

    await updateDoc(doc(db, "teams", teamId), {
      ...(teamName ? { name: teamName } : {}),
      ...(pm ? { manager: { uid: pm.uid || pm.id, fullName: pm.fullName } } : {}),
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

    // NEW
    editTeam,
  };
}
