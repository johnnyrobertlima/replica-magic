
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const ClientLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getUserGroups = async (userId: string) => {
    try {
      console.log("Buscando grupos para usuário:", userId);
      const { data, error } = await supabase
        .from('user_groups')
        .select(`
          id,
          user_id,
          group_id,
          groups:groups (
            id,
            name,
            homepage
          )
        `)
        .eq('user_id', userId)
        .throwOnError();

      if (error) throw error;
      if (!data) throw new Error("Nenhum grupo encontrado");

      console.log("Grupos encontrados:", JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
      throw error;
    }
  };

  const handleRedirect = async (userId: string) => {
    try {
      console.log("Iniciando redirecionamento para usuário:", userId);
      
      const userGroups = await getUserGroups(userId);
      
      if (!userGroups || userGroups.length === 0) {
        console.log("Usuário sem grupos");
        toast({
          title: "Aviso",
          description: "Usuário não pertence a nenhum grupo.",
          variant: "default",
        });
        navigate("/client-area"); // Redirecionamento padrão
        return;
      }

      // Verifica se existe um grupo com homepage definida
      const groupWithHomepage = userGroups.find(ug => ug.groups?.homepage);

      if (groupWithHomepage && groupWithHomepage.groups?.homepage) {
        const homepage = groupWithHomepage.groups.homepage;
        console.log("Grupo encontrado, homepage:", homepage);

        // Remove a barra inicial se existir para evitar problemas de rota
        const normalizedHomepage = homepage.startsWith('/') ? homepage.slice(1) : homepage;
        console.log("Redirecionando para:", normalizedHomepage);
        
        navigate(`/${normalizedHomepage}`);
        return;
      }

      console.log("Nenhum grupo encontrado com homepage definida");
      navigate("/client-area"); // Redirecionamento padrão
      
    } catch (error: any) {
      console.error("Erro ao verificar grupos:", error);
      toast({
        title: "Erro ao verificar permissões",
        description: error.message,
        variant: "destructive",
      });
      navigate("/client-area"); // Redirecionamento padrão em caso de erro
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
