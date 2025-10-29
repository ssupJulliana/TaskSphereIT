import React from "react";
import { Menu, Bell, User } from "lucide-react";

 function MemberHeader({ onOpenProfile }) {
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 rounded-lg hover:bg-neutral-100">
            <Menu className="w-6 h-6 text-[#6A0F14]" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full hover:bg-neutral-100">
            <Bell className="w-6 h-6 text-[#6A0F14]" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-neutral-100"
            onClick={onOpenProfile}
            title="Profile"
          >
            <User className="w-6 h-6 text-[#6A0F14]" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default MemberHeader
