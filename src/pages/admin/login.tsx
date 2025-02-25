
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
        return;
      }

      // Verifica se existe um grupo JAB com homepage definida
      const jabGroup = userGroups.find(ug => 
        ug.groups?.name === 'JAB' && ug.groups?.homepage
      );

      if (jabGroup && jabGroup.groups?.homepage) {
        const homepage = jabGroup.groups.homepage;
        console.log("Grupo JAB encontrado, homepage:", homepage);

        // Remove a barra inicial se existir para evitar problemas de rota
        const normalizedHomepage = homepage.startsWith('/') ? homepage.slice(1) : homepage;
        console.log("Redirecionando para:", normalizedHomepage);
        
        navigate(`/${normalizedHomepage}`);
        return;
      }

      console.log("Grupo JAB não encontrado ou sem homepage definida");
      toast({
        title: "Aviso",
        description: "Não foi possível encontrar uma página inicial configurada para seu grupo.",
        variant: "default",
      });
      
    } catch (error: any) {
      console.error("Erro ao verificar grupos:", error);
      toast({
        title: "Erro ao verificar permissões",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Tentando autenticar com:", { email: email.trim() });
      
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      
      if (error) throw error;
      if (!user) throw new Error("Usuário não encontrado após autenticação");

      console.log("Login bem-sucedido, user_id:", user.id);
      await handleRedirect(user.id);
      
    } catch (error: any) {
      console.error("Erro no login:", error);
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
