// src/components/ProjectManager/ProjectManagerLayout.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  ClipboardList,
  ListChecks,
  LogOut,
  KanbanSquare, // Tasks Board
} from "lucide-react";
import TaskSphereLogo from "../../assets/imgs/TaskSphereLogo.png";
import ProjectManagerHeader from "./ProjectManagerHeader";
import ProjectManagerFooter from "./ProjectManagerFooter";

// Firebase
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";

const ProjectManagerLayout = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const item = (isActive) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium ${
      isActive
        ? "bg-[#6A0F14]/10 text-[#6A0F14]"
        : "text-[#6A0F14] hover:bg-neutral-100"
    }`;

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
      localStorage.removeItem("uid");
      localStorage.removeItem("role");
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
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 min-w-[16rem] shrink-0 bg-white border-r border-neutral-200">
        <div className="flex flex-col h-full py-6">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8 px-4">
            <img src={TaskSphereLogo} alt="TaskSphere IT" className="h-10" />
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 space-y-2">
            {/* Dashboard */}
            <NavLink
              to="/projectmanager/dashboard"
              className={({ isActive }) => item(isActive)}
            >
              <Home className="w-5 h-5" /> Dashboard
            </NavLink>

            {/* Tasks */}
            <NavLink
              to="/projectmanager/tasks"
              className={({ isActive }) => item(isActive)}
            >
              <ClipboardList className="w-5 h-5" /> Tasks
            </NavLink>

            <NavLink
              to="/projectmanager/tasks-board"
              className={({ isActive }) => item(isActive)}
            >
              <KanbanSquare className="w-5 h-5" /> Tasks Board
            </NavLink>

            <NavLink
              to="/projectmanager/tasks-record"
              className={({ isActive }) => item(isActive)}
            >
              <ClipboardList className="w-5 h-5" /> Tasks Record
            </NavLink>

            <NavLink
              to="/projectmanager/events"
              className={({ isActive }) => item(isActive)}
            >
              <Calendar className="w-5 h-5" /> Events
            </NavLink>
          </nav>

          {/* Sign out */}
          <div className="mt-auto px-4">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="cursor-pointer w-full flex items-center justify-center gap-3 text-sm font-medium text-[#6A0F14] border border-[#6A0F14] rounded-full px-4 py-2 hover:bg-[#6A0F14]/10 disabled:opacity-60"
            >
              <LogOut className="w-5 h-5" />
              {loggingOut ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <ProjectManagerHeader />
        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto px-4 py-6 md:px-8">
          <Outlet />
        </main>
        <ProjectManagerFooter />
      </div>
    </div>
  );
};

export default ProjectManagerLayout;
