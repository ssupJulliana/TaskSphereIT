import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage.jsx";

// Instructor
import InstructorLayout from "./components/CapstoneInstructor/InstructorLayout.jsx";
import InstructorDashboard from "./components/CapstoneInstructor/InstructorDashboard.jsx";
import InstructorEnroll from "./components/CapstoneInstructor/InstructorEnroll.jsx";
import InstructorTeams from "./components/CapstoneInstructor/InstructorTeams.jsx";

// Adviser
import AdviserLayout from "./components/CapstoneAdviser/AdviserLayout.jsx";
import AdviserDashboard from "./components/CapstoneAdviser/AdviserDashboard.jsx";
import Tasks from "./components/CapstoneAdviser/Tasks.jsx";
import TaskRecord from "./components/CapstoneAdviser/TaskRecord.jsx";
import TeamsBoard from "./components/CapstoneAdviser/TeamsBoard.jsx";
import TeamsSummary from "./components/CapstoneAdviser/TeamsSummary.jsx";
import Events from "./components/CapstoneAdviser/Events.jsx";
import Notes from "./components/CapstoneAdviser/Notes.jsx";
import Notifications from "./components/CapstoneAdviser/Notifications.jsx";
import Profile from "./components/CapstoneAdviser/Profile.jsx";

export default function App() {
  return (
    <div className="min-h-screen font-sans">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Instructor section */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="enroll" element={<InstructorEnroll />} />
          <Route path="teams" element={<InstructorTeams />} />
        </Route>

        {/* Adviser section */}
        <Route path="/adviser" element={<AdviserLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdviserDashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="task-record" element={<TaskRecord />} />
          <Route path="teams-board" element={<TeamsBoard />} />
          <Route path="teams-summary" element={<TeamsSummary />} />
          <Route path="events" element={<Events />} />
          <Route path="notes" element={<Notes />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
