
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useTokenVerification = () => {
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthParams = async () => {
      try {
        // Primeiro verifica se temos o token no hash (formato antigo)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        
        // Se não encontrou no hash, verifica na URL (formato novo)
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
          }
        });
        
        // Processa o token do hash
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
          } catch (error) {
            console.error("Error setting session:", error);
            throw error;
          }
        } 
        // Processa token da URL (formato novo)
        else if (urlToken) {
          try {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: urlToken,
              type: "recovery"
            });
            
            if (error) {
              console.error("Token verification error:", error);
              throw error;
            }
            
            setIsTokenValid(true);
          } catch (error) {
            console.error("Error verifying token:", error);
            throw error;
          }
        }
        // Se não tem token no hash nem na URL, verifica autenticação
        else {
          // Check if we're already authenticated
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setIsTokenValid(true);
          } else {
            throw new Error("Nenhum token válido encontrado");
          }
        }
      } catch (error: any) {
        console.error("Erro ao verificar token:", error);
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

  return { isTokenValid, isVerifying };
};
