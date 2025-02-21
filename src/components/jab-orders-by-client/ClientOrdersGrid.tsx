
import { useState } from "react";
import type { ClientOrder } from "./types";
import ClientOrderCard from "./ClientOrderCard";

interface ClientOrdersGridProps {
  clients: ClientOrder[];
}

const ClientOrdersGrid = ({ clients }: ClientOrdersGridProps) => {
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {clients.map((client) => (
        <ClientOrderCard
          key={client.PES_CODIGO}
          client={client}
          isExpanded={expandedClient === client.PES_CODIGO.toString()}
          onToggleExpand={() => setExpandedClient(
            expandedClient === client.PES_CODIGO.toString() 
              ? null 
              : client.PES_CODIGO.toString()
          )}
        />
      ))}
    </div>
  );
};

export default ClientOrdersGrid;
