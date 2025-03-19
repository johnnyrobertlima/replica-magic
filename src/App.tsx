
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AppRoutes } from "./routes";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <GoogleAnalytics />
      <AppRoutes />
      <Toaster />
    </>
  );
}

export default App;
