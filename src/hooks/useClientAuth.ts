
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useClientAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Function to get user group homepage using RPC
  const getUserGroupHomepage = async (userId: string) => {
    try {
      console.log("Buscando homepage do grupo para usuário:", userId);
      
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
      
      // Try to get the user group homepage
      const homepage = await getUserGroupHomepage(userId);
      
      if (homepage && typeof homepage === 'string') {
        console.log("Homepage encontrada:", homepage);
        // Remove initial slash if it exists to avoid routing problems
        const normalizedHomepage = homepage.startsWith('/') ? homepage.slice(1) : homepage;
        console.log("Redirecionando para:", normalizedHomepage);
        
        navigate(`/${normalizedHomepage}`);
        return;
      }
      
      // If we got here, no specific homepage was found
      console.log("Nenhuma homepage específica encontrada, redirecionando para a área padrão");
      navigate("/client-area");
      
    } catch (error: any) {
      console.error("Erro ao verificar redirecionamento:", error);
      toast({
        title: "Erro ao verificar permissões",
        description: error.message,
        variant: "destructive",
      });
      // Default redirect in case of error
      navigate("/client-area");
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Tentando autenticar com:", { email: email.trim() });

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
      
      // After successful login, check where to redirect the user
      await handleRedirect(user.id);
      
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
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      // Construir URL dinâmica com base na localização atual
      const currentDomain = window.location.origin;
      // Certificar-se de que a URL é absoluta
      const redirectUrl = `${currentDomain}/login`;
      
      console.log("Registrando usuário com redirect para:", redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
          },
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
      
      // Verificar se o usuário foi criado com sucesso e o que aconteceu com o email
      if (data && data.user) {
        console.log("Usuário criado com sucesso:", data.user);
        console.log("Status do email de confirmação:", data.user.confirmation_sent_at ? "Enviado" : "Não enviado");
        console.log("ID do usuário:", data.user.id);
        console.log("Email confirmado:", data.user.email_confirmed_at ? "Sim" : "Não");
        
        if (data.user.identities && data.user.identities.length === 0) {
          console.error("Erro: Identidades não definidas no usuário.");
        }
        
        // Determinar a mensagem correta com base no comportamento do Supabase
        let message = "Verifique seu email para confirmar o cadastro.";
        
        // Se o Supabase não estiver configurado para exigir confirmação de email
        if (data.session) {
          console.log("Sessão criada imediatamente após o registro:", data.session);
          message = "Sua conta foi criada e você já está autenticado.";
          
          // Redirecionar imediatamente se o usuário já está autenticado
          setTimeout(() => {
            handleRedirect(data.user!.id);
          }, 1500);
        } else {
          // Caso padrão - redirecionar para login após 1.5 segundos
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        }
        
        toast({
          title: "Conta criada com sucesso!",
          description: message,
        });
      }
      
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      
      let errorMessage = error.message;
      if (error.message.includes("User already registered")) {
        errorMessage = "Este email já está registrado. Tente fazer login.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro na criação da conta",
        description: errorMessage,
      });
      
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signInWithEmail,
    signUpWithEmail
  };
};
