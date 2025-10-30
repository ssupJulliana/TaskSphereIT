import React from "react";
import { Menu, Bell, User, NotebookText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectManagerHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: menu toggle for mobile */}
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 rounded-lg hover:bg-neutral-100">
            <Menu className="w-6 h-6 text-[#6A0F14]" />
          </button>
        </div>

        {/* Right: notes, notifications, and profile */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-full hover:bg-neutral-100 cursor-pointer"
            onClick={() => navigate("/projectManager/notes")}
            title="Notes"
          >
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
