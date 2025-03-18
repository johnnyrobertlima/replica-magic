
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const SignupConfirmation = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSignupConfirmation = async () => {
      try {
        // Get access token and other params from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        
        console.log("Processing signup confirmation: ", { 
          hasAccessToken: !!accessToken, 
          type,
          hash: window.location.hash.substring(0, 20) + "..." // Log truncated hash for debugging
        });

        // Check if this is a signup confirmation flow
        if (accessToken && type === "signup") {
          try {
            // Set the session with the tokens from the URL
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            
            if (error) {
              console.error("Session error:", error);
              toast({
                variant: "destructive",
                title: "Erro na confirmação",
                description: "Houve um problema ao confirmar seu cadastro.",
              });
              navigate("/login");
              return;
            }
            
            toast({
              title: "Cadastro confirmado!",
              description: "Seu email foi verificado com sucesso.",
            });

            // Get user data to determine where to redirect
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              // Redirect to appropriate page based on user permissions
              navigate("/client-area");
            } else {
              navigate("/login");
            }
          } catch (error) {
            console.error("Error setting session:", error);
            toast({
              variant: "destructive",
              title: "Erro no processo",
              description: "Ocorreu um erro ao processar a confirmação.",
            });
            navigate("/login");
          }
        } else {
          // If no access token or not a signup confirmation, redirect to login
          console.log("Not a signup confirmation or missing token, redirecting to login");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error during signup confirmation:", error);
        toast({
          variant: "destructive",
          title: "Erro no processo",
          description: "Ocorreu um erro ao processar a confirmação.",
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    handleSignupConfirmation();
  }, [toast, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verificando confirmação</CardTitle>
          <CardDescription>
            Estamos processando sua confirmação de cadastro...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupConfirmation;
