// src/components/CapstoneInstructor/InstructorLayout.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, ClipboardList, Users, Calendar, Shield, LogOut } from "lucide-react";
import TaskSphereLogo from "../../assets/imgs/TaskSphereLogo.png";
import InstructorHeader from "./InstructorHeader";
import InstructorFooter from "./InstructorFooter";

// Firebase
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";

const InstructorLayout = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItemClasses = (isActive) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${
      isActive ? "bg-[#6A0F14]/10 text-[#6A0F14]" : "text-neutral-700 hover:bg-neutral-100"
    }`;

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
      localStorage.removeItem("uid");
      localStorage.removeItem("role");
      // clear other auth-related keys if you add them later
      navigate("/login", { replace: true });
    } catch (e) {
      console.error("Logout failed:", e);
      localStorage.removeItem("uid");
      localStorage.removeItem("role");
      navigate("/login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    // Lock the window: full viewport height + no window scroll
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-neutral-200">
        <div className="flex flex-col h-full py-6">
          <div className="flex items-center justify-center mb-8 px-4">
            <img src={TaskSphereLogo} alt="TaskSphere IT" className="h-10" />
          </div>

          <nav className="flex-1 px-4 space-y-1">
            <NavLink to="/instructor/dashboard" className={({ isActive }) => navItemClasses(isActive)}>
              <Home className="w-5 h-5" /> Dashboard
            </NavLink>
            <NavLink to="/instructor/enroll" className={({ isActive }) => navItemClasses(isActive)}>
              <ClipboardList className="w-5 h-5" /> Enroll
            </NavLink>
            <NavLink to="/instructor/teams" className={({ isActive }) => navItemClasses(isActive)}>
              <Users className="w-5 h-5" /> Teams
            </NavLink>
            <NavLink to="/instructor/schedule" className={({ isActive }) => navItemClasses(isActive)}>
              <Calendar className="w-5 h-5" /> Schedule
            </NavLink>
            <NavLink to="/instructor/role-transfer" className={({ isActive }) => navItemClasses(isActive)}>
              <Shield className="w-5 h-5" /> Role Transfer
            </NavLink>
          </nav>

          <div className="mt-auto px-4">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-3 text-sm font-medium text-[#6A0F14] border border-[#6A0F14] rounded-full px-4 py-2 hover:bg-[#6A0F14]/10 disabled:opacity-60"
            >
              <LogOut className="w-5 h-5" />
              {loggingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0">
        <InstructorHeader />
        <main className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-8">
          <Outlet />
        </main>
        <InstructorFooter />
      </div>
    </div>
  );
};

export default InstructorLayout;
