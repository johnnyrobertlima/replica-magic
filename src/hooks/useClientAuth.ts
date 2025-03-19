
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "./auth/useAuthentication";
import { useRedirection } from "./auth/useRedirection";

export const useClientAuth = () => {
  const { loading, signInWithEmail: authenticate, signUpWithEmail: register } = useAuthentication();
  const { handleRedirect } = useRedirection();
  const navigate = useNavigate();

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
      
      if (user && hasSession) {
        // Redirecionar imediatamente se o usuário já está autenticado
        setTimeout(() => {
          handleRedirect(user.id);
        }, 1500);
      } else if (user) {
        // Caso padrão - redirecionar para login após 1.5 segundos
        setTimeout(() => {
          navigate("/login");
        }, 1500);
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
