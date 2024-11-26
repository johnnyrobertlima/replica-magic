import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BannerForm } from "@/components/admin/BannerForm";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { ClientForm } from "@/components/admin/ClientForm";

const Admin = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    checkUser();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    toast.info(`${section} management section opened`);
  };

  const renderForm = () => {
    switch (activeSection) {
      case 'Banners':
        return <BannerForm />;
      case 'Services':
        return <ServiceForm />;
      case 'Clients':
        return <ClientForm />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Banners</h2>
          <p className="text-gray-600 mb-4">Manage website banners and hero section</p>
          <button 
            onClick={() => handleSectionClick('Banners')}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Manage Banners
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <p className="text-gray-600 mb-4">Edit service offerings and descriptions</p>
          <button 
            onClick={() => handleSectionClick('Services')}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Manage Services
          </button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Clients</h2>
          <p className="text-gray-600 mb-4">Update client logos and information</p>
          <button 
            onClick={() => handleSectionClick('Clients')}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Manage Clients
          </button>
        </div>
      </div>

      {activeSection && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">{activeSection} Management</h2>
          {renderForm()}
        </div>
      )}
    </div>
  );
};

export default Admin;