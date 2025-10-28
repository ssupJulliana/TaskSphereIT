// Allocation.jsx
import React from "react";
import { ChevronLeft } from "lucide-react";

export default function Allocation({ onBack }) {
  return (
    <div className="space-y-4">
      <div>
        <button
          onClick={() => (typeof onBack === "function" ? onBack() : window.history.back())}
          className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100 cursor-pointer"
          title="Back to Tasks"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tasks
        </button>
      </div>
      <div>Allocation</div>
    </div>
  );
}
