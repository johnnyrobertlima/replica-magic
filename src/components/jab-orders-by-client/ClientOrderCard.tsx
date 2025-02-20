
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClientOrder } from "./types";
import ClientOrderItems from "./ClientOrderItems";

interface ClientOrderCardProps {
  client: ClientOrder;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ClientOrderCard = ({ client, isExpanded, onToggleExpand }: ClientOrderCardProps) => {
  const [showZeroBalance, setShowZeroBalance] = useState(false);
  const uniquePedidos = new Set(client.pedidos.map(p => p.PED_NUMPEDIDO));

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all cursor-pointer aspect-square",
        isExpanded && "ring-2 ring-primary col-span-full aspect-auto"
      )}
      onClick={onToggleExpand}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">
              PES_CODIGO: {client.PES_CODIGO}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Quantidade de Pedidos:</span>
            <span className="font-medium">{uniquePedidos.size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Saldo:</span>
            <span className="font-medium">{client.total_saldo.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Valor Total:</span>
            <span className="font-medium">
              R$ {client.valor_total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          
          {isExpanded && (
            <ClientOrderItems 
              items={client.items}
              showZeroBalance={showZeroBalance}
              onToggleZeroBalance={() => setShowZeroBalance(!showZeroBalance)}
              clientId={client.PES_CODIGO.toString()}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientOrderCard;
