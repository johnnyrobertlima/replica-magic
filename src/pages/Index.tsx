
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Clients } from "@/components/Clients";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { routes } from "@/lib/routes";

const Index = () => {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Navegação do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid gap-2">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  {route.path === "/" ? "Página Inicial" : route.path}
                </Link>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>
      
      <Hero />
      <Services />
      <Clients />
      <ContactSection />
      <Footer />
    </main>
  );
};

export default Index;
