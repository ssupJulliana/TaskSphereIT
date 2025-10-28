import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../config/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { User, Loader2, Shield } from "lucide-react";

// dialogs (separate files)
import RoleTransferDialog from "./RoleTransfer";
import ChangePasswordDialog from "./ChangePassword";

const MAROON = "#6A0F14";

/* ---------- helpers ---------- */
const nameWithMiddleInitial = (firstName = "", middleName = "", lastName = "") => {
  const mi =
    middleName && middleName.trim().length > 0
      ? ` ${middleName.trim()[0].toUpperCase()}.`
      : "";
  return `${(firstName || "").trim()}${mi} ${(lastName || "").trim()}`.trim();
};
const initialsOf = (firstName = "", middleName = "", lastName = "") => {
  const f = firstName?.trim()?.[0] || "";
  const m = middleName?.trim()?.[0] || "";
  const l = lastName?.trim()?.[0] || "";
  return `${f}${l || m}`.toUpperCase();
};
const Field = ({ label, children }) => (
  <div className="flex items-start gap-3">
    <div className="w-36 shrink-0 text-sm text-neutral-600">{label}</div>
    <div className="text-sm text-neutral-900">{children}</div>
  </div>
);

const InstructorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [userDoc, setUserDoc] = useState(null);
  const [error, setError] = useState("");

  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openChangePw, setOpenChangePw] = useState(false);

  // fetch current instructor (from localStorage uid)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) throw new Error("No UID found in localStorage.");

        // try /users/{uid}
        let data = null;
        const directRef = doc(db, "users", uid);
        const directSnap = await getDoc(directRef);
        if (directSnap.exists()) {
          data = { id: directSnap.id, ...directSnap.data() };
        } else {
          // fallback query on uid
          const q = query(collection(db, "users"), where("uid", "==", uid), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const d = snap.docs[0];
            data = { id: d.id, ...d.data() };
          }
        }

        if (!alive) return;
        if (!data) setError("Instructor not found in users collection.");
        setUserDoc(data);
      } catch (e) {
        if (!alive) return;
        console.error(e);
        setError(e.message || "Failed to load instructor.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const fullName = useMemo(() => {
    if (!userDoc) return "";
    return nameWithMiddleInitial(
      userDoc.firstName,
      userDoc.middleName,
      userDoc.lastName
    );
  }, [userDoc]);

  const initials = useMemo(() => {
    if (!userDoc) return "U";
    return initialsOf(userDoc.firstName, userDoc.middleName, userDoc.lastName);
  }, [userDoc]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
        <div className="h-[6px] w-full rounded-t-2xl" style={{ backgroundColor: MAROON }} />
        <div className="p-6">
          {/* Top: avatar + name */}
          <div className="flex items-center gap-5">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow"
              style={{ backgroundColor: MAROON }}
              title="Instructor avatar"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5 text-white" /> : initials}
            </div>
            <div>
              {loading ? (
                <div className="mt-1 h-6 w-48 bg-neutral-200/70 rounded animate-pulse" />
              ) : error ? (
                <div className="mt-1 text-red-600 text-[15px]">{error}</div>
              ) : (
                <h1 className="text-[20px] font-semibold text-neutral-900">{fullName}</h1>
              )}
              <div className="text-sm text-neutral-500">Instructor</div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-5 h-px bg-neutral-200" />

          {/* Details */}
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-3/5 bg-neutral-200/70 rounded animate-pulse" />
              <div className="h-4 w-2/5 bg-neutral-200/70 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-neutral-200/70 rounded animate-pulse" />
            </div>
          ) : !error && userDoc ? (
            <div className="space-y-3">
              <Field label="Full Name"><span className="font-medium">{fullName}</span></Field>
              <Field label="First Name">{userDoc.firstName || "-"}</Field>
              <Field label="Middle Name">
                {userDoc.middleName ? `${userDoc.middleName} (${(userDoc.middleName[0] || "").toUpperCase()}.)` : "-"}
              </Field>
              <Field label="Last Name">{userDoc.lastName || "-"}</Field>
              {userDoc.idNo && <Field label="ID No">{userDoc.idNo}</Field>}
              {userDoc.email && <Field label="Email">{userDoc.email}</Field>}
              {userDoc.role && <Field label="Role">{userDoc.role}</Field>}
            </div>
          ) : null}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={() => setOpenChangePw(true)}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold border border-neutral-300 bg-white hover:bg-neutral-50"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={() => setOpenRoleDialog(true)}
              className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: MAROON }}
            >
              <Shield className="w-4 h-4" />
              Turn over of data
            </button>
          </div>
        </div>
      </div>

      {/* Role Transfer Dialog */}
      {openRoleDialog && (
        <RoleTransferDialog
          currentName={fullName}
            currentIdNo={userDoc?.idNo}
            currentEmail={userDoc?.email}   // <-- add this
            onClose={() => setOpenRoleDialog(false)}
        />
      )}

      {/* Change Password Dialog */}
      {openChangePw && (
        <ChangePasswordDialog onClose={() => setOpenChangePw(false)} />
      )}
    </div>
  );
};

export default InstructorProfile;
