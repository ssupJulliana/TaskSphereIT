// src/utils/enroll.js
import { auth, db } from "../../config/firebase";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as signOutAuth,
} from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

const DEFAULT_PASSWORD = "UserUser321";
const DEFAULT_IMAGE_URL = "None";
const TOS_VERSION = "2025-05-09";

/* ------------ secondary auth so the current admin session is untouched ------------ */
let _secondaryAuth = null;
function getSecondaryAuth() {
  if (_secondaryAuth) return _secondaryAuth;
  const NAME = "admin-user-create";
  const apps = getApps();
  let secondaryApp = apps.find((a) => a.name === NAME);
  if (!secondaryApp) {
    const cfg = getApp().options; // reuse default app config
    secondaryApp = initializeApp(cfg, NAME);
  }
  _secondaryAuth = getAuth(secondaryApp);
  return _secondaryAuth;
}

/* ------------ helpers ------------ */
const generateRandomEmail = () => {
  const s = Math.random().toString(36).slice(2, 12);
  return `${s}@gmail.com`;
};

const shapeUserDoc = (userData, uid) => ({
  uid,
  email: (userData.email || "").trim(),
  idNumber: (userData.idNumber || "").trim(),
  firstName: (userData.firstName || "").trim(),
  middleName: (userData.middleName || "").trim(),
  lastName: (userData.lastName || "").trim(),
  imageUrl: DEFAULT_IMAGE_URL,
  role: userData.role || "",
  activate: "inactive",
  // ToS defaults — NOT accepted at creation
  isTosAccepted: false,
  tosAcceptedAt: null,
  tosVersion: null,
  // your password flags
  mustChangePassword: true,
  forceDefaultPassword: true,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

/* ------------ single create ------------ */
export const createUser = async (userData) => {
  const secAuth = getSecondaryAuth();
  try {
    const cred = await createUserWithEmailAndPassword(
      secAuth,
      (userData.email || "").trim(),
      DEFAULT_PASSWORD
    );

    await addDoc(collection(db, "users"), shapeUserDoc(userData, cred.user.uid));
  } catch (error) {
    const msg =
      error?.code === "auth/email-already-in-use"
        ? "Email is already in use."
        : error?.code === "auth/invalid-email"
        ? "Please enter a valid email."
        : error?.message || "Failed to add user.";
    throw new Error(msg);
  } finally {
    // do not keep a session for the newly created account
    try {
      await signOutAuth(secAuth);
    } catch {}
  }
};

/* ------------ bulk import (Excel) ------------ */
export const saveImportedUsers = async (rows, selectedRole) => {
  if (!Array.isArray(rows) || rows.length === 0) return;
  const secAuth = getSecondaryAuth();

  try {
    for (const r of rows) {
      // if your modal marks selected rows as _select, respect it
      if (typeof r._select === "boolean" && !r._select) continue;

      const email = (r.email || "").trim() || generateRandomEmail();

      const cred = await createUserWithEmailAndPassword(
        secAuth,
        email,
        DEFAULT_PASSWORD
      );

      await addDoc(
        collection(db, "users"),
        shapeUserDoc(
          {
            email,
            idNumber: r.idNumber || "",
            firstName: r.firstName || "",
            middleName: r.middleName || "",
            lastName: r.lastName || "",
            role: selectedRole,
          },
          cred.user.uid
        )
      );
    }
  } catch (error) {
    // bubble up so caller can show a modal/toast
    throw new Error(error?.message || "Error saving imported users.");
  } finally {
    try {
      await signOutAuth(secAuth);
    } catch {}
  }
};

/* ------------ admin actions ------------ */
export const deleteAndBlockUser = async (user) => {
  try {
    const fromRef = doc(db, "users", user.id);
    const snap = await getDoc(fromRef);
    if (!snap.exists()) return;

    const data = snap.data();
    await setDoc(doc(db, "blockedUsers", user.id), {
      ...data,
      blockedAt: serverTimestamp(),
      uid: data.uid || null,
      email: data.email || null,
    });
    await deleteDoc(fromRef);
  } catch (error) {
    console.error("Block failed:", error);
    throw new Error("Failed to delete/block this account.");
  }
};

export const resetPasswordToDefault = async (user) => {
  try {
    await updateDoc(doc(db, "users", user.id), {
      forceDefaultPassword: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to set reset flag.");
  }
};

export const sendPasswordResetEmailToUser = async (user) => {
  try {
    if (!user?.email) throw new Error("No email on record.");
    await sendPasswordResetEmail(auth, user.email);
    return `Password reset email sent to ${user.email}.`;
  } catch (error) {
    console.error(error);
    throw new Error(error?.message || "Failed to send reset email.");
  }
};

export const bulkDeleteUsers = async (userIds, allUsers) => {
  for (const id of userIds) {
    const user = allUsers.find((x) => x.id === id);
    if (user) await deleteAndBlockUser(user);
  }
};

export const bulkResetPasswords = async (userIds) => {
  for (const id of userIds) {
    await updateDoc(doc(db, "users", id), {
      forceDefaultPassword: true,
      updatedAt: serverTimestamp(),
    });
  }
};

export const getMiddleInitial = (name) =>
  name ? `${name[0].toUpperCase()}.` : "";
