// src/components/auth/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginHeader from "../common/LoginHeader.jsx";
import LoginFooter from "../common/LoginFooter.jsx";
import TaskSphereLogo from "../../assets/imgs/TaskSphereLogo.png";
import CCSLogo from "../../assets/imgs/ccs-logo.png";

// Firebase
import { auth, db } from "../../config/firebase";
import {
  signInWithEmailAndPassword,
  updatePassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";

const DEFAULT_PASSWORD = "UserUser321";

const LoginPage = () => {
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  // route mapping by role
  const routeForRole = (role) => {
    if (role === "Adviser") return "/adviser/dashboard";
    if (role === "Member") return "/member/dashboard";
    if (role === "Project Manager") return "/projectmanager/dashboard";
    // default: Instructor area (other instructor-side roles)
    return "/instructor/dashboard";
  };

  /*const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const emailTrim = email.trim();

      // 1) Auth
      const cred = await signInWithEmailAndPassword(auth, emailTrim, pwd);

      // 2) Find role/profile in Firestore (users collection) — prefer by uid
      const usersRef = collection(db, "users");
      let profileDoc = null;

      const byUid = query(
        usersRef,
        where("uid", "==", cred.user.uid),
        limit(1)
      );
      const uidSnap = await getDocs(byUid);
      if (!uidSnap.empty) {
        profileDoc = uidSnap.docs[0];
      } else {
        // Fallback to email
        const byEmail = query(
          usersRef,
          where("email", "==", emailTrim),
          limit(1)
        );
        const emailSnap = await getDocs(byEmail);
        if (!emailSnap.empty) {
          profileDoc = emailSnap.docs[0];
        }
      }

      if (!profileDoc) {
        await signOut(auth);
        setErr("Account profile not found. Please contact the administrator.");
        setLoading(false);
        return;
      }

      const profile = profileDoc.data();
      const role = profile.role || null;

      // 3) Store to localStorage
      localStorage.setItem("uid", cred.user.uid);
      if (role) localStorage.setItem("role", role);

      // 4) Optional: Force default password if flagged
      if (profile.forceDefaultPassword) {
        await updatePassword(cred.user, DEFAULT_PASSWORD);
        await updateDoc(doc(db, "users", profileDoc.id), {
          forceDefaultPassword: false,
          updatedAt: new Date(),
        });
      }

      // 5) Navigate based on role
      navigate(routeForRole(role), { replace: true });
    } catch (e2) {
      console.error(e2);
      let msg = "Sign-in failed. Please check your credentials.";
      if (e2.code === "auth/invalid-email") msg = "Invalid email address.";
      else if (
        e2.code === "auth/user-not-found" ||
        e2.code === "auth/wrong-password"
      )
        msg = "Incorrect email or password.";
      else if (e2.code === "auth/too-many-requests")
        msg = "Too many attempts. Try again later.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };*/

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const emailTrim = email.trim();

      // 1) Auth
      const cred = await signInWithEmailAndPassword(auth, emailTrim, pwd);

      // 2) Find the role/profile in Firestore (users collection)
      const usersRef = collection(db, "users");
      const byUid = query(
        usersRef,
        where("uid", "==", cred.user.uid),
        limit(1)
      );
      const uidSnap = await getDocs(byUid);
      let profileDoc = null;

      if (!uidSnap.empty) {
        profileDoc = uidSnap.docs[0];
      } else {
        // Fallback to email search
        const byEmail = query(
          usersRef,
          where("email", "==", emailTrim),
          limit(1)
        );
        const emailSnap = await getDocs(byEmail);
        if (!emailSnap.empty) {
          profileDoc = emailSnap.docs[0];
        }
      }

      if (!profileDoc) {
        await signOut(auth);
        setErr("Account profile not found.");
        setLoading(false);
        return;
      }

      const profile = profileDoc.data();
      const role = profile.role || null;
      const currentActivateStatus = profile.activate;

      console.log("Logging in user:", profile.email);
      console.log("Current activate status:", currentActivateStatus);
      console.log("Role:", role);

      // Check if the instructor is retired - prevent login
      if (role === "Instructor" && currentActivateStatus === "retired") {
        await signOut(auth);
        setErr("Invalid credentials. This account is no longer active.");
        setLoading(false);
        return;
      }

      if (role === "Instructor" && currentActivateStatus === "inactive") {
        try {
          // Find the currently active instructor
          const activeInstructorQuery = query(
            usersRef,
            where("activate", "==", "active"),
            where("role", "==", "Instructor"),
            limit(1)
          );
          const activeInstructorSnap = await getDocs(activeInstructorQuery);

          if (!activeInstructorSnap.empty) {
            const activeInstructorDoc = activeInstructorSnap.docs[0];
            const activeInstructorData = activeInstructorDoc.data();

            console.log(
              "Found active instructor to retire:",
              activeInstructorData.email
            );
            console.log(
              "Active instructor document ID:",
              activeInstructorDoc.id
            );

            // Set the currently active instructor to "retired"
            await updateDoc(doc(db, "users", activeInstructorDoc.id), {
              activate: "retired",
              updatedAt: new Date(),
            });

            console.log(
              `Successfully set ${activeInstructorData.email} to retired`
            );
          } else {
            console.log("No active instructor found to retire");
          }
        } catch (retireError) {
          console.error("Error retiring active instructor:", retireError);
        }
      }

      // Set the current user's 'activate' status to "active"
      await updateDoc(doc(db, "users", profileDoc.id), {
        activate: "active",
        updatedAt: new Date(),
      });

      console.log("Current user set to active");

      // Store the user details in localStorage
      localStorage.setItem("uid", cred.user.uid);
      if (role) localStorage.setItem("role", role);

      // Navigate based on the role
      navigate(routeForRole(role), { replace: true });
    } catch (e2) {
      console.error("Login error:", e2);
      let msg = "Sign-in failed. Please check your credentials.";
      if (e2.code === "auth/invalid-email") msg = "Invalid email address.";
      else if (
        e2.code === "auth/user-not-found" ||
        e2.code === "auth/wrong-password"
      ) {
        msg = "Incorrect email or password.";
      } else if (e2.code === "auth/too-many-requests") {
        msg = "Too many attempts. Try again later.";
      }
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <LoginHeader />

      {/* Main section */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-6 md:px-16 pt-10 pb-8">
        {/* LEFT PANEL — login form */}
        <div className="flex justify-center md:justify-end">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-lg px-10 py-12">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold leading-snug text-[#3b0b0e]">
                Welcome to
                <br />
                TaskSphere IT
              </h1>

              {/* Brand mark */}
              <div className="mx-auto mt-6 h-20 w-20 grid place-items-center">
                <img
                  src={TaskSphereLogo}
                  alt="TaskSphere Logo"
                  className="object-contain h-full w-full"
                />
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSignIn} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 grid place-items-center px-3 text-neutral-500 hover:text-neutral-700"
                    tabIndex={-1}
                  >
                    {showPwd ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.584 10.59a3 3 0 104.243 4.243M9.88 5.08A8.967 8.967 0 0112 5c4.5 0 8.268 2.943 9.75 7-.365 1.053-.915 2.03-1.62 2.9m-3.014 2.518A10.013 10.013 0 0112 19c-4.5 0-8.268-2.943-9.542-7a11.415 11.415 0 012.694-4.042"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Error + Forgot password link */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="h-5">
                    {err && <p className="text-xs text-red-600">{err}</p>}
                  </div>

                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#6A0F14] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* SIGN IN */}
              <button
                type="submit"
                disabled={loading || !email.trim() || !pwd.trim()}
                className="mt-2 w-48 mx-auto block rounded-full px-6 py-3 text-white font-medium hover:opacity-95 active:scale-[.99] bg-[#6A0F14] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6">
            <img
              src={CCSLogo}
              alt="CCS Logo"
              className="mx-auto md:mx-0 h-28 w-28 object-contain"
            />
            <h2 className="mt-6 md:mt-0 text-2xl md:text-3xl font-bold text-neutral-700 max-w-md">
              A Task Management System for
              <br className="hidden md:block" />
              Capstone Project Development
            </h2>
          </div>
        </div>
      </div>

      {/* Footer */}
      <LoginFooter />
    </div>
  );
};

export default LoginPage;