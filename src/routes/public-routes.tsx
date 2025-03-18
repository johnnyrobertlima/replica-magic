
import { Route } from "react-router-dom";
import Index from "@/pages/Index";

export function PublicRoutes() {
  return (
    <>
      {/* Public routes */}
      <Route path="/index" element={<Index />} />
      
      {/* Any additional public routes that aren't auth-related would go here */}
    </>
  );
}
