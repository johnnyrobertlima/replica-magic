
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SeparacaoDePedidosProps {
  clienteId: number;
  onClose: () => void;
}

export function SeparacaoDePedidos({ clienteId, onClose }: SeparacaoDePedidosProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Separação de Pedidos - Cliente {clienteId}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p>Conteúdo da separação de pedidos para o cliente {clienteId}.</p>
          {/* Este é um componente placeholder. Você pode implementar a lógica de separação de pedidos aqui */}
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
