
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useJabOrders, type JabOrder } from "@/hooks/useJabOrders";
import type { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import SearchFilters from "@/components/jab-orders/SearchFilters";

interface ClientOrder {
  APELIDO: string;
  total_saldo: number;
  valor_total: number;
  pedidos: JabOrder[];
  items: Array<{
    ITEM_CODIGO: string;
    DESCRICAO: string | null;
    QTDE_SALDO: number;
    QTDE_PEDIDA: number;
    QTDE_ENTREGUE: number;
    VALOR_UNITARIO: number;
    PED_NUMPEDIDO: string;
  }>;
}

const JabOrdersByClient = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showZeroBalanceMap, setShowZeroBalanceMap] = useState<Record<string, boolean>>({});

  const { data: orders = [], isLoading } = useJabOrders(searchDate);

  const toggleExpand = (clientId: string) => {
    setExpandedClient(expandedClient === clientId ? null : clientId);
  };

  const toggleShowZeroBalance = (clientId: string) => {
    setShowZeroBalanceMap(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  const handleSearch = () => {
    setIsSearching(true);
    setSearchDate(date);
  };

  // Agrupar pedidos por cliente
  const clientOrders = orders.reduce<Record<string, ClientOrder>>((acc, order) => {
    if (!order.APELIDO) return acc;

    if (!acc[order.APELIDO]) {
      acc[order.APELIDO] = {
        APELIDO: order.APELIDO,
        total_saldo: 0,
        valor_total: 0,
        pedidos: [],
        items: []
      };
    }

    const clientOrder = acc[order.APELIDO];
    clientOrder.pedidos.push(order);
    clientOrder.total_saldo += order.total_saldo;
    clientOrder.valor_total += order.valor_total;

    // Consolidar itens
    order.items.forEach(item => {
      clientOrder.items.push({ 
        ...item,
        PED_NUMPEDIDO: order.PED_NUMPEDIDO 
      });
    });

    return acc;
  }, {});

  const filteredClients = Object.values(clientOrders).filter(client => {
    if (searchQuery) {
      return client.APELIDO.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Separação de Pedidos por Cliente</h1>
        <SearchFilters
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          date={date}
          onDateChange={setDate}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredClients.map((client) => {
          const isExpanded = expandedClient === client.APELIDO;
          const showZeroBalance = showZeroBalanceMap[client.APELIDO] || false;
          const uniquePedidos = new Set(client.pedidos.map(p => p.PED_NUMPEDIDO));

          return (
            <Card 
              key={client.APELIDO}
              className={cn(
                "hover:shadow-lg transition-all cursor-pointer aspect-square",
                isExpanded && "ring-2 ring-primary col-span-full aspect-auto"
              )}
              onClick={() => toggleExpand(client.APELIDO)}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg">
                      {client.APELIDO}
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
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <Switch
                            checked={showZeroBalance}
                            onCheckedChange={() => toggleShowZeroBalance(client.APELIDO)}
                            id={`show-zero-balance-${client.APELIDO}`}
                          />
                          <label 
                            htmlFor={`show-zero-balance-${client.APELIDO}`}
                            className="text-sm text-muted-foreground cursor-pointer"
                          >
                            Mostrar itens com saldo zero
                          </label>
                        </div>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-4">Itens Consolidados</h4>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nº Pedido</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead className="text-right">QT Pedido</TableHead>
                                <TableHead className="text-right">QT Faturada</TableHead>
                                <TableHead className="text-right">QT Saldo</TableHead>
                                <TableHead className="text-right">VL Uni</TableHead>
                                <TableHead className="text-right">VL Total Saldo</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {client.items
                                .filter(item => showZeroBalance || item.QTDE_SALDO > 0)
                                .map((item, index) => (
                                <TableRow key={`${item.ITEM_CODIGO}-${index}`}>
                                  <TableCell>{item.PED_NUMPEDIDO}</TableCell>
                                  <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                                  <TableCell>{item.DESCRICAO || '-'}</TableCell>
                                  <TableCell className="text-right">{item.QTDE_PEDIDA.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">{item.QTDE_ENTREGUE.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">{item.QTDE_SALDO.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">
                                    {item.VALOR_UNITARIO.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {(item.QTDE_SALDO * item.VALOR_UNITARIO).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
};

export default JabOrdersByClient;
