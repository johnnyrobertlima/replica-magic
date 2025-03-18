
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PasswordResetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PasswordResetDialog = ({ isOpen, onOpenChange }: PasswordResetDialogProps) => {
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);

    try {
      // Usar a URL do site em produção para garantir que o redirecionamento funcione
      // Isso pode ser ajustado com base no ambiente
      // Para produção, usamos a URL absoluta da página de reset
      const redirectUrl = "https://www.oniagencia.com.br/reset-password";
      
      console.log("Enviando link de redefinição com redirect para:", redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para instruções de redefinição de senha.",
      });
      
      onOpenChange(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error.message,
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
          <DialogDescription>
            Digite seu email para receber instruções de redefinição de senha.
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};
