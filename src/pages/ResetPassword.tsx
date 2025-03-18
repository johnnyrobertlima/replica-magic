
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // On component mount, check if we have an access token in the URL hash
    const handleHashParams = async () => {
      // Get the current URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");
      
      console.log("Hash params:", { accessToken: !!accessToken, type, hash: window.location.hash });
      
      if (accessToken && type === "recovery") {
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
              title: "Link inválido",
              description: "O link de redefinição de senha é inválido ou expirou.",
            });
            navigate("/login");
          }
        } catch (error) {
          console.error("Error setting session:", error);
          toast({
            variant: "destructive",
            title: "Erro no processo",
            description: "Ocorreu um erro ao processar o link de redefinição.",
          });
          navigate("/login");
        }
      } else if (!accessToken) {
        // No access token in URL - check if we're already authenticated
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast({
            variant: "destructive",
            title: "Link inválido",
            description: "O link de redefinição de senha é inválido ou expirou.",
          });
          navigate("/login");
        }
      }
    };

    handleHashParams();
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
