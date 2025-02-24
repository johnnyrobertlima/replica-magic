
import { Link } from "react-router-dom";
import { routes } from "@/lib/routes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const DebugNavigation = () => {
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Debug Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              {route.path === "/" ? "Home" : route.path}
            </Link>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
};
