
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ClientLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Função para obter a homepage do grupo do usuário usando RPC
  const getUserGroupHomepage = async (userId: string) => {
    try {
      console.log("Buscando homepage do grupo para usuário:", userId);
      
      // Usar a função RPC corretamente, agora definida nos tipos
      const { data, error } = await supabase.rpc('get_user_group_homepage', {
        user_id_param: userId
      });
      
      if (error) {
        console.error("Erro ao chamar RPC:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Erro ao buscar homepage do grupo:", error);
      return null;
    }
  };

  const handleRedirect = async (userId: string) => {
    try {
      console.log("Iniciando redirecionamento para usuário:", userId);
      
      // Tentar obter a homepage do grupo do usuário
      const homepage = await getUserGroupHomepage(userId);
      
      if (homepage && typeof homepage === 'string') {
        console.log("Homepage encontrada:", homepage);
        // Remove a barra inicial se existir para evitar problemas de rota
        const normalizedHomepage = homepage.startsWith('/') ? homepage.slice(1) : homepage;
        console.log("Redirecionando para:", normalizedHomepage);
        
        navigate(`/${normalizedHomepage}`);
        return;
      }
      
      // Se chegou aqui, não encontrou homepage específica
      console.log("Nenhuma homepage específica encontrada, redirecionando para a área padrão");
      navigate("/client-area");
      
    } catch (error: any) {
      console.error("Erro ao verificar redirecionamento:", error);
      toast({
        title: "Erro ao verificar permissões",
        description: error.message,
        variant: "destructive",
      });
      // Redirecionamento padrão em caso de erro
      navigate("/client-area");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Tentando autenticar com:", { email: email.trim() });

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim(),
            }
          }
        });
        if (error) throw error;
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar o cadastro.",
        });
      } else {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        
        if (error) {
          console.error("Erro de autenticação:", error);
          throw error;
        }
        
        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        console.log("Login bem-sucedido:", user);
        
        // Após login bem-sucedido, verificar para onde redirecionar o usuário
        await handleRedirect(user.id);
      }
    } catch (error: any) {
      console.error("Erro completo:", error);
      let message = "Erro na autenticação";
      
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou senha incorretos";
      } else if (error.message.includes("Email not confirmed")) {
        message = "Email não confirmado. Por favor, verifique sua caixa de entrada";
      }
      
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'azure') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/client-area`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: error.message,
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para instruções de redefinição de senha.",
      });
      
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error.message,
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Criar Conta" : "Login"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Crie sua conta para acessar o sistema"
              : "Entre com suas credenciais para acessar o sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                  placeholder="Seu nome completo"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              {!isSignUp && (
                <div className="text-right mt-1">
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="text-sm p-0 h-auto" type="button">
                        Esqueceu sua senha?
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Redefinir senha</DialogTitle>
                        <DialogDescription>
                          Digite seu email para receber instruções de redefinição de senha.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePasswordReset} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={isResetLoading || !resetEmail}>
                            {isResetLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Enviar instruções"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                "Criar Conta"
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Ou continue com
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("google")}
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("azure")}
              >
                Microsoft
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              type="button"
            >
              {isSignUp
                ? "Já tem uma conta? Entre"
                : "Não tem uma conta? Cadastre-se"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientLogin;
