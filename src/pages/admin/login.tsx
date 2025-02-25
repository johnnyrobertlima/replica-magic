
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getUserGroups = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_groups')
      .select(`
        groups (
          name,
          homepage
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  };

  const handleRedirect = async (userId: string) => {
    try {
      const userGroups = await getUserGroups(userId);
      
      if (!userGroups || userGroups.length === 0) {
        toast({
          title: "Aviso",
          description: "Usuário não pertence a nenhum grupo.",
          variant: "default",
        });
        navigate("/admin/login");
        return;
      }

      const groupOrder = ['admin', 'manager', 'editor', 'client'];
      const sortedGroups = userGroups.sort((a, b) => {
        const aIndex = groupOrder.indexOf(a.groups?.name || '');
        const bIndex = groupOrder.indexOf(b.groups?.name || '');
        return aIndex - bIndex;
      });

      const primaryGroup = sortedGroups.find(ug => ug.groups?.homepage);

      if (primaryGroup?.groups?.homepage) {
        navigate(primaryGroup.groups.homepage);
        return;
      }

      toast({
        title: "Aviso",
        description: "Seu grupo de usuário não tem uma página inicial definida.",
        variant: "default",
      });
      navigate("/admin/social");
      
    } catch (error: any) {
      console.error("Erro ao verificar grupos:", error);
      toast({
        title: "Erro ao verificar permissões",
        description: error.message,
        variant: "destructive",
      });
      navigate("/admin/login");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      console.log("Iniciando tentativa de login com:", { email: trimmedEmail }); 
      
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword
      });
      
      if (error) {
        console.error("Erro detalhado de autenticação:", {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }

      if (!user) {
        throw new Error("Usuário não encontrado após autenticação");
      }

      console.log("Login bem-sucedido, user_id:", user.id);
      
      await handleRedirect(user.id);
      
    } catch (error: any) {
      console.error("Erro completo do login:", error);
      let message = "Erro ao fazer login";
      
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou senha incorretos";
      } else if (error.message.includes("Email not confirmed")) {
        message = "Email não confirmado. Por favor, verifique sua caixa de entrada";
      }
      
      toast({
        title: "Erro no login",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin ONI</h1>
          <p className="text-muted-foreground">Faça login para continuar</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
