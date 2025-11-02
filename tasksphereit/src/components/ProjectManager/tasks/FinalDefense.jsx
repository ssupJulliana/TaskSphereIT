// src/components/ProjectManager/tasks/FinalDefense.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  UserCircle2,
  Paperclip,
  X,
  Loader2,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

/* ===== Firebase (Firestore + Storage) ===== */
import { auth, db } from "../../../config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

/* ===== Supabase (Storage) ===== */
import { supabase } from "../../../config/supabase";

const MAROON = "#6A0F14";
const ORAL_TASKS_COLLECTION = "oralDefenseTasks";
const FINAL_TASKS_COLLECTION = "finalDefenseTasks";

const ENABLE_SUPABASE =
  !!supabase && typeof supabase.storage?.from === "function";

const SUPABASE_ATTACH_BUCKET =
  import.meta.env.VITE_SUPABASE_ATTACH_BUCKET || "task-attachments";
const FIREBASE_ATTACH_ROOT =
  import.meta.env.VITE_FIREBASE_ATTACH_ROOT || "attachments/finalDefense";

/* === Methodology content (unchanged from previous version) === */
const METHODOLOGY_CONTENT_FINAL = {
  Agile: {
    phases: [
      "Develop",
      "Design",
      "Development",
      "Test Plan",
      "Verification and Testing",
      "System Testing",
      "Acceptance Testing",
      "Implementation Plan",
      "Installation Process",
      "Deploy",
      "Review",
      "Discussion & Review",
      "Final Defense",
      "Final Re-Defense Planning",
      "Finalize Supporting Sections",
    ],
    types: {
      Documentation: {
        tasks: {
          "Polish: Chapter 1": [
            "Introduction - Project Context",
            "Introduction - Background of the Study",
            "Introduction - Policies and Procedures",
            "Introduction - Users Position",
            "Objectives - General Objectives",
            "Objectives - Specific Objectives",
            "Scope and Limitation - Scope",
            "Scope and Limitation - Limitation",
          ],
          "Polish: Chapter 2": ["Related Theories", "Related Literature"],
          "Polish: Chapter 3": [
            "Implementation - Hardware",
            "Implementation - Software",
            "Implementation - Peopleware",
            "Development - Hardware",
            "Development - Software",
            "Development - Peopleware",
          ],
          "Polish: Chapter 4": [
            "Methodology",
            "Environment - Locale",
            "Environment - Population of the Study",
            "Environment - Organizational Chart/Profile",
            "Requirement Specification - Operational Feasibility (Fishbone Diagram)",
            "Requirement Specification - Operational Feasibility (Functional Decomposition)",
            "Requirement Specification - Technical Feasibility",
            "Requirement Specification - Schedule Feasibility",
            "Requirement Specification - Economic Feasibility",
            "Requirements Modeling - Context Diagram",
            "Requirements Modeling - Data Flow Diagram",
            "Requirements Modeling - System Flowchart",
            "Requirements Modeling - Program Flowchart",
            "Requirements Modeling - Use Case Diagram",
            "Requirements Modeling - Use Class Diagram",
            "Requirements Modeling - Sequence Diagram",
            "Requirements Modeling - Activity Diagram",
            "Risk Assessment/Analysis",
            "Design - Output & UI Forms",
            "Design - Data Design",
            "System Architecture - Network Model",
            "System Architecture - Network Topology",
            "System Architecture - Network Security",
            "Programming Environment - Front End",
            "Programming Environment - Back End",
            "Programming Considerations and Issues",
            "Development Diagram",
            "Test Plan - Test Data",
          ],
          "Complete: Chapter 5": ["Conclusion", "Recommendations"],
          "Appendices (A–I)": [
            "Appendix A",
            "Appendix B",
            "Appendix C",
            "Appendix D",
            "Appendix E",
            "Appendix F",
            "Appendix G",
            "Appendix H",
            "Appendix I",
          ],
          "Finalize Supporting Sections": ["References", "Resource Person"],
          "Manuscript Submission": [
            "Final Manuscript Revision (Post-Defense)",
            "Submission",
            "Submission for AI & Plagiarism Check",
          ],
        },
      },
      "System Development": {
        tasks: {
          "UI Development": [],
          "Database Implementation": [],
          "Functionality Implementation": [],
          "Bug Fixing": [],
          "Development Diagram": [],
        },
      },
      Testing: {
        tasks: {
          "System QA": [
            "Unit Testing",
            "Compatibility Testing",
            "Performance Testing",
            "Stress Testing",
            "Load Testing",
            "Concurrent Testing",
            "Pacing Time",
            "Response Time",
            "Network Testing",
          ],
          "Bug Fixing and Final Adjustments": [],
        },
      },
      Deploy: { tasks: { "Deploy the System": [] } },
      Review: {
        tasks: {
          "Gather Target Users/Client": [],
          "Gather Users/Client Feedback": [],
          "Review Users Feedback": [],
          "Update System Functionalities": [],
          "Final Defense Feedback Integration": [],
        },
      },
      "Discussion & Review": {
        tasks: {
          "Capstone Meeting": [],
          "Adviser Consultation": [],
          "Meeting with the User/Client": [],
          "Final Defense Preparation - System Testing Request Letter": [],
          "Final Defense Preparation - PowerPoint Presentation": [],
          "Final Defense Preparation - Mock Defense": [],
          "Final Defense Preparation - Manuscript Printing": [],
        },
      },
    },
  },
  "Extreme Programming (XP)": {
    phases: [
      "Coding",
      "Testing",
      "Listening",
      "Discussion & Review",
      "Final Defense",
      "Final Re-Defense Planning",
    ],
    types: {
      Documentation: {
        tasks: {
          "Polish: Chapter 1": [
            "Introduction - Project Context",
            "Introduction - Background of the Study",
            "Introduction - Policies and Procedures",
            "Introduction - Users Position",
            "Objectives - General",
            "Objectives - Specific",
            "Scope and Limitation - Scope",
            "Scope and Limitation - Limitation",
          ],
          "Polish: Chapter 2": ["Related Theories", "Related Literature"],
          "Polish: Chapter 3": [
            "Implementation - Hardware",
            "Implementation - Software",
            "Implementation - Peopleware",
            "Development - Hardware",
            "Development - Software",
            "Development - Peopleware",
          ],
          "Polish: Chapter 4": [
            "Methodology",
            "Environment - Locale",
            "Environment - Population of the Study",
            "Environment - Organizational Chart/Profile",
            "Requirement Spec - Feasibility (Fishbone/Decomposition/Tech/Schedule/Economic)",
            "Requirements Modeling - Context/DFD/System Flowchart/Program Flowchart/Use Case/Class/Sequence/Activity",
            "Risk Assessment/Analysis",
            "Design - UI Forms / Data Design / Architecture (Network/Topology/Security)",
            "Programming Environment - Front End / Back End",
            "Programming Considerations & Issues",
            "Development Diagram",
            "Test Plan - Test Data",
          ],
          "Complete: Chapter 5": ["Conclusion", "Recommendations"],
          "Appendices (A–I)": [
            "Appendix A",
            "Appendix B",
            "Appendix C",
            "Appendix D",
            "Appendix E",
            "Appendix F",
            "Appendix G",
            "Appendix H",
            "Appendix I",
          ],
          "Finalize Supporting Sections": ["References", "Resource Person"],
          "Manuscript Submission": [
            "Final Manuscript Revision (Post-Defense)",
            "Submission",
            "Submission for AI & Plagiarism Check",
          ],
        },
      },
      "System Development": {
        tasks: {
          "Development Environment Setup & Pair Assignment": [],
          "User Interface Coding with Customer Collaboration": [],
          "Incremental Database Development": [],
          "Test-Driven Feature Development": [],
          "Continuous Integration": [],
          "Bug Fixing": [],
        },
      },
      Testing: {
        tasks: {
          "System QA": [
            "Unit Testing",
            "Compatibility Testing",
            "Performance Testing",
            "Stress Testing",
            "Load Testing",
            "Concurrent Testing",
            "Pacing Time",
            "Response Time",
            "Network Testing",
          ],
          "Bug Fixing and Final Adjustments": [],
        },
      },
      Deploy: { tasks: { "Deploy the System": [] } },
      Listening: {
        tasks: {
          "Engage Customer & Stakeholders": [],
          "Collaborate on Feedback Review": [],
          "Iterative Requirement Gathering": [],
          "Refine Features Based on Input": [],
        },
      },
      "Discussion & Review": {
        tasks: {
          "Capstone Meeting": [],
          "Adviser Consultation": [],
          "Meeting with the User/Client": [],
          "Final Defense Preparation - System Testing Request Letter": [],
          "Final Defense Preparation - PowerPoint Presentation": [],
          "Final Defense Preparation - Mock Defense": [],
          "Final Defense Preparation - Manuscript Printing": [],
        },
      },
    },
  },
  "Rapid Application Development (RAD)": {
    phases: [
      "Construction",
      "Testing",
      "Cutover",
      "Discussion & Review",
      "Final Defense",
      "Final Re-Defense Planning",
    ],
    types: {
      Documentation: {
        tasks: {
          "Polish: Chapter 1": [
            "Introduction - Project Context",
            "Introduction - Background of the Study",
            "Introduction - Policies and Procedures",
            "Introduction - Users Position",
            "Objectives - General / Specific",
            "Scope and Limitation - Scope / Limitation",
          ],
          "Polish: Chapter 2": ["Related Theories", "Related Literature"],
          "Polish: Chapter 3": [
            "Implementation - Hardware/Software/Peopleware",
            "Development - Hardware/Software/Peopleware",
          ],
          "Polish: Chapter 4": [
            "Methodology",
            "Environment - Locale / Population / Org Chart",
            "Requirement Specification - Feasibility (Fishbone/Decomp/Tech/Schedule/Economic)",
            "Requirements Modeling (Context/DFD/System/Program/Use Case/Class/Sequence/Activity)",
            "Risk Assessment/Analysis",
            "Design (UI Forms / Data / Architecture & Security)",
            "Programming Environment (Front End / Back End)",
            "Programming Considerations and Issues",
            "Development Diagram",
            "Test Plan - Test Data",
          ],
          "Complete: Chapter 5": ["Conclusion", "Recommendations"],
          "Appendices (A–I)": [
            "Appendix A",
            "Appendix B",
            "Appendix C",
            "Appendix D",
            "Appendix E",
            "Appendix F",
            "Appendix G",
            "Appendix H",
            "Appendix I",
          ],
          "Finalize Supporting Sections": ["References", "Resource Person"],
          "Manuscript Submission": [
            "Final Manuscript Revision (Post-Defense)",
            "Submission",
            "Submission for AI & Plagiarism Check",
          ],
        },
      },
      "System Development": {
        tasks: {
          "UI Development": [],
          "Database Implementation": [],
          "Functionality Implementation": [],
          "Iterative Internal Testing": [],
          "Bug Fixing": [],
          "System QA": [
            "Unit / Compatibility / Performance / Stress / Load / Concurrent / Pacing / Response / Network Testing",
          ],
          "Rapid Fixes Based on Test Results": [],
          "Bug Fixing and Final Adjustments": [],
        },
      },
      Cutover: {
        tasks: {
          "Deploy the System": [],
          "Train End Users": [],
          "Evaluate Final User Feedback": [],
          "Gather Users/Client Feedback": [],
          "Update System Functionalities": [],
        },
      },
      "Discussion & Review": {
        tasks: {
          "Capstone Meeting": [],
          "Adviser Consultation": [],
          "Meeting with the User/Client": [],
          "Final Defense Preparation - System Testing Request Letter": [],
          "Final Defense Preparation - PowerPoint Presentation": [],
          "Final Defense Preparation - Mock Defense": [],
          "Final Defense Preparation - Manuscript Printing": [],
        },
      },
    },
  },
  Prototyping: {
    phases: [
      "Refining Prototype",
      "Implement Product & Maintain",
      "Discussion & Review",
      "Final Defense",
      "Final Re-Defense Planning",
    ],
    types: {
      Documentation: {
        tasks: {
          "Refine UI & Functionalities based on Panel Feedback": [],
          "Polish: Chapter 1": [
            "Introduction - Project Context / Background / Policies / Users Position",
            "Objectives - General / Specific",
            "Scope and Limitation - Scope / Limitation",
          ],
          "Polish: Chapter 2": ["Related Theories", "Related Literature"],
          "Polish: Chapter 3": [
            "Implementation - Hardware/Software/Peopleware",
            "Development - Hardware/Software/Peopleware",
          ],
          "Polish: Chapter 4": [
            "Methodology",
            "Environment - Locale / Population / Org Chart",
            "Requirement Specification - Feasibility (Fishbone/Decomp/Tech/Schedule/Economic)",
            "Requirements Modeling (Context/DFD/System/Program/Use Case/Class/Sequence/Activity)",
            "Risk Assessment/Analysis",
            "Design (UI / Data / Architecture & Security)",
            "Development Diagram / Test Plan",
          ],
          "Complete: Chapter 5": ["Conclusion", "Recommendations"],
          "Appendices (A–I)": [
            "Appendix A",
            "Appendix B",
            "Appendix C",
            "Appendix D",
            "Appendix E",
            "Appendix F",
            "Appendix G",
            "Appendix H",
            "Appendix I",
          ],
          "Finalize Supporting Sections": ["References", "Resource Person"],
          "Manuscript Submission": [
            "Final Manuscript Revision (Post-Defense)",
            "Submission",
            "Submission for AI & Plagiarism Check",
          ],
        },
      },
      "System Development": {
        tasks: {
          "UI Development": [],
          "Database Implementation": [],
          "Implement Core Functional Modules": [],
          "System Maintenance and Issue Resolution": [],
          "System QA": [
            "Unit / Compatibility / Performance / Stress / Load / Concurrent / Pacing / Response / Network Testing",
          ],
          "Bug Fixing and Final Adjustments": [],
          "Deploy the System": [],
          "Post-Deployment User Feedback Review": [],
          "Review Users Feedback": [],
          "Update System Functionalities": [],
        },
      },
      "Discussion & Review": {
        tasks: {
          "Capstone Meeting": [],
          "Adviser Consultation": [],
          "Meeting with the User/Client": [],
          "Final Defense Preparation - System Testing Request Letter": [],
          "Final Defense Preparation - PowerPoint Presentation": [],
          "Final Defense Preparation - Mock Defense": [],
          "Final Defense Preparation - Manuscript Printing": [],
        },
      },
    },
  },
  Spiral: {
    phases: [
      "Engineering",
      "Evaluate",
      "Discussion & Review",
      "Final Defense",
      "Final Re-Defense Planning",
    ],
    types: {
      Documentation: {
        tasks: {
          "Polish: Chapter 1": [
            "Introduction - Project Context / Background / Policies / Users Position",
            "Objectives - General / Specific",
            "Scope and Limitation - Scope / Limitation",
          ],
          "Polish: Chapter 2": ["Related Theories", "Related Literature"],
          "Polish: Chapter 3": [
            "Implementation - Hardware/Software/Peopleware",
            "Development - Hardware/Software/Peopleware",
          ],
          "Polish: Chapter 4": [
            "Methodology",
            "Environment - Locale / Population / Org Chart",
            "Requirement Specification - Feasibility (Fishbone/Decomp/Tech/Schedule/Economic)",
            "Requirements Modeling (Context/DFD/System/Program/Use Case/Class/Sequence/Activity)",
            "Risk Assessment/Analysis",
            "Design (UI / Data / Architecture & Security)",
            "Programming Environment - Front End / Back End",
            "Programming Considerations & Issues",
            "Development Diagram",
            "Test Plan - Test Data",
          ],
          "Complete: Chapter 5": ["Conclusion", "Recommendations"],
          "Appendices (A–I)": [
            "Appendix A",
            "Appendix B",
            "Appendix C",
            "Appendix D",
            "Appendix E",
            "Appendix F",
            "Appendix G",
            "Appendix H",
            "Appendix I",
          ],
          "Finalize Supporting Sections": ["References", "Resource Person"],
          "Manuscript Submission": [
            "Final Manuscript Revision (Post-Defense)",
            "Submission",
            "Submission for AI & Plagiarism Check",
          ],
        },
      },
      "System Development": {
        tasks: {
          "User Interface Construction": [],
          "Database Design & Integration": [],
          "Feature Development & Integration": [],
          "System Debugging & Correction": [],
          "System QA": [
            "Unit / Compatibility / Performance / Stress / Load / Concurrent / Pacing / Response / Network Testing",
          ],
          "Bug Fixing and Final Adjustments": [],
          "Deploy the System": [],
        },
      },
      Evaluate: {
        tasks: {
          "Gather Target Users/Client": [],
          "Analyze User and Stakeholder Feedback": [],
          "Collect Feedback through Evaluation Methods": [],
          "Implement Revisions Based on Evaluation Results": [],
          "Final Defense Feedback Integration": [],
          "Manuscript Submission for AI & Plagiarism Check": [],
        },
      },
      "Discussion & Review": {
        tasks: {
          "Capstone Meeting": [],
          "Adviser Consultation": [],
          "Meeting with the User/Client": [],
          "Final Defense Preparation - System Testing Request Letter": [],
          "Final Defense Preparation - PowerPoint Presentation": [],
          "Final Defense Preparation - Mock Defense": [],
          "Final Defense Preparation - Manuscript Printing": [],
        },
      },
    },
  },
};

