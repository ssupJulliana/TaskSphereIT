import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage.jsx";
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
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="enroll" element={<InstructorEnroll />} />
          <Route path="teams" element={<InstructorTeams />} />
        </Route>
      </Routes>
    </div>
  );
}
