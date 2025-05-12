
import React, { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// Lazy load components that are not immediately needed on initial render
const Hero = lazy(() => import("@/components/Hero").then(module => ({ default: module.Hero })));
const Services = lazy(() => import("@/components/Services").then(module => ({ default: module.Services })));
const Clients = lazy(() => import("@/components/Clients").then(module => ({ default: module.Clients })));
const ContactSection = lazy(() => import("@/components/ContactSection").then(module => ({ default: module.ContactSection })));
const Footer = lazy(() => import("@/components/Footer").then(module => ({ default: module.Footer })));

// Loading component for Suspense fallback
const SectionLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const Index = () => {
  return (
    <main className="min-h-screen">
      {/* Hero is critical for initial display, so we don't wrap it in Suspense */}
      <Suspense fallback={<SectionLoading />}>
        <Hero />
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <Services />
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <Clients />
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <ContactSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <Footer />
      </Suspense>
    </main>
  );
};

export default Index;
