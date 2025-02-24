
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { routes } from "@/lib/routes";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Toaster } from "@/components/ui/sonner";

function App() {
  console.log("Available routes:", routes.map(route => route.path));

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" attribute="class">
        <div className="min-h-screen bg-background">
          {/* Navigation Debug (temporary) */}
          <nav className="p-4 bg-gray-100">
            <ul className="flex gap-4">
              <li>
                <Link to="/" className="text-blue-600 hover:underline">Home</Link>
              </li>
              <li>
                <Link to="/client-area" className="text-blue-600 hover:underline">Área do Cliente</Link>
              </li>
            </ul>
          </nav>

          <main className="container mx-auto px-4 py-8">
            <Routes>
              {routes.map((route) => {
                console.log("Registering route:", route.path);
                return (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={
                      <div className="min-h-[500px]">
                        {route.element}
                      </div>
                    } 
                  />
                );
              })}
            </Routes>
          </main>
        </div>
        <Toaster />
        <GoogleAnalytics />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
