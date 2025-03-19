
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TokenVerificationLoaderProps {
  errorMessage?: string | null;
}

export const TokenVerificationLoader = ({ errorMessage }: TokenVerificationLoaderProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{errorMessage ? "Erro de verificação" : "Verificando link..."}</CardTitle>
          <CardDescription>
            {errorMessage 
              ? "Ocorreu um problema ao validar seu link." 
              : "Estamos validando seu link de redefinição de senha."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6 space-y-4">
          {errorMessage ? (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
