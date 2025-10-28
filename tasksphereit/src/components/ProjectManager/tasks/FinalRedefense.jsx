// src/components/ProjectManager/tasks/FinalRedefense.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

function FinalRedefense({onBack}) {
  const navigate = useNavigate();
  const handleBack = () => navigate("/projectmanager/tasks");

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

      <div>FinalRedefense</div>
    </div>
  );
}

export default FinalRedefense;
