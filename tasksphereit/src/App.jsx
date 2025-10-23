import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage.jsx";

// Instructor
import InstructorLayout from "./components/CapstoneInstructor/InstructorLayout.jsx";
import InstructorDashboard from "./components/CapstoneInstructor/InstructorDashboard.jsx";
import InstructorEnroll from "./components/CapstoneInstructor/InstructorEnroll.jsx";
import InstructorTeams from "./components/CapstoneInstructor/InstructorTeams.jsx";


export default function App() {
  return (
    <div className="min-h-screen font-sans">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        {/* add other routes later… */}

        
        {/* Instructor layout with nested pages */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="enroll" element={<InstructorEnroll />} />
          <Route path="teams" element={<InstructorTeams />} />
          <Route path="schedule" element={<InstructorSchedule />} />
          <Route path="schedule/title-defense" element={<TitleDefense />} />
          <Route path="schedule/manuscript" element={<ManuscriptSubmission />} />
          <Route path="schedule/oral-defense" element={<OralDefense />} />
          <Route path="schedule/final-defense" element={<FinalDefense />} />
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
      </Routes>
    </div>
  );
}
