import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage.jsx";
import InstructorLayout from "./components/CapstoneInstructor/InstructorLayout.jsx";
import InstructorDashboard from "./components/CapstoneInstructor/InstructorDashboard.jsx";
import InstructorEnroll from "./components/CapstoneInstructor/InstructorEnroll.jsx";
import InstructorTeams from "./components/CapstoneInstructor/InstructorTeams.jsx";
// Placeholder imports for the member pages
import MemberLayout from "./components/CapstoneMember/MemberLayout.jsx";
import MemberDashboard from "./components/CapstoneMember/MemberDashboard.jsx";
import MemberTasks from "./components/CapstoneMember/MemberTasks.jsx";
import MemberAdviserTasks from "./components/CapstoneMember/MemberAdviserTasks.jsx";
import MembersTasksBoard from "./components/CapstoneMember/MemberTasksBoard.jsx";
import MembersTasksRecord from "./components/CapstoneMember/MemberTasksRecord.jsx";
import MemberEvents from "./components/CapstoneMember/MemberEvents.jsx";
// import other member pages when created, e.g., MemberTasks, MemberAdviserTasks, etc.

export default function App() {
  return (
    <div className="min-h-screen font-sans">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Instructor layout with nested pages */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="enroll" element={<InstructorEnroll />} />
          <Route path="teams" element={<InstructorTeams />} />
        </Route>

        {/* Member layout with nested pages */}
        <Route path="/member" element={<MemberLayout />}>
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="tasks" element={<MemberTasks />} />
          <Route path="adviser-tasks" element={<MemberAdviserTasks />} />
          <Route path="tasks-board" element={<MembersTasksBoard />} />
          <Route path="tasks-record" element={<MembersTasksRecord />} />
          <Route path="events" element={<MemberEvents />} />
          {/* Add other routes for member pages here once they are created */}
          {/* Example: */}
          {/* <Route path="tasks" element={<MemberTasks />} /> */}
        </Route>
      </Routes>
    </div>
  );
}
