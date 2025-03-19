
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTokenVerification = () => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthParams = async () => {
      try {
        // Check if we're on the correct page first
        if (window.location.pathname !== '/reset-password') {
          // Look for hash params that might indicate a redirect from Supabase auth
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const type = hashParams.get("type");
          
          if (type === "recovery") {
            // We're on the wrong page but have recovery params, redirect to the correct page
            navigate("/reset-password" + window.location.hash);
            return;
          }
          
          if (type === "signup") {
            // Handle signup confirmation success
            toast({
              title: "Email confirmado com sucesso!",
              description: "Agora você pode fazer login com suas credenciais.",
            });
            
            // Redirect to signup confirmation page after confirming signup
            setTimeout(() => {
              navigate("/signup-confirmation");
            }, 1000);
            return;
          }
        }
        
        // First check if we have the token in the hash (older format)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        
        // If not found in hash, check in the URL (newer format)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get("token");
        
        console.log("Auth params:", { 
          hash: { 
            accessToken: !!accessToken, 
            type, 
            hash: window.location.hash 
          },
          url: {
            token: !!urlToken,
            search: window.location.search
          },
          pathname: window.location.pathname
        });
        
        // Process the token from the hash
        if (accessToken && type === "recovery") {
          try {
            // Set the session with the tokens from the URL
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            
            if (error) {
              console.error("Session error:", error);
              throw error;
            }
            
            setIsTokenValid(true);
            setErrorMessage(null);
          } catch (error) {
            console.error("Error setting session:", error);
            throw error;
          }
        } 
        // Process token from the URL (newer format)
        else if (urlToken) {
          try {
            // Verificar que tipo de token é (recovery ou signup)
            const urlParams = new URLSearchParams(window.location.search);
            const tokenType = urlParams.get("type");
            
            if (tokenType === "signup") {
              // Redirecionar para a página de confirmação de cadastro
              navigate("/signup-confirmation");
              return;
            }
            
            const { error } = await supabase.auth.verifyOtp({
              token_hash: urlToken,
              type: "recovery"
            });
            
            if (error) {
              console.error("Token verification error:", error);
              throw error;
            }
            
            setIsTokenValid(true);
            setErrorMessage(null);
          } catch (error) {
            console.error("Error verifying token:", error);
            throw error;
          }
        }
        // If no token in hash or URL, check if we're already authenticated
        else {
          // Check if we're already authenticated
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setIsTokenValid(true);
            setErrorMessage(null);
          } else {
            throw new Error("Nenhum token válido encontrado");
          }
        }
      } catch (error: any) {
        console.error("Erro ao verificar token:", error);
        setErrorMessage(error.message);
        toast({
          variant: "destructive",
          title: "Link inválido",
          description: "O link de redefinição de senha é inválido ou expirou.",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } finally {
        setIsVerifying(false);
      }
    };

    handleAuthParams();
  }, [navigate, toast]);

  return { isTokenValid, isVerifying, errorMessage };
};
