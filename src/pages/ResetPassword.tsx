
import { useNavigate } from "react-router-dom";
import { TokenVerificationLoader } from "@/components/auth/TokenVerificationLoader";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { useTokenVerification } from "@/hooks/useTokenVerification";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { isTokenValid, isVerifying } = useTokenVerification();

  const handleResetSuccess = () => {
    // Redirect to login page after successful password reset
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  if (isVerifying) {
    return <TokenVerificationLoader />;
  }

  if (!isTokenValid) {
    // If token is invalid, the useTokenVerification hook will handle the redirection
    return null;
  }

  return <PasswordResetForm onSuccess={handleResetSuccess} />;
};

export default ResetPassword;
