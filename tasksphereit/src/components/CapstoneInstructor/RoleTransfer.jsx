// src/components/CapstoneInstructor/RoleTransfer.jsx
import React, { useState } from "react";
import { db, auth } from "../../config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { User, Loader2, ArrowRight, X } from "lucide-react";

const MAROON = "#6A0F14";
const DEFAULT_PASSWORD = "UserUser321";

export default function RoleTransferDialog({ currentName, currentIdNo, currentEmail, onClose }) {
  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    idNo: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleEnroll = async () => {
    setSubmitting(true);
    setErr("");
    setOk("");
    try {
      const { email, firstName, middleName, lastName, idNo } = form;
      if (!email || !firstName || !lastName) {
        throw new Error("Please fill Email, First Name, and Last Name.");
      }

      // Create Auth user with default password
      const cred = await createUserWithEmailAndPassword(auth, email, DEFAULT_PASSWORD);
      const newUid = cred.user.uid;

      // Firestore users doc
      await setDoc(doc(db, "users", newUid), {
        uid: newUid,
        email,
        firstName,
        middleName: middleName || "",
        lastName,
        idNo: idNo || "",
        role: "Instructor",
        createdAt: serverTimestamp(),
      });

      setOk("New instructor enrolled successfully with default password.");
    } catch (e) {
      console.error(e);
      let msg = e?.message || "Failed to enroll.";
      if (e?.code === "auth/email-already-in-use") msg = "Email already in use.";
      if (e?.code === "auth/invalid-email") msg = "Invalid email address.";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-[760px] max-w-[95vw] rounded-2xl bg-white border border-neutral-200 shadow-2xl">
          {/* Header */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="text-[16px] font-semibold" style={{ color: MAROON }}>
                Role Transfer
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-neutral-100"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
            <div className="mt-3 h-[2px] w-full bg-neutral-200">
              {/* make the maroon bar full width */}
              <div className="h-[2px]" style={{ backgroundColor: MAROON, width: "100%" }} />
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pb-6">
            {/* Current */}
            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-2 font-medium" style={{ color: MAROON }}>
                <User className="w-4 h-4" /> Current Capstone Instructor
              </div>
              <div className="mt-3 grid grid-cols-2 gap-y-2">
                <div className="text-sm text-neutral-600">Name</div>
                <div className="text-sm font-medium">{currentName || "—"}</div>

                

                {/* NEW: show current email fetched from Firestore (passed via props) */}
                <div className="text-sm text-neutral-600">Email</div>
                <div className="text-sm font-medium">{currentEmail || "—"}</div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-neutral-200" />

            {/* New */}
            <div className="rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-2 font-medium" style={{ color: MAROON }}>
                <User className="w-4 h-4" /> New Capstone Instructor
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-neutral-700 mb-1">Last Name</label>
                  <input
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                                     />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 mb-1">Name</label>
                  <input
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                                      />
                </div>
                <div>
                  <label className="block text-sm text-neutral-700 mb-1">Middle Name</label>
                  <input
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    value={form.middleName}
                    onChange={(e) => set("middleName", e.target.value)}
                    
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-700 mb-1">ID NO</label>
                  <input
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    value={form.idNo}
                    onChange={(e) => set("idNo", e.target.value)}
                                     />
                </div>

                {/* Default Password — visible, not hidden */}
                <div>
                  <label className="block text-sm text-neutral-700 mb-1">Password (default)</label>
                  <input
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-neutral-50"
                    value={DEFAULT_PASSWORD}
                    readOnly
                  />
                </div>

                {/* FIXED: proper Email field (replaces the bad block) */}
                <div>
                  <label className="block text-sm text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    
                  />
                </div>
              </div>

              {/* Alerts */}
              {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
              {ok && <div className="mt-3 text-sm text-green-700">{ok}</div>}
            </div>

            {/* Footer buttons */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={submitting}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white ${
                  submitting ? "opacity-60" : ""
                }`}
                style={{ backgroundColor: MAROON }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Enroll
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
