
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClientArea from "@/pages/ClientArea";
import PostManagement from "@/pages/PostManagement";
import JabOrders from "@/pages/JabOrders";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/client-area" element={<ClientArea />} />
        <Route path="/post-management" element={<PostManagement />} />
        <Route path="/client-area/bluebay/jab-orders" element={<JabOrders />} />
      </Routes>
    </Router>
  );
}

export default App;
