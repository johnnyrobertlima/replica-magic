
import { Routes, Route } from "react-router-dom";

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Admin Dashboard</div>} />
      {/* Admin routes will be added here */}
    </Routes>
  );
}
