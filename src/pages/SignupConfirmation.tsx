
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const SignupConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Cadastro Confirmado!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Seu email foi confirmado com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">Próximos passos:</h3>
            <p className="text-blue-700">
              Solicite ao administrador para que seu usuário seja integrado a um grupo 
              para obter acesso às funcionalidades do sistema.
            </p>
          </div>
          
          <Button 
            onClick={() => navigate("/login")} 
            className="w-full"
          >
            Ir para o Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupConfirmation;
