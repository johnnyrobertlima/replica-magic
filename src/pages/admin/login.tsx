
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

      // Ordena os grupos para priorizar 'admin', depois 'manager', etc.
      const groupOrder = ['admin', 'manager', 'editor', 'client'];
      const sortedGroups = userGroups.sort((a, b) => {
        const aIndex = groupOrder.indexOf(a.groups?.name || '');
        const bIndex = groupOrder.indexOf(b.groups?.name || '');
        return aIndex - bIndex;
      });

      // Pega o primeiro grupo (maior prioridade) que tenha uma homepage definida
      const primaryGroup = sortedGroups.find(ug => ug.groups?.homepage);

      if (primaryGroup?.groups?.homepage) {
        navigate(primaryGroup.groups.homepage);
        return;
      }

      // Se nenhum grupo tiver homepage definida
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
