
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAuthentication = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Tentando autenticar com:", { email: email.trim() });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (error) {
        console.error("Erro de autenticação:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("Usuário não encontrado");
      }

      console.log("Login bem-sucedido:", data.user);
      
      return data.user;
      
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
        
        // Determinar a mensagem correta com base no comportamento do Supabase
        let hasSession = false;
        
        // Se o Supabase não estiver configurado para exigir confirmação de email
        if (data.session) {
          console.log("Sessão criada imediatamente após o registro:", data.session);
          hasSession = true;
        }
        
        toast({
          title: "Conta criada com sucesso!",
          description: hasSession 
            ? "Sua conta foi criada e você já está autenticado."
            : "Verifique seu email para confirmar o cadastro.",
        });

        return { user: data.user, hasSession };
      }
      
      return { user: null, hasSession: false };
      
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
      
      throw error;
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
