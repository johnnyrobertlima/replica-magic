
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // On component mount, check if we have an access token in the URL hash or query params
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
      }
    };

    handleAuthParams();
  }, [navigate, toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setPasswordError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi redefinida com sucesso.",
      });

      // Redirect to login page after successful password reset
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verificando link...</CardTitle>
            <CardDescription>
              Estamos validando seu link de redefinição de senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redefinir sua senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo para completar o processo de redefinição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirme a senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Redefinir senha"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
