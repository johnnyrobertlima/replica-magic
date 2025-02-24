
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Clients } from "@/components/Clients";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { DebugNavigation } from "@/components/DebugNavigation";

const Index = () => {
  return (
    <main className="min-h-screen">
      <DebugNavigation />
      <Hero />
      <Services />
      <Clients />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
