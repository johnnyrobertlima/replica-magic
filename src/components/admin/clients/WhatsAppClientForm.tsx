import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const WhatsAppClientForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nome: String(formData.get('nome')),
      horario_inicial: String(formData.get('horario_inicial')),
      horario_final: String(formData.get('horario_final')),
      enviar_sabado: formData.get('enviar_sabado') === 'on',
      enviar_domingo: formData.get('enviar_domingo') === 'on',
    };

    try {
      const { error } = await supabase
        .from('Clientes_Whats')
        .insert(data);

      if (error) throw error;

      toast({
        title: "Cliente cadastrado com sucesso!",
        description: "O cliente foi adicionado à lista de disparos do WhatsApp.",
      });

      // Reset form
      e.currentTarget.reset();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Ocorreu um erro ao tentar cadastrar o cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome</label>
        <Input 
          name="nome" 
          required 
          placeholder="Nome do cliente"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Horário Inicial</label>
          <Input 
            name="horario_inicial" 
            type="time" 
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Horário Final</label>
          <Input 
            name="horario_final" 
            type="time" 
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox name="enviar_sabado" id="enviar_sabado" />
          <label
            htmlFor="enviar_sabado"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Permitir envios aos sábados
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox name="enviar_domingo" id="enviar_domingo" />
          <label
            htmlFor="enviar_domingo"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Permitir envios aos domingos
          </label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cadastrando...
          </>
        ) : (
          'Cadastrar Cliente'
        )}
      </Button>
    </form>
  );
};