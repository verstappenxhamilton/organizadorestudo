import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { StudyProvider } from "./context/StudyContext";
import { MainLayout } from "./components/layout/MainLayout";

// Pages
import { Dashboard } from "./pages/Dashboard";
import { Subjects } from "./pages/Subjects";
import { Cycle } from "./pages/Cycle";
import { Schedule } from "./pages/Schedule";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import EditalLibrary from "./components/EditalLibrary";

function App() {
  return (
    <StudyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="cycle" element={<Cycle />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="reports" element={<Reports />} />
            <Route path="editais" element={<EditalLibrary />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </StudyProvider>
  );
}

export default App;
