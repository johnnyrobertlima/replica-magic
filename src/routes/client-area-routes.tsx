
import { Route } from "react-router-dom";
import { routes } from "@/lib/routes";

export function ClientAreaRoutes() {
  // Filter routes that start with /client-area
  const clientAreaRoutes = routes.filter(route => 
    route.path.startsWith('/client-area')
  );

  return (
    <>
      {clientAreaRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </>
  );
}
