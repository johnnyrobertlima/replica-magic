import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Banners</h2>
          <p className="text-gray-600 mb-4">Manage website banners and hero section</p>
          <button className="btn-primary">Manage Banners</button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <p className="text-gray-600 mb-4">Edit service offerings and descriptions</p>
          <button className="btn-primary">Manage Services</button>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Clients</h2>
          <p className="text-gray-600 mb-4">Update client logos and information</p>
          <button className="btn-primary">Manage Clients</button>
        </div>
      </div>
    </div>
  );
};

export default Admin;