const methodologyList = Object.keys(METHODOLOGY_CONTENT_FINAL);
const getTypesFor = (m) =>
  m && METHODOLOGY_CONTENT_FINAL[m]
    ? Object.keys(METHODOLOGY_CONTENT_FINAL[m].types || {})
    : [];
const getTasksFor = (m, t) =>
  m && t && METHODOLOGY_CONTENT_FINAL[m]?.types?.[t]
    ? Object.keys(METHODOLOGY_CONTENT_FINAL[m].types[t].tasks)
    : [];
const getSubtasksFor = (m, t, task) =>
  m && t && task && METHODOLOGY_CONTENT_FINAL[m]?.types?.[t]?.tasks?.[task]
    ? METHODOLOGY_CONTENT_FINAL[m].types[t].tasks[task]
    : [];

/* ---------- small UI helpers ---------- */
const ModeSwitch = ({ mode, setMode }) => (
  <div className="inline-flex rounded-md border border-neutral-300 overflow-hidden">
    <button
      onClick={() => setMode("team")}
      className={`px-3 py-1.5 text-sm font-medium ${
        mode === "team" ? "text-white" : "text-neutral-700"
      }`}
      style={{ background: mode === "team" ? MAROON : "white" }}
    >
      Team
    </button>
    <button
      onClick={() => setMode("adviser")}
      className={`px-3 py-1.5 text-sm font-medium border-l border-neutral-300 ${
        mode === "adviser" ? "text-white" : "text-neutral-700"
      }`}
      style={{ background: mode === "adviser" ? MAROON : "white" }}
    >
      Adviser Tasks
    </button>
  </div>
);

