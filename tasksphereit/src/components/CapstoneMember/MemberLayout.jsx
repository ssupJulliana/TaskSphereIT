// src/components/CapstoneMember/MemberLayout.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  ClipboardList,
  Calendar,
  FileText,
  File,
  LogOut,
} from "lucide-react";
import TaskSphereLogo from "../../assets/imgs/TaskSphereLogo.png";
import MemberHeader from "./MemberHeader";
import MemberFooter from "./MemberFooter";

// Firebase
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";

const MemberLayout = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItemClasses = (isActive) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${
      isActive
        ? "bg-[#6A0F14]/10 text-[#6A0F14]"
        : "text-neutral-700 hover:bg-neutral-100"
    }`;

  const handleLogout = async (e) => {
    e?.preventDefault?.();
    try {
      setLoggingOut(true);
      // clear local markers first (prevents guards from bouncing you back)
      localStorage.removeItem("uid");
      localStorage.removeItem("role");

      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login", { replace: true }); // fallback
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-neutral-200">
        <div className="flex flex-col h-full py-6">
          <div className="flex items-center justify-center mb-8 px-4">
            <img src={TaskSphereLogo} alt="TaskSphere IT" className="h-10" />
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <NavLink to="/member/dashboard" className={({ isActive }) => navItemClasses(isActive)}>
              <Home className="w-5 h-5" /> Dashboard
            </NavLink>
            <NavLink to="/member/tasks" className={({ isActive }) => navItemClasses(isActive)}>
              <ClipboardList className="w-5 h-5" /> Tasks
            </NavLink>
            <NavLink to="/member/adviser-tasks" className={({ isActive }) => navItemClasses(isActive)}>
              <File className="w-5 h-5" /> Adviser Tasks
            </NavLink>
            <NavLink to="/member/tasks-board" className={({ isActive }) => navItemClasses(isActive)}>
              <FileText className="w-5 h-5" /> Tasks Board
            </NavLink>
            <NavLink to="/member/tasks-record" className={({ isActive }) => navItemClasses(isActive)}>
              <ClipboardList className="w-5 h-5" /> Tasks Record
            </NavLink>
            <NavLink to="/member/events" className={({ isActive }) => navItemClasses(isActive)}>
              <Calendar className="w-5 h-5" /> Events
            </NavLink>
          </nav>

          <div className="mt-auto px-4">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 justify-center text-sm font-medium text-[#6A0F14] border border-[#6A0F14] rounded-full px-4 py-2 hover:bg-[#6A0F14]/10 disabled:opacity-60"
            >
              <LogOut className="w-5 h-5" />
              {loggingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MemberHeader />
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-8">
          <Outlet />
        </main>
        <MemberFooter />
      </div>
    </div>
  );
};

export default MemberLayout;
