import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminUser } from "@/lib/admin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleCreateAdmin = async () => {
    try {
      const result = await createAdminUser();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Admin user created successfully. You can now login with admin@onipresenca.com.br / Admin@123456");
      }
    } catch (error) {
      toast.error("Failed to create admin user");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
        />
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={handleCreateAdmin}
            className="w-full"
          >
            Create Admin User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;