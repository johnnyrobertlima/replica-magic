
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BluebayMenu } from "@/components/jab-orders/BluebayMenu";
import { Link } from "react-router-dom";
import { fetchRejectedSeparationItems } from "@/services/separation/separationDbService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const RejectedSeparations = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [rejectedItems, setRejectedItems] = useState<any[]>([]);
  const [separationGroups, setSeparationGroups] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const loadRejectedItems = async () => {
      setIsLoading(true);
      const items = await fetchRejectedSeparationItems();
      setRejectedItems(items);
      
      // Group items by separation ID
      const groups: Record<string, any[]> = {};
      items.forEach(item => {
        if (!groups[item.separacao_id]) {
          groups[item.separacao_id] = [];
        }
        groups[item.separacao_id].push(item);
      });
      
      setSeparationGroups(groups);
      setIsLoading(false);
    };
    
    loadRejectedItems();
  }, []);

  if (isLoading) {
    return (
      <main className="container-fluid p-0 max-w-full">
        <BluebayMenu />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/client-area/bluebay/aprovacao-financeira">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Separações Reprovadas</h1>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600 text-lg">Carregando separações reprovadas...</p>
          </div>
        </div>
      </main>
    );
  }

  if (Object.keys(separationGroups).length === 0) {
    return (
      <main className="container-fluid p-0 max-w-full">
        <BluebayMenu />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/client-area/bluebay/aprovacao-financeira">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Separações Reprovadas</h1>
          </div>
          
          <div className="py-12 text-center">
            <p className="text-gray-600 text-lg">Nenhuma separação reprovada encontrada.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayMenu />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <Link to="/client-area/bluebay/aprovacao-financeira">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Separações Reprovadas</h1>
        </div>
        
        <div className="space-y-6">
          {Object.entries(separationGroups).map(([separationId, items]) => {
            const firstItem = items[0];
            const totalValue = items.reduce((sum, item) => sum + item.valor_total, 0);
            
            return (
              <Card key={separationId} className="border-red-200">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">
                        Cliente: {firstItem.cliente_nome}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm px-2 py-1 bg-red-100 text-red-800 rounded">
                          Reprovado
                        </span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(firstItem.separacao_data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      ID da separação: {separationId}
                    </p>
                    <p className="text-sm font-medium">
                      Valor total: {totalValue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </p>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Valor Unitário</TableHead>
                          <TableHead className="text-right">Valor Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={`${separationId}-${item.item_codigo}`}>
                            <TableCell className="font-medium">{item.pedido || "-"}</TableCell>
                            <TableCell>{item.item_codigo}</TableCell>
                            <TableCell>{item.descricao}</TableCell>
                            <TableCell className="text-right">{item.quantidade_pedida}</TableCell>
                            <TableCell className="text-right">
                              {Number(item.valor_unitario).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              {Number(item.valor_total).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default RejectedSeparations;
