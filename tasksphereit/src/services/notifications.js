// src/services/notifications.js
import { db } from "../config/firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";

const COL = "notifications";

// Shape suggestion:
// {
//   title: string,
//   body: string,
//   link: string,           // e.g., "/adviser/events" or "/member/tasks"
//   recipients: [uid],      // optional
//   teamIds: [teamId],      // optional (array-contains-any up to 10)
//   role: "Adviser"|"Project Manager"|"Member", // optional
//   readBy: [uid],
//   createdAt: serverTimestamp(),
// }

export async function createNotification(docData) {
  const payload = {
    title: docData.title || "",
    body: docData.body || "",
    link: docData.link || "/",
    recipients: Array.isArray(docData.recipients) ? docData.recipients : [],
    teamIds: Array.isArray(docData.teamIds) ? docData.teamIds : [],
    role: docData.role || null,
    readBy: [],
    createdAt: serverTimestamp(),
  };
  await addDoc(collection(db, COL), payload);
}

export async function markNotificationRead(id, uid) {
  if (!id || !uid) return;
  await updateDoc(doc(db, COL, id), { readBy: arrayUnion(uid) });
}

export function subscribeNotifications({ uid, role, teamIds = [] }, cb) {
  // Build up to three queries and merge updates client-side
  const unsubs = [];
  const seen = new Map();

  const pushDocs = (label) => (snap) => {
    let changed = false;
    snap.docs.forEach((d) => {
      const prev = seen.get(d.id);
      const curr = { id: d.id, ...d.data() };
      // Merge/replace
      if (!prev || JSON.stringify(prev) !== JSON.stringify(curr)) {
        seen.set(d.id, curr);
        changed = true;
      }
    });
    if (changed) {
      const arr = Array.from(seen.values()).sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
      });
      cb(arr);
    }
  };

  // Direct to user (recipients contains uid)
  if (uid) {
    const q1 = query(
      collection(db, COL),
      where("recipients", "array-contains", uid)
    );
    unsubs.push(onSnapshot(q1, pushDocs("recipients")));
  }

  // Team-level (array-contains-any supports up to 10 teamIds)
  if (Array.isArray(teamIds) && teamIds.length > 0) {
    const batch = teamIds.slice(0, 10); // cap
    const q2 = query(
      collection(db, COL),
      where("teamIds", "array-contains-any", batch)
    );
    unsubs.push(onSnapshot(q2, pushDocs("teamIds")));
  }

  // Role-wide notifications
  if (role) {
    const q3 = query(collection(db, COL), where("role", "==", role));
    unsubs.push(onSnapshot(q3, pushDocs("role")));
  }

  return () => unsubs.forEach((u) => u && u());
}

