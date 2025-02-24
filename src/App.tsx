
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { routes } from "@/lib/routes";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Toaster } from "@/components/ui/sonner";

function App() {
  console.log("Available routes:", routes.map(route => route.path)); // Debug log

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" attribute="class">
        <Routes>
          {routes.map((route) => {
            console.log("Registering route:", route.path); // Debug log
            return (
              <Route key={route.path} path={route.path} element={route.element} />
            );
          })}
        </Routes>
        <Toaster />
        <GoogleAnalytics />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
