
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VolumeSaudavelDialogProps {
  clienteNome: string;
  clienteCodigo: number;
  valorAtual: number | null;
  onUpdate: (clienteCodigo: number, valor: number) => Promise<{ success: boolean; error?: any }>;
}

export const VolumeSaudavelDialog = ({
  clienteNome,
  clienteCodigo,
  valorAtual,
  onUpdate
}: VolumeSaudavelDialogProps) => {
  const [volumeSaudavelValue, setVolumeSaudavelValue] = useState(
    valorAtual ? valorAtual.toString().replace('.', ',') : ""
  );
  const { toast } = useToast();

  const handleVolumeSaudavelSubmit = async () => {
    try {
      const valorNumerico = parseFloat(volumeSaudavelValue.replace(/\./g, '').replace(',', '.'));
      
      if (isNaN(valorNumerico)) {
        toast({
          title: "Erro",
          description: "Por favor, insira um valor numérico válido.",
          variant: "destructive",
        });
        return;
      }
      
      const result = await onUpdate(clienteCodigo, valorNumerico);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Volume saudável de faturamento atualizado com sucesso!",
          variant: "default",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o volume saudável de faturamento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar volume saudável:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o volume saudável de faturamento.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
          onClick={() => {
            setVolumeSaudavelValue(
              valorAtual 
                ? valorAtual.toString().replace('.', ',') 
                : ""
            );
          }}
        >
          <Edit className="h-3 w-3" />
          <span>Volume Saudável</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Volume Saudável de Faturamento</DialogTitle>
          <DialogDescription>
            Defina o volume saudável de faturamento para {clienteNome}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="volume-saudavel">Valor</Label>
            <Input
              id="volume-saudavel"
              value={volumeSaudavelValue}
              onChange={(e) => setVolumeSaudavelValue(e.target.value)}
              placeholder="0,00"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" onClick={handleVolumeSaudavelSubmit}>Salvar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
