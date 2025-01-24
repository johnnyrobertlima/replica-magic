import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import ClientArea from "@/pages/ClientArea";
import WhatsAppClients from "@/pages/WhatsAppClients";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/client-area" element={<ClientArea />} />
            <Route path="/client-area/whatsapp-clients" element={<WhatsAppClients />} />
          </Routes>
        </div>
        <Footer />
      </div>
      <Toaster />
    </Router>
  );
}

export default App;