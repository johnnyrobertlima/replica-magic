
import { Route } from "react-router-dom";
import { routes } from "@/lib/routes";

export function AdminRoutes() {
  // Filter routes that start with /admin
  const adminRoutes = routes.filter(route => 
    route.path.startsWith('/admin')
  );

  return (
    <>
      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </>
  );
}
