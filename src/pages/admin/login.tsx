
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const getUserGroups = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_groups')
      .select(`
        groups (
          name
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  };

  const handleRedirect = async (userId: string) => {
    try {
      const userGroups = await getUserGroups(userId);
      
      // Define a ordem de prioridade dos grupos e suas páginas iniciais
      const groupRedirects = [
        { group: 'admin', path: '/admin' },
        { group: 'manager', path: '/admin/clients' },
        { group: 'editor', path: '/admin/social' },
        { group: 'client', path: '/admin/social' }
      ];

      // Encontra o primeiro grupo que o usuário tem acesso, seguindo a ordem de prioridade
      const userGroupNames = userGroups.map((ug: any) => ug.groups?.name);
      const redirect = groupRedirects.find(gr => userGroupNames.includes(gr.group));

      if (redirect) {
        navigate(redirect.path);
        return;
      }

      // Se não encontrar nenhum grupo específico, redireciona para uma área restrita padrão
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
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      if (!user) throw new Error("Usuário não encontrado");
      
      await handleRedirect(user.id);
      
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin ONI</h1>
          <p className="text-muted-foreground">Faça login para continuar</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};
