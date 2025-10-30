// src/utils/enroll.js
import { auth, db } from "../../config/firebase";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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

const generateRandomEmail = () => {
  const randomString = Math.random().toString(36).substring(2, 12); // Generate a random string
  return `${randomString}@gmail.com`; // Append @gmail.com
};

export const createUser = async (userData) => {
  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      userData.email.trim(),
      DEFAULT_PASSWORD
    );

    await addDoc(collection(db, "users"), {
      uid: cred.user.uid, // Firebase user UID
      email: userData.email.trim() || "", // User's email
      idNumber: userData.idNumber.trim() || "", // User's ID number
      firstName: userData.firstName.trim() || "", // User's first name
      middleName: userData.middleName.trim() || "", // User's middle name
      lastName: userData.lastName.trim() || "", // User's last name
      imageUrl: DEFAULT_IMAGE_URL, // Default image URL
      role: userData.role || "", // User's role (from form)
      createdAt: serverTimestamp(), // Timestamp when the user is created
      updatedAt: serverTimestamp(), // Timestamp for updates
      mustChangePassword: true, // Flag to force password change on first login
      forceDefaultPassword: true, // Flag to enforce default password
      isTosAccepted: false, // Flag for Terms of Service acceptance (default false)
      tosAcceptedAt: serverTimestamp(), // Timestamp when the Terms of Service was accepted (initially set to creation time)
      tosVersion: "2025-05-09", // Version of the Terms of Service
    });
  } catch (error) {
    const errorMessage =
      error?.code === "auth/email-already-in-use"
        ? "Email is already in use."
        : error?.code === "auth/invalid-email"
        ? "Please enter a valid email."
        : error?.message || "Failed to add user.";
    throw new Error(errorMessage);
  }
};

export const saveImportedUsers = async (rows, selectedRole) => {
  try {
    for (const r of rows) {
      // Generate a random email for each user
      const randomEmail = generateRandomEmail();

      // Create user in Firebase Authentication
      const cred = await createUserWithEmailAndPassword(
        auth,
        randomEmail, // Using the generated email
        DEFAULT_PASSWORD
      );

      // Add user to Firestore with additional fields
      await addDoc(collection(db, "users"), {
        uid: cred.user.uid, // Firebase user UID
        email: randomEmail || null, // Randomly generated email
        idNumber: r.idNumber || "", // User's ID number
        firstName: r.firstName || "", // User's first name
        middleName: r.middleName || "", // User's middle name
        lastName: r.lastName || "", // User's last name
        role: selectedRole, // Role assigned during import
        imageUrl: DEFAULT_IMAGE_URL, // Default image URL
        createdAt: serverTimestamp(), // Timestamp when the user is created
        updatedAt: serverTimestamp(), // Timestamp for updates
        mustChangePassword: true, // Flag to force password change on first login
        forceDefaultPassword: true, // Flag to enforce default password
        isTosAccepted: false, // Flag for Terms of Service acceptance (default false)
        tosAcceptedAt: serverTimestamp(), // Timestamp when the Terms of Service was accepted
        tosVersion: "2025-05-09", // Version of the Terms of Service
      });
    }
  } catch (error) {
    alert("Error saving users:", error); // Log the error to the console
  }
};

/**
 * Delete user from 'users' collection and move to 'blockedUsers'
 * @param {Object} user - User object with id
 * @returns {Promise<void>}
 */
export const deleteAndBlockUser = async (user) => {
  try {
    const fromRef = doc(db, "users", user.id);
    const snap = await getDoc(fromRef);

    if (!snap.exists()) {
      return;
    }

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

/**
 * Set flag to reset user password to default on next login
 * @param {Object} user - User object with id
 * @returns {Promise<void>}
 */
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

/**
 * Send password reset email to user
 * @param {Object} user - User object with email
 * @returns {Promise<string>} Success message
 */
export const sendPasswordResetEmailToUser = async (user) => {
  try {
    if (!user?.email) {
      throw new Error("No email on record.");
    }
    await sendPasswordResetEmail(auth, user.email);
    return `Password reset email sent to ${user.email}.`;
  } catch (error) {
    console.error(error);
    throw new Error(error?.message || "Failed to send reset email.");
  }
};

/**
 * Bulk delete and block multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Array} allUsers - All users array to find user objects
 * @returns {Promise<void>}
 */
export const bulkDeleteUsers = async (userIds, allUsers) => {
  for (const id of userIds) {
    const user = allUsers.find((x) => x.id === id);
    if (user) {
      await deleteAndBlockUser(user);
    }
  }
};

/**
 * Bulk reset passwords to default for multiple users
 * @param {Array} userIds - Array of user IDs
 * @returns {Promise<void>}
 */
export const bulkResetPasswords = async (userIds) => {
  for (const id of userIds) {
    await updateDoc(doc(db, "users", id), {
      forceDefaultPassword: true,
      updatedAt: serverTimestamp(),
    });
  }
};

/**
 * Get middle initial from middle name
 * @param {string} name - Middle name
 * @returns {string} Middle initial with period
 */
export const getMiddleInitial = (name) => {
  return name ? `${name[0].toUpperCase()}.` : "";
};
