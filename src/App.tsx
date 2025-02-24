
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {routes.map((route) => {
                console.log("Registering route:", route.path);
                return (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={route.element} 
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
