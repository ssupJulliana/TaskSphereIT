import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen font-sans">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        {/* add other routes later… */}
      </Routes>
    </div>
  );
}
