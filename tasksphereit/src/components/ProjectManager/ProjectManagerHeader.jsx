// src/components/CapstoneInstructor/ProjectManagerHeader.jsx
import React from "react";
import TaskSphereLogo from "../../assets/imgs/TaskSphereLogo.png"; // adjust the path if needed
import { Menu, Bell, User,NotebookText } from "lucide-react";

const ProjectManagerHeader = () => {
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: menu toggle & logo */}
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 rounded-lg hover:bg-neutral-100">
            <Menu className="w-6 h-6 text-[#6A0F14]" />
          </button>
          
        </div>
        {/* Right: notification & user icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-neutral-100 cursor-pointer">
            <NotebookText className="w-6 h-6 text-[#6A0F14]" />
          </button>
          <button className="relative p-2 rounded-full hover:bg-neutral-100 cursor-pointer">
            <Bell className="w-6 h-6 text-[#6A0F14]" />
          </button>
          <button className="p-2 rounded-full hover:bg-neutral-100 cursor-pointer">
            <User className="w-6 h-6 text-[#6A0F14]" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default ProjectManagerHeader;
