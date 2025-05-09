
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "./auth/useAuthentication";
import { useRedirection } from "./auth/useRedirection";
import { useToast } from "@/components/ui/use-toast";

export const useClientAuth = () => {
  const { loading, signInWithEmail: authenticate, signUpWithEmail: register } = useAuthentication();
  const { handleRedirect } = useRedirection();
  const navigate = useNavigate();
  const { toast } = useToast();

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const user = await authenticate(email, password);
      
      // After successful login, check where to redirect the user
      if (user) {
        await handleRedirect(user.id);
      }
    } catch (error) {
      // Error is handled in the authentication hook
      console.error("Error during authentication:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const { user, hasSession } = await register(email, password, name);
      
      // Show a toast with clear next steps
      toast({
        title: "Conta criada com sucesso!",
        description: hasSession 
          ? "Você será redirecionado automaticamente."
          : "Um email de confirmação foi enviado. Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.",
        duration: 8000,
      });
      
      if (user && hasSession) {
        // Redirecionar imediatamente se o usuário já está autenticado
        setTimeout(() => {
          handleRedirect(user.id);
        }, 1500);
      } else {
        // Mostrar uma mensagem específica para orientação
        setTimeout(() => {
          toast({
            title: "Verifique seu email",
            description: "Você receberá um email com um link para confirmar sua conta. Após confirmar, você poderá fazer login no sistema.",
            duration: 10000,
          });
        }, 2000);
      }
    } catch (error) {
      // Error is handled in the authentication hook
      console.error("Error during registration:", error);
      throw error;
    }
  };

  return {
    loading,
    signInWithEmail,
    signUpWithEmail
  };
};
