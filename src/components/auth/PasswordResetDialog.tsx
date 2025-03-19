
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordResetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PasswordResetDialog = ({ isOpen, onOpenChange }: PasswordResetDialogProps) => {
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);

    try {
      // Construir URL dinâmica com base na localização atual
      const currentDomain = window.location.origin;
      const redirectUrl = `${currentDomain}/reset-password`;
      
      console.log("Enviando link de redefinição com redirect para:", redirectUrl);
      
      const { error, data } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: redirectUrl,
      });

      console.log("Resposta da redefinição de senha:", { error, data });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para instruções de redefinição de senha.",
      });
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error.message,
      });
      setEmailSent(false);
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    setResetEmail("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
          <DialogDescription>
            Digite seu email para receber instruções de redefinição de senha.
          </DialogDescription>
        </DialogHeader>
        
        {emailSent ? (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription>
                Um email com instruções para redefinir sua senha foi enviado para <strong>{resetEmail}</strong>.
                Por favor, verifique sua caixa de entrada e spam.
              </AlertDescription>
            </Alert>
            <Button onClick={handleClose} className="w-full">Fechar</Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isResetLoading || !resetEmail}>
                {isResetLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enviar instruções"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