const StatusBadge = ({ value }) => {
  const statusColors = {
    "To Do": "bg-[#D9A81E] text-white",
    "To Review": "bg-[#6FA8DC] text-white",
    "In Progress": "bg-[#7C9C3B] text-white",
    Completed: "bg-[#6A0F14] text-white",
  };
  if (!value || value === "--") return <span>--</span>;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium ${
        statusColors[value] || "bg-neutral-200"
      }`}
    >
      {value}
    </span>
  );
};

const RevisionSelect = ({ value, onChange, disabled }) => (
  <select
    className={`text-[12px] leading-tight font-medium border border-neutral-300 rounded-lg px-2.5 py-0.5 bg-white ${
      disabled ? "opacity-60 cursor-not-allowed" : ""
    }`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
  >
    <option>No Revision</option>
    <option>Revision 1</option>
    <option>Revision 2</option>
    <option>Revision 3</option>
  </select>
);

/* ---------- Attachment Helpers ---------- */
const slugifyName = (name = "") =>
  name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]/g, "_");

async function uploadToSupabase(file, { teamId = "no-team" } = {}) {
  const stamp = Date.now();
  const path = `finalDefense/${teamId}/${stamp}_${slugifyName(file.name)}`;

  const { error } = await supabase.storage
    .from(SUPABASE_ATTACH_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(SUPABASE_ATTACH_BUCKET)
    .getPublicUrl(path);

  return {
    provider: "supabase",
    bucket: SUPABASE_ATTACH_BUCKET,
    path,
    url: data?.publicUrl || "",
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
  };
}

async function uploadToFirebase(file, { teamId = "no-team" } = {}) {
  const storage = getStorage();
  const stamp = Date.now();
  const path = `${FIREBASE_ATTACH_ROOT}/${teamId}/${stamp}_${slugifyName(
    file.name
  )}`;
  const ref = storageRef(storage, path);
  await uploadBytes(ref, file);
  const url = await getDownloadURL(ref);
  return {
    provider: "firebase",
    path,
    url,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
  };
}

async function uploadAttachmentSmart(file, { teamId }) {
  if (ENABLE_SUPABASE) {
    try {
      return await uploadToSupabase(file, { teamId });
    } catch (_) {
      return await uploadToFirebase(file, { teamId });
    }
  }
  return await uploadToFirebase(file, { teamId });
}

/* ======= Edit/Create Task Dialog (PM sets Due Date/Time; prefill from Oral) ======= */
function EditTaskDialog({
  open,
  onClose,
  onSaved,
  pm,
  teams = [],
  members = [],
  seedMember,
  existingTask,
  mode,
  oralDefaults = {}, // { [teamId]: { dueDate, dueTime } }
}) {
  const [saving, setSaving] = useState(false);

  const [teamId, setTeamId] = useState("");
  const [phase, setPhase] = useState("Implementation");
  const [type, setType] = useState("");
  const [task, setTask] = useState("");
  const [subtask, setSubtask] = useState("");
  const [element, setElement] = useState("");
  const [due, setDue] = useState("");
  const [time, setTime] = useState("");
  const [pickedUid, setPickedUid] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [comment, setComment] = useState("");

  // attachments
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  // methodology
  const [methodology, setMethodology] = useState("Agile");

  const typesForM = React.useMemo(() => {
    const list = getTypesFor(methodology);
    return Array.isArray(list) ? list : [];
  }, [methodology]);
  const tasksForMT = useMemo(
    () => getTasksFor(methodology, type),
    [methodology, type]
  );
  const subtasksFor = useMemo(
    () => getSubtasksFor(methodology, type, task),
    [methodology, type, task]
  );

  useEffect(() => {
    if (!open) return;
    setTeamId(existingTask?.team?.id || teams[0]?.id || "");

    setMethodology(
      existingTask?.methodology &&
        existingTask.methodology !== "Inherited from Oral Defense"
        ? existingTask.methodology
        : "Agile"
    );

    if (existingTask) {
      setPhase(existingTask.phase || "Implementation");
      setType(existingTask.type || "");
      setTask(existingTask.task || "");
      setSubtask(existingTask.subtask || "");
      setElement(existingTask.element || "");
      setDue(existingTask.dueDate || "");
      setTime(existingTask.dueTime || "");
      setAssignees(
        (existingTask.assignees || []).map((a) => ({
          uid: a.uid,
          name: a.name,
        }))
      );
      setComment(existingTask.comment || "");
      setAttachments(
        Array.isArray(existingTask.attachments) ? existingTask.attachments : []
      );
    } else {
      setPhase("Implementation");
      setType("");
      setTask("");
      setSubtask("");
      setElement("");
      const initTeamId = teams[0]?.id || "";
      const defaults = oralDefaults[existingTask?.team?.id || initTeamId] || {};
      setDue(defaults.dueDate || "");
      setTime(defaults.dueTime || "");
      setAssignees(
        seedMember ? [{ uid: seedMember.uid, name: seedMember.name }] : []
      );
      setComment("");
      setAttachments([]);
    }
    setUploadErr("");
  }, [open, existingTask, seedMember, teams, oralDefaults]);

  // If creating and team changes, refresh the due/time from oral defaults
  useEffect(() => {
    if (!open || existingTask) return;
    const defaults = oralDefaults[teamId] || {};
    setDue(defaults.dueDate || "");
    setTime(defaults.dueTime || "");
  }, [teamId, open, existingTask, oralDefaults]);

  const canSave = teamId && phase && type && task && assignees.length > 0;

  const addAssignee = () => {
    if (!pickedUid) return;
    const found = members.find((m) => m.uid === pickedUid);
    if (!found) return;
    if (!assignees.some((a) => a.uid === pickedUid))
      setAssignees((arr) => [...arr, found]);
    setPickedUid("");
  };
  const removeAssignee = (uid) =>
    setAssignees((arr) => arr.filter((a) => a.uid !== uid));

  const handleAttachClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      setUploading(true);
      setUploadErr("");
      try {
        const uploaded = [];
        for (const f of files) {
          const meta = await uploadAttachmentSmart(f, {
            teamId: teamId || "no-team",
          });
          uploaded.push(meta);
        }
        setAttachments((prev) => [...prev, ...uploaded]);
      } catch (err) {
        setUploadErr(String(err?.message || err || "Upload failed"));
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const removeAttachment = (idx) => {
    setAttachments((list) => list.filter((_, i) => i !== idx));
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const team = teams.find((t) => t.id === teamId) || null;
      const taskManager = mode === "adviser" ? "Adviser" : "Project Manager";

      // compute dueAtMs from form
      const dueAtMs =
        due && (time || time === "")
          ? new Date(`${due}T${time || "00:00"}:00`).getTime()
          : null;

      const payload = {
        phase,
        type,
        task,
        subtask: subtask || "--",
        element: element || "--",
        // PM sets due/time now:
        dueDate: due || null,
        dueTime: time || null,
        dueAtMs,
        status: existingTask?.status || "To Do",
        revision: existingTask?.revision || "No Revision",
        assignees: assignees.map((a) => ({ uid: a.uid, name: a.name })),
        team: team ? { id: team.id, name: team.name } : null,
        comment: comment || "",
        createdBy: pm
          ? { uid: pm.uid, name: pm.name, role: "Project Manager" }
          : null,
        taskManager,
        methodology: existingTask?.methodology
          ? existingTask.methodology
          : methodology || "Agile",
        attachments: (attachments || []).map((a) => ({
          ...a,
          uploadedAt: serverTimestamp(),
        })),
      };

      if (existingTask?.id) {
        await updateDoc(doc(db, FINAL_TASKS_COLLECTION, existingTask.id), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, FINAL_TASKS_COLLECTION), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const phaseOptions =
    methodology && METHODOLOGY_CONTENT_FINAL[methodology]?.phases?.length
      ? METHODOLOGY_CONTENT_FINAL[methodology].phases
      : ["Implementation", "Testing", "Deployment", "Review"];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-6 overscroll-contain">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[980px]">
        <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col max-h-[85vh]">
          <div className="h-[2px] w-full" style={{ backgroundColor: MAROON }} />

          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <div
              className="flex items-center gap-2 text-[16px] font-semibold"
              style={{ color: MAROON }}
            >
              <span>●</span>
              <span>{existingTask ? "Edit Task" : "Create Task"}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 space-y-5">
            {/* Note: PM sets Due Date & Time; prefilled from Oral Defense */}
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              <b>Tip:</b> Due Date & Time are prefilled from the team’s{" "}
              <b>Oral Defense</b>. You can adjust them here if needed.
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Team
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Methodology (Final Defense)
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={methodology}
                  onChange={(e) => {
                    const m = e.target.value;
                    setMethodology(m);
                    setType("");
                    setTask("");
                    setSubtask("");
                  }}
                  disabled={!!existingTask}
                  title={
                    existingTask
                      ? "Preserved for existing tasks"
                      : "Select methodology template"
                  }
                >
                  {methodologyList.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Project Phase
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                >
                  {phaseOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Task Type
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={type || ""} // guard controlled value
                  onChange={(e) => {
                    setType(e.target.value);
                    setTask("");
                    setSubtask("");
                  }}
                >
                  <option value="">Select</option>
                  {(typesForM || []).map(
                    (
                      t // guard against undefined
                    ) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Task
                </label>
                <input
                  type="text"
                  list="fd-task-list"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={task}
                  onChange={(e) => {
                    setTask(e.target.value);
                    setSubtask("");
                  }}
                  placeholder="e.g., Polish: Chapter 4"
                />
                <datalist id="fd-task-list">
                  {tasksForMT.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div className="col-span-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Subtask
                </label>
                <input
                  type="text"
                  list="fd-subtask-list"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={subtask}
                  onChange={(e) => setSubtask(e.target.value)}
                  placeholder="e.g., Requirements Modeling - Context Diagram"
                />
                <datalist id="fd-subtask-list">
                  {subtasksFor.map((s, i) => (
                    <option key={`${s}-${i}`} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Element
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={element}
                  onChange={(e) => setElement(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Peopleware">Peopleware</option>
                </select>
              </div>

              {/* PM controls Due Date/Time (prefilled from Oral) */}
              <div className="col-span-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </div>
              <div className="col-span-4">
                <label className="block text sm font-medium text-neutral-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Assign + Comment + Attachments (unchanged) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Assign Members
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6A0F14]/30"
                  value={pickedUid}
                  onChange={(e) => setPickedUid(e.target.value)}
                >
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addAssignee}
                  disabled={!pickedUid}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                >
                  <PlusCircle className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {assignees.map((a) => (
                  <span
                    key={a.uid}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-neutral-100 border border-neutral-200"
                  >
                    {a.name}
                    <button
                      className="p-0.5 hover:bg-neutral-200 rounded-full"
                      onClick={() => removeAssignee(a.uid)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Leave Comment & Attachments:
              </label>
              <div className="rounded-xl border border-neutral-300 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="w-5 h-5 text-neutral-600" />
                    <span className="text-sm font-semibold text-neutral-800">
                      {pm?.name || "Project Manager"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAttachClick}
                    className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-100 text-sm"
                    title="Attach files (Supabase/Firebase)"
                  >
                    <Paperclip className="w-4 h-4" />
                    Attach
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    className="w-full resize-none px-3 py-2 text-sm outline-none"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                {(attachments?.length > 0 || uploading || uploadErr) && (
                  <div className="px-3 pb-3 space-y-2">
                    {uploading && (
                      <div className="text-sm text-neutral-600 inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading…
                      </div>
                    )}
                    {uploadErr && (
                      <div className="text-sm text-red-600">{uploadErr}</div>
                    )}
                    {attachments?.length > 0 && (
                      <div className="rounded-md border border-neutral-200 overflow-hidden">
                        <table className="w-full text-[12px]">
                          <thead className="bg-neutral-50 text-neutral-600">
                            <tr>
                              <th className="text-left px-2 py-1.5">File</th>
                              <th className="text-left px-2 py-1.5">
                                Provider
                              </th>
                              <th className="text-left px-2 py-1.5">Size</th>
                              <th className="px-2 py-1.5 w-16 text-right">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {attachments.map((a, i) => (
                              <tr key={`${a.url}-${i}`} className="border-t">
                                <td className="px-2 py-1.5">
                                  <a
                                    href={a.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[12px] underline text-blue-600 break-all"
                                  >
                                    {a.name}
                                  </a>
                                </td>
                                <td className="px-2 py-1.5">{a.provider}</td>
                                <td className="px-2 py-1.5">
                                  {typeof a.size === "number"
                                    ? `${(a.size / 1024).toFixed(1)} KB`
                                    : "--"}
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  <button
                                    onClick={() => removeAttachment(i)}
                                    className="text-xs px-2 py-0.5 rounded border border-neutral-300 hover:bg-neutral-50"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-neutral-300 text-sm hover:bg-neutral-100"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!canSave || saving}
              className="px-4 py-2 rounded-md text-sm text-white shadow disabled:opacity-50"
              style={{ backgroundColor: MAROON }}
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </span>
              ) : existingTask ? (
                "Save"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Main ============================ */
const FinalDefense = ({ onBack }) => {
  const handleBack = () =>
    typeof onBack === "function" ? onBack() : window.history.back();

  const [mode, setMode] = useState("team");
  const isTeam = mode === "team";
  const canEdit = mode === "adviser" || isTeam;

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [editingModal, setEditingModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingCell, setEditingCell] = useState(null);

  const pageSize = 10;

  const pmUid = auth.currentUser?.uid || localStorage.getItem("uid") || "";
  const [pmProfile, setPmProfile] = useState(null);

  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [oralTasks, setOralTasks] = useState([]);
  const [finalTasks, setFinalTasks] = useState([]);
  const [teamOralStatus, setTeamOralStatus] = useState({});

  /* PM profile */
  useEffect(() => {
    if (!pmUid) return;
    const unsub = onSnapshot(
      query(collection(db, "users"), where("uid", "==", pmUid)),
      (snap) => {
        const d = snap.docs[0]?.data();
        if (!d) return;
        const name = [d.firstName, d.middleName, d.lastName]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        setPmProfile({ uid: pmUid, name: name || "Project Manager" });
      }
    );
    return () => unsub && unsub();
  }, [pmUid]);

  /* Teams + members of this PM */
  useEffect(() => {
    if (!pmUid) return;
    const unsubTeams = onSnapshot(
      query(collection(db, "teams"), where("manager.uid", "==", pmUid)),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTeams(rows);

        const memberUids = Array.from(
          new Set(rows.flatMap((t) => t.memberUids || []))
        );
        if (memberUids.length === 0) return setMembers([]);

        const chunks = [];
        for (let i = 0; i < memberUids.length; i += 10)
          chunks.push(memberUids.slice(i, i + 10));
        const unsubs = chunks.map((uids) =>
          onSnapshot(
            query(collection(db, "users"), where("uid", "in", uids)),
            (s) => {
              const list = s.docs.map((x) => {
                const d = x.data();
                const name = [d.firstName, d.middleName, d.lastName]
                  .filter(Boolean)
                  .join(" ")
                  .replace(/\s+/g, " ")
                  .trim();
                return { uid: d.uid || x.id, name };
              });
              setMembers((prev) => {
                const map = new Map(prev.map((m) => [m.uid, m]));
                list.forEach((m) => map.set(m.uid, m));
                return Array.from(map.values()).filter((m) =>
                  memberUids.includes(m.uid)
                );
              });
            }
          )
        );
        return () => unsubs.forEach((u) => u && u());
      }
    );
    return () => unsubTeams && unsubTeams();
  }, [pmUid]);

  /* Oral Defense Tasks */
  useEffect(() => {
    if (!pmUid) return;
    const qRef = query(
      collection(db, ORAL_TASKS_COLLECTION),
      where("createdBy.uid", "==", pmUid)
    );
    const unsub = onSnapshot(qRef, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOralTasks(list);
    });
    return () => unsub && unsub();
  }, [pmUid]);

  /* Final Defense Tasks */
  useEffect(() => {
    if (!pmUid) return;
    const qRef = query(
      collection(db, FINAL_TASKS_COLLECTION),
      where("createdBy.uid", "==", pmUid)
    );
    const unsub = onSnapshot(qRef, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTs = a?.updatedAt?.toDate?.() ?? a?.createdAt?.toDate?.() ?? 0;
          const bTs = b?.updatedAt?.toDate?.() ?? b?.createdAt?.toDate?.() ?? 0;
          return bTs - aTs;
        });

      setFinalTasks(list);
      setSelected(new Set());
      setPage(1);
    });
    return () => unsub && unsub();
  }, [pmUid]);

  /* Oral Defense completion status per team (unchanged) */
  useEffect(() => {
    const status = {};
    teams.forEach((team) => {
      const teamOralTasks = oralTasks.filter(
        (task) => task.team?.id === team.id
      );

      if (teamOralTasks.length === 0) {
        status[team.id] = {
          canCreate: false,
          reason: "No Oral Defense tasks found",
          completed: 0,
          total: 0,
        };
        return;
      }

      const completedTasks = teamOralTasks.filter(
        (task) => task.status === "Completed"
      );
      const allCompleted = completedTasks.length === teamOralTasks.length;

      const now = new Date();
      const allPastDue = teamOralTasks.every((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < now;
        // NOTE: gating logic retained; your guard comment stays below.
      });

      status[team.id] = {
        canCreate: allCompleted && allPastDue,
        reason: allCompleted
          ? allPastDue
            ? "Ready for Final Defense"
            : "Waiting for due dates to pass"
          : "Oral Defense tasks not completed",
        completed: completedTasks.length,
        total: teamOralTasks.length,
      };
    });

    setTeamOralStatus(status);
  }, [teams, oralTasks]);

  /* Precompute Oral defaults (latest due per team) */
  const oralDefaultsByTeam = useMemo(() => {
    const map = {};
    teams.forEach((team) => {
      const teamOral = oralTasks.filter((t) => t.team?.id === team.id);
      let best = null;
      teamOral.forEach((t) => {
        const ms =
          typeof t.dueAtMs === "number"
            ? t.dueAtMs
            : t.dueDate
            ? new Date(`${t.dueDate}T${t.dueTime || "00:00"}:00`).getTime()
            : null;
        if (ms && (!best || ms > best.ms)) {
          best = {
            ms,
            dueDate: t.dueDate || new Date(ms).toISOString().slice(0, 10),
            dueTime:
              typeof t.dueTime === "string" && t.dueTime.length
                ? t.dueTime
                : "",
          };
        }
      });
      if (best) map[team.id] = { dueDate: best.dueDate, dueTime: best.dueTime };
    });
    return map;
  }, [teams, oralTasks]);

  const canCreateFinalDefense = useMemo(() => {
    return Object.values(teamOralStatus).some((status) => status.canCreate);
  }, [teamOralStatus]);

  /* ---------- Rows for Team tab (per-member) ---------- */
  const rows = useMemo(() => {
    const out = [];
    const seenMemberUids = new Set();

    const teamTasks = finalTasks.filter(
      (t) => t.taskManager === "Project Manager"
    );

    for (const t of teamTasks) {
      const assignees =
        t.assignees && t.assignees.length
          ? t.assignees
          : [{ uid: "", name: "Team" }];
      assignees.forEach((a, idx) => {
        if (a.uid) seenMemberUids.add(a.uid);
        out.push({
          key: `${t.id}:${a.uid || idx}`,
          taskId: t.id,
          memberUid: a.uid || "",
          memberName: a.name || "Team",
          methodology: t?.methodology || "Inherited from Oral Defense",
          phase: t?.phase || "--",
          type: t?.type || "--",
          task: t?.task || "--",
          subtask: t?.subtask || "--",
          element: t?.element || "--",
          created: t?.createdAt?.toDate?.()?.toLocaleDateString?.() || "--",
          due: t?.dueDate || "--",
          time: t?.dueTime || "--",
          revision: t?.revision || "No Revision",
          status: t?.status || "To Do",
          existingTask: t,
          teamId: t?.team?.id || null,
          teamName: t?.team?.name || "No Team",
        });
      });
    }

    members.forEach((m, idx) => {
      if (!seenMemberUids.has(m.uid)) {
        out.push({
          key: `placeholder:${m.uid || idx}`,
          taskId: null,
          memberUid: m.uid,
          memberName: m.name,
          methodology: "Inherited from Oral Defense",
          phase: "--",
          type: "--",
          task: "--",
          subtask: "--",
          element: "--",
          created: "--",
          due: "--",
          time: "--",
          revision: "--",
          status: "--",
          existingTask: null,
          teamId: teams[0]?.id ?? null,
          teamName: teams[0]?.name ?? "No Team",
        });
      }
    });

    return out;
  }, [finalTasks, members, teams]);

  /* ---------- Rows for Adviser tab ---------- */
  const adviserRows = useMemo(() => {
    const adviserTasks = finalTasks.filter((t) => t.taskManager === "Adviser");
    return adviserTasks.map((t, idx) => ({
      key: t.id,
      taskId: t.id,
      memberUid: "",
      memberName: "Team",
      methodology: t?.methodology || "Inherited from Oral Defense",
      phase: t?.phase || "--",
      type: t?.type || "--",
      task: t?.task || "--",
      subtask: t?.subtask || "--",
      element: t?.element || "--",
      created: t?.createdAt?.toDate?.()?.toLocaleDateString?.() || "--",
      due: t?.dueDate || "--",
      time: t?.dueTime || "--",
      revision: t?.revision || "No Revision",
      status: t?.status || "To Do",
      existingTask: t,
      teamId: t?.team?.id || `no-team-${idx}`,
      teamName: t?.team?.name || "No Team",
    }));
  }, [finalTasks]);

  /* Search + paging */
  const [qLocal, setQLocal] = useState("");
  useEffect(() => setQLocal(q.trim().toLowerCase()), [q]);

  const baseRows = isTeam ? rows : adviserRows;

  const filtered = useMemo(() => {
    if (!qLocal) return baseRows;
    return baseRows.filter(
      (r) =>
        (r.memberName || "").toLowerCase().includes(qLocal) ||
        (r.teamName || "").toLowerCase().includes(qLocal) ||
        (r.methodology || "").toLowerCase().includes(qLocal) ||
        (r.phase || "").toLowerCase().includes(qLocal) ||
        (r.type || "").toLowerCase().includes(qLocal) ||
        (r.task || "").toLowerCase().includes(qLocal) ||
        (r.subtask || "").toLowerCase().includes(qLocal) ||
        (r.element || "").toLowerCase().includes(qLocal) ||
        (r.created || "").toLowerCase().includes(qLocal) ||
        (r.due || "").toLowerCase().includes(qLocal) ||
        (r.time || "").toLowerCase().includes(qLocal) ||
        String(r.revision || "")
          .toLowerCase()
          .includes(qLocal) ||
        String(r.status || "")
          .toLowerCase()
          .includes(qLocal)
    );
  }, [qLocal, baseRows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ---------- Update helpers ---------- */
  const updateTaskRow = async (row, patch) => {
    if (row.taskId) {
      await updateDoc(doc(db, FINAL_TASKS_COLLECTION, row.taskId), {
        ...patch,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    const base = {
      status: "To Do",
      revision: "No Revision",
      methodology: "Inherited from Oral Defense",
      createdBy: pmProfile
        ? { uid: pmProfile.uid, name: pmProfile.name, role: "Project Manager" }
        : null,
      assignees: row.memberUid
        ? [{ uid: row.memberUid, name: row.memberName }]
        : [],
      team:
        row.teamId && row.teamName
          ? { id: row.teamId, name: row.teamName }
          : teams[0]
          ? { id: teams[0].id, name: teams[0].name }
          : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await addDoc(collection(db, FINAL_TASKS_COLLECTION), { ...base, ...patch });
  };

  const startEdit = (row, field) => {
    if (!canEdit) return;
    const editingDueOrTime = field === "due" || field === "time";
    if (!isTeam && editingDueOrTime) return;
    setEditingCell({ key: row.key, field });
  };
  const stopEdit = () => setEditingCell(null);

  const savePhase = async (row, newPhase) => {
    await updateTaskRow(row, { phase: newPhase || null });
    stopEdit();
  };
  const saveType = async (row, newType) => {
    await updateTaskRow(row, { type: newType || null });
    stopEdit();
  };
  const saveTask = async (row, newTask) => {
    await updateTaskRow(row, { task: newTask || null });
    stopEdit();
  };
  const saveSubtask = async (row, newSubtask) => {
    await updateTaskRow(row, { subtask: newSubtask || null });
    stopEdit();
  };
  const saveElement = async (row, newElement) => {
    await updateTaskRow(row, { element: newElement || null });
    stopEdit();
  };
  const saveRevision = async (row, newRev) => {
    await updateTaskRow(row, { revision: newRev || "No Revision" });
  };
  const saveStatus = async (row, newStatus) => {
    await updateTaskRow(row, { status: newStatus || "To Do" });
  };
  const saveDue = async (row, newDate) => {
    const hasTime = row.time && row.time !== "--";
    const dueAtMs =
      newDate && hasTime
        ? new Date(`${newDate}T${row.time}:00`).getTime()
        : newDate
        ? new Date(`${newDate}T00:00:00`).getTime()
        : null;
    await updateTaskRow(row, {
      dueDate: newDate || null,
      dueAtMs,
      ...(newDate ? {} : { dueTime: null }),
    });
    stopEdit();
  };
  const saveTime = async (row, newTime) => {
    const dueAtMs =
      row.due && row.due !== "--" && (newTime || newTime === "")
        ? new Date(`${row.due}T${newTime || "00:00"}:00`).getTime()
        : null;
    await updateTaskRow(row, { dueTime: newTime || null, dueAtMs });
    stopEdit();
  };

  const deleteTask = async (taskId) => {
    setDeletingId(taskId);
    try {
      await deleteDoc(doc(db, FINAL_TASKS_COLLECTION, taskId));
    } finally {
      setDeletingId(null);
    }
  };

  const deleteSelectedRows = async () => {
    if (!canEdit || selected.size === 0) return;
    const toDelete = pageRows
      .filter((r) => selected.has(r.key) && r.taskId)
      .map((r) => r.taskId);
    for (const id of toDelete) {
      await deleteTask(id);
    }
    setSelected(new Set());
  };

  const openModalEditor = (row) => {
    setEditingModal({
      seedMember: row.memberUid
        ? { uid: row.memberUid, name: row.memberName }
        : null,
      existingTask: row.taskId ? { ...row.existingTask, id: row.taskId } : null,
    });
  };
  const openModalCreate = (row) => {
    setEditingModal({
      seedMember: row?.memberUid
        ? { uid: row.memberUid, name: row.memberName }
        : null,
      existingTask: null,
    });
  };

  const handleCreateClick = () => {
    const anyReady = Object.values(teamOralStatus).some((s) => s.canCreate);
    /*if (!anyReady) {
      alert(
        "Cannot create Final Defense tasks until Oral Defense is completed and due dates have passed for at least one team."
      );
      return;
    }*/

    if (isTeam) {
      const selectedKey = Array.from(selected)[0] || null;
      let seedRow =
        (selectedKey && filtered.find((r) => r.key === selectedKey)) ||
        filtered.find((r) => r.memberUid);
      if (!seedRow) {
        alert("Select a member row first to create a task for.");
        return;
      }
      openModalCreate(seedRow);
    } else {
      openModalCreate(null);
    }
  };

  const adviserGroups = useMemo(() => {
    if (isTeam) return null;
    const groups = new Map();
    for (const r of pageRows) {
      const key = r.teamId || "no-team";
      if (!groups.has(key))
        groups.set(key, {
          teamId: key,
          teamName: r.teamName || "No Team",
          rows: [],
        });
      groups.get(key).rows.push(r);
    }
    return Array.from(groups.values());
  }, [isTeam, pageRows]);

  return (
    <div className="space-y-4">
      {!Object.values(teamOralStatus).some((s) => s.canCreate) && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-800">
              Oral Defense Completion Required
            </span>
          </div>
          <div className="mt-2 text-sm text-amber-700">
            Final Defense tasks can only be created when:
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>All Oral Defense tasks are completed</li>
              <li>All Oral Defense due dates have passed</li>
            </ul>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teams.map((team) => {
                const status = teamOralStatus[team.id] || {
                  completed: 0,
                  total: 0,
                  reason: "No tasks",
                };
                return (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <span className="text-sm font-medium">{team.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-600">
                        {status.completed}/{status.total}
                      </span>
                      {status.canCreate ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* top bar */}
      <div className="flex items-center justify-between gap-3 flex-nowrap">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-100 cursor-pointer"
            title="Back to Tasks"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Tasks
          </button>

          <ModeSwitch mode={mode} setMode={setMode} />

          <button
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow ${
              !Object.values(teamOralStatus).some((s) => s.canCreate)
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
            style={{ background: MAROON }}
            onClick={handleCreateClick}
            disabled={!Object.values(teamOralStatus).some((s) => s.canCreate)}
          >
            + Create Task
          </button>

          <div className="w-[360px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={deleteSelectedRows}
            disabled={!canEdit}
            className={`inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50 ${
              !canEdit ? "opacity-60 cursor-not-allowed" : ""
            }`}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
            title="Filter"
            onClick={() => alert("Open Filter panel")}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* table container */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] leading-tight whitespace-nowrap">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2 pl-6 pr-3 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (!canEdit) return;
                      if (e.target.checked)
                        setSelected(new Set(pageRows.map((r) => r.key)));
                      else setSelected(new Set());
                    }}
                    checked={
                      pageRows.length > 0 &&
                      pageRows.every((r) => selected.has(r.key))
                    }
                    disabled={!canEdit}
                  />
                </th>
                <th className="py-2 pr-3 w-16">NO</th>
                <th className="py-2 pr-3">{isTeam ? "Assigned" : "Team"}</th>
                <th className="py-2 pr-3">Task Type</th>
                <th className="py-2 pr-3">Task</th>
                <th className="py-2 pr-3">Subtask</th>
                <th className="py-2 pr-3">Element</th>
                <th className="py-2 pr-3">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Date Created
                  </div>
                </th>
                <th className="py-2 pr-3">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Due Date
                  </div>
                </th>
                <th className="py-2 pr-3">
                  <div className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Time
                  </div>
                </th>
                <th className="py-2 pr-3">Revision NO</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Methodology</th>
                <th className="py-2 pr-6">Project Phase</th>
              </tr>
            </thead>

            <tbody>
              {/* Adviser tab grouping (unchanged UI behavior) */}
              {!isTeam &&
                (function renderAdviser() {
                  const groups = (() => {
                    const m = new Map();
                    for (const r of pageRows) {
                      const key = r.teamId || "no-team";
                      if (!m.has(key))
                        m.set(key, {
                          teamId: key,
                          teamName: r.teamName || "No Team",
                          rows: [],
                        });
                      m.get(key).rows.push(r);
                    }
                    return Array.from(m.values());
                  })();

                  return groups.map((g, gIdx) => (
                    <React.Fragment key={g.teamId || `group-${gIdx}`}>
                      <tr className="bg-neutral-50/60">
                        <td
                          colSpan={14}
                          className="py-2 pl-6 pr-3 text-[13px] font-semibold text-neutral-800"
                        >
                          Team: {g.teamName}
                        </td>
                      </tr>
                      {g.rows.map((r, idx) => {
                        const isEditing = (field) =>
                          editingCell?.key === r.key &&
                          editingCell?.field === field;

                        return (
                          <tr
                            key={r.key}
                            className="border-t border-neutral-200"
                          >
                            <td className="py-2 pl-6 pr-3">
                              <input
                                type="checkbox"
                                checked={selected.has(r.key)}
                                onChange={() => {
                                  if (!canEdit) return;
                                  const s = new Set(selected);
                                  s.has(r.key) ? s.delete(r.key) : s.add(r.key);
                                  setSelected(s);
                                }}
                                disabled={!canEdit}
                              />
                            </td>
                            <td className="py-2 pr-3">
                              {(page - 1) * pageSize + idx + 1}.
                            </td>
                            <td className="py-2 pr-3">{g.teamName}</td>

                            <td className="py-2 pr-3">
                              {isEditing("type") ? (
                                <select
                                  autoFocus
                                  className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                                  defaultValue={r.type === "--" ? "" : r.type}
                                  onBlur={(e) => {
                                    updateTaskRow(r, {
                                      type: e.target.value || null,
                                    });
                                    stopEdit();
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      e.currentTarget.blur();
                                    if (e.key === "Escape") stopEdit();
                                  }}
                                >
                                  <option value="">--</option>
                                  {Object.keys(
                                    METHODOLOGY_CONTENT_FINAL
                                  ).flatMap((m) =>
                                    getTypesFor(m).map((t) => (
                                      <option key={`${m}-${t}`} value={t}>
                                        {t}
                                      </option>
                                    ))
                                  )}
                                </select>
                              ) : (
                                <span
                                  className="cursor-text"
                                  onDoubleClick={() =>
                                    canEdit &&
                                    setEditingCell({
                                      key: r.key,
                                      field: "type",
                                    })
                                  }
                                >
                                  {r.type}
                                </span>
                              )}
                            </td>

                            <td className="py-2 pr-3">
                              {isEditing("task") ? (
                                <input
                                  autoFocus
                                  type="text"
                                  className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                                  defaultValue={r.task === "--" ? "" : r.task}
                                  onBlur={(e) =>
                                    updateTaskRow(r, {
                                      task: e.target.value || null,
                                    }).then(stopEdit)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      e.currentTarget.blur();
                                    if (e.key === "Escape") stopEdit();
                                  }}
                                  list="table-task-suggest"
                                />
                              ) : (
                                <span
                                  className="cursor-text"
                                  onDoubleClick={() =>
                                    canEdit &&
                                    setEditingCell({
                                      key: r.key,
                                      field: "task",
                                    })
                                  }
                                >
                                  {r.task}
                                </span>
                              )}
                            </td>

                            <td className="py-2 pr-3">
                              {isEditing("subtask") ? (
                                <input
                                  autoFocus
                                  type="text"
                                  className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                                  defaultValue={
                                    r.subtask === "--" ? "" : r.subtask
                                  }
                                  onBlur={(e) =>
                                    updateTaskRow(r, {
                                      subtask: e.target.value || null,
                                    }).then(stopEdit)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      e.currentTarget.blur();
                                    if (e.key === "Escape") stopEdit();
                                  }}
                                  list="table-subtask-suggest"
                                />
                              ) : (
                                <span
                                  className="cursor-text"
                                  onDoubleClick={() =>
                                    canEdit &&
                                    setEditingCell({
                                      key: r.key,
                                      field: "subtask",
                                    })
                                  }
                                >
                                  {r.subtask}
                                </span>
                              )}
                            </td>

                            <td className="py-2 pr-3">
                              {isEditing("element") ? (
                                <select
                                  autoFocus
                                  className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                                  defaultValue={
                                    r.element === "--" ? "" : r.element
                                  }
                                  onBlur={(e) =>
                                    updateTaskRow(r, {
                                      element: e.target.value || null,
                                    }).then(stopEdit)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      e.currentTarget.blur();
                                    if (e.key === "Escape") stopEdit();
                                  }}
                                >
                                  <option value="">--</option>
                                  <option value="Hardware">Hardware</option>
                                  <option value="Software">Software</option>
                                  <option value="Peopleware">Peopleware</option>
                                </select>
                              ) : (
                                <span
                                  className="cursor-text"
                                  onDoubleClick={() =>
                                    canEdit &&
                                    setEditingCell({
                                      key: r.key,
                                      field: "element",
                                    })
                                  }
                                >
                                  {r.element}
                                </span>
                              )}
                            </td>

                            <td className="py-2 pr-3">{r.created}</td>

                            {/* Show due/time but keep read-only in Adviser tab */}
                            <td className="py-2 pr-3">
                              <span className="text-neutral-700">{r.due}</span>
                            </td>
                            <td className="py-2 pr-3">
                              <span className="text-neutral-700">{r.time}</span>
                            </td>

                            <td className="py-2 pr-3">
                              <RevisionSelect
                                value={r.revision}
                                onChange={() => {}}
                                disabled
                              />
                            </td>

                            <td className="py-2 pr-3">
                              <StatusBadge value={r.status} />
                            </td>

                            <td className="py-2 pr-3">{r.methodology}</td>

                            <td className="py-2 pr-6">
                              {isEditing("phase") ? (
                                <select
                                  autoFocus
                                  className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                                  defaultValue={r.phase === "--" ? "" : r.phase}
                                  onBlur={(e) =>
                                    updateTaskRow(r, {
                                      phase: e.target.value || null,
                                    }).then(stopEdit)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      e.currentTarget.blur();
                                    if (e.key === "Escape") stopEdit();
                                  }}
                                >
                                  <option value="">--</option>
                                  {Object.keys(
                                    METHODOLOGY_CONTENT_FINAL
                                  ).flatMap((m) =>
                                    (
                                      METHODOLOGY_CONTENT_FINAL[m].phases || []
                                    ).map((p) => (
                                      <option key={`${m}-${p}`} value={p}>
                                        {p}
                                      </option>
                                    ))
                                  )}
                                </select>
                              ) : (
                                <span
                                  className="cursor-text"
                                  onDoubleClick={() =>
                                    canEdit &&
                                    setEditingCell({
                                      key: r.key,
                                      field: "phase",
                                    })
                                  }
                                >
                                  {r.phase}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ));
                })()}

              {/* Team tab (inline due/time editable) */}
              {isTeam &&
                pageRows.map((r, idx) => {
                  const isEditing = (field) =>
                    editingCell?.key === r.key && editingCell?.field === field;

                  return (
                    <tr key={r.key} className="border-t border-neutral-200">
                      <td className="py-2 pl-6 pr-3">
                        <input
                          type="checkbox"
                          checked={selected.has(r.key)}
                          onChange={() => {
                            if (!canEdit) return;
                            const s = new Set(selected);
                            s.has(r.key) ? s.delete(r.key) : s.add(r.key);
                            setSelected(s);
                          }}
                          disabled={!canEdit}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        {(page - 1) * pageSize + idx + 1}.
                      </td>
                      <td className="py-2 pr-3">{r.memberName}</td>

                      <td className="py-2 pr-3">
                        {isEditing("type") ? (
                          <select
                            autoFocus
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            defaultValue={r.type === "--" ? "" : r.type}
                            onBlur={(e) => {
                              updateTaskRow(r, {
                                type: e.target.value || null,
                              });
                              stopEdit();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                          >
                            <option value="">--</option>
                            {Object.keys(METHODOLOGY_CONTENT_FINAL).flatMap(
                              (m) =>
                                getTypesFor(m).map((t) => (
                                  <option key={`${m}-${t}`} value={t}>
                                    {t}
                                  </option>
                                ))
                            )}
                          </select>
                        ) : (
                          <span
                            className="cursor-text"
                            onDoubleClick={() =>
                              canEdit &&
                              setEditingCell({ key: r.key, field: "type" })
                            }
                          >
                            {r.type}
                          </span>
                        )}
                      </td>

                      <td className="py-2 pr-3">
                        {isEditing("task") ? (
                          <input
                            autoFocus
                            type="text"
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            defaultValue={r.task === "--" ? "" : r.task}
                            onBlur={(e) =>
                              updateTaskRow(r, {
                                task: e.target.value || null,
                              }).then(stopEdit)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                            list="table-task-suggest"
                          />
                        ) : (
                          <span
                            className="cursor-text"
                            onDoubleClick={() =>
                              canEdit &&
                              setEditingCell({ key: r.key, field: "task" })
                            }
                          >
                            {r.task}
                          </span>
                        )}
                      </td>

                      <td className="py-2 pr-3">
                        {isEditing("subtask") ? (
                          <input
                            autoFocus
                            type="text"
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            defaultValue={r.subtask === "--" ? "" : r.subtask}
                            onBlur={(e) =>
                              updateTaskRow(r, {
                                subtask: e.target.value || null,
                              }).then(stopEdit)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                            list="table-subtask-suggest"
                          />
                        ) : (
                          <span
                            className="cursor-text"
                            onDoubleClick={() =>
                              canEdit &&
                              setEditingCell({ key: r.key, field: "subtask" })
                            }
                          >
                            {r.subtask}
                          </span>
                        )}
                      </td>

                      <td className="py-2 pr-3">
                        {isEditing("element") ? (
                          <select
                            autoFocus
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            defaultValue={r.element === "--" ? "" : r.element}
                            onBlur={(e) => saveElement(r, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                          >
                            <option value="">--</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Software">Software</option>
                            <option value="Peopleware">Peopleware</option>
                          </select>
                        ) : (
                          <span
                            className="cursor-text"
                            onDoubleClick={() =>
                              canEdit &&
                              setEditingCell({ key: r.key, field: "element" })
                            }
                          >
                            {r.element}
                          </span>
                        )}
                      </td>

                      <td className="py-2 pr-3">{r.created}</td>

                      <td className="py-2 pr-3">
                        {isEditing("due") ? (
                          <input
                            autoFocus
                            type="date"
                            defaultValue={r.due === "--" ? "" : r.due}
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            onBlur={(e) => saveDue(r, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                          />
                        ) : (
                          <span
                            className="cursor-text"
                            onDoubleClick={() =>
                              isTeam &&
                              setEditingCell({ key: r.key, field: "due" })
                            }
                          >
                            {r.due}
                          </span>
                        )}
                      </td>

                      <td className="py-2 pr-3">
                        {isEditing("time") ? (
                          <input
                            autoFocus
                            type="time"
                            defaultValue={r.time === "--" ? "" : r.time}
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            onBlur={(e) => saveTime(r, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                          />
                        ) : (
                          <span
                            className="cursor-text"
                            onDoubleClick={() =>
                              isTeam &&
                              setEditingCell({ key: r.key, field: "time" })
                            }
                          >
                            {r.time}
                          </span>
                        )}
                      </td>

                      <td className="py-2 pr-3">
                        <RevisionSelect
                          value={r.revision}
                          onChange={() => {}}
                          disabled
                        />
                      </td>

                      <td className="py-2 pr-3">
                        {isTeam ? (
                          <select
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            defaultValue={r.status}
                            onChange={(e) => saveStatus(r, e.target.value)}
                          >
                            {[
                              "To Do",
                              "In Progress",
                              "To Review",
                              "Completed",
                            ].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge value={r.status} />
                        )}
                      </td>

                      <td className="py-2 pr-3">{r.methodology}</td>

                      <td className="py-2 pr-6">
                        {isEditing("phase") ? (
                          <select
                            autoFocus
                            className="rounded-md border border-neutral-300 px-2 py-1 text-sm"
                            defaultValue={r.phase === "--" ? "" : r.phase}
                            onBlur={(e) => savePhase(r, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              if (e.key === "Escape") stopEdit();
                            }}
                          >
                            <option value="">--</option>
                            {Object.keys(METHODOLOGY_CONTENT_FINAL).flatMap(
                              (m) =>
                                (METHODOLOGY_CONTENT_FINAL[m].phases || []).map(
                                  (p) => (
                                    <option key={`${m}-${p}`} value={p}>
                                      {p}
                                    </option>
                                  )
                                )
                            )}
                          </select>
                        ) : (
                          <span
                            className="cursor-text"
                            onDoubleClick={() =>
                              canEdit &&
                              setEditingCell({ key: r.key, field: "phase" })
                            }
                          >
                            {r.phase}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={14}
                    className="py-10 text-center text-neutral-500"
                  >
                    No {isTeam ? "members" : "tasks"} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* suggestions lists for inline edit */}
          <datalist id="table-task-suggest">
            {Object.keys(METHODOLOGY_CONTENT_FINAL).flatMap((m) =>
              getTypesFor(m).flatMap((t) =>
                getTasksFor(m, t).map((task) => (
                  <option key={`${m}-${t}-${task}`} value={task} />
                ))
              )
            )}
          </datalist>

          <datalist id="table-subtask-suggest">
            {Object.keys(METHODOLOGY_CONTENT_FINAL).flatMap((m) =>
              getTypesFor(m).flatMap((t) =>
                getTasksFor(m, t).flatMap((task) =>
                  getSubtasksFor(m, t, task).map((s, i) => (
                    <option key={`${m}-${t}-${task}-${i}`} value={s} />
                  ))
                )
              )
            )}
          </datalist>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-end gap-2 px-4 py-3">
          <button
            className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-50 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <EditTaskDialog
        open={!!editingModal}
        onClose={() => setEditingModal(null)}
        onSaved={() => setEditingModal(null)}
        pm={pmProfile || { uid: pmUid, name: "Project Manager" }}
        teams={teams}
        members={members}
        seedMember={editingModal?.seedMember || null}
        existingTask={editingModal?.existingTask || null}
        mode={mode}
        oralDefaults={oralDefaultsByTeam} // << prefill from Oral Defense
      />
    </div>
  );
};

export default FinalDefense;
