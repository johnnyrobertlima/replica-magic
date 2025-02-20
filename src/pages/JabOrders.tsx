
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Calendar as CalendarIcon, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useJabOrders } from "@/hooks/useJabOrders";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DateRange } from "react-day-picker";

const JabOrders = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { data: orders = [], isLoading } = useJabOrders(date);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "1":
        return "Aberto";
      case "2":
        return "Parcial";
      default:
        return "ERRO";
    }
  };

  const handleSearch = () => {
    setIsSearching(true);
  };

  const removeLeadingZeros = (str: string) => {
    return str.replace(/^0+/, '');
  };

  const filteredOrders = orders.filter(order => {
    if (!isSearching) return true;
    
    if (searchQuery) {
      const normalizedOrderNumber = removeLeadingZeros(order.PED_NUMPEDIDO);
      const normalizedSearchQuery = removeLeadingZeros(searchQuery);
      return normalizedOrderNumber.includes(normalizedSearchQuery);
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
        <h1 className="text-3xl font-bold">Separação de Pedidos JAB</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número do pedido"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal w-[300px]",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(date.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Pesquisar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const orderId = `${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
          const isExpanded = expandedOrder === orderId;

          return (
            <Card 
              key={orderId}
              className={cn(
                "hover:shadow-lg transition-all cursor-pointer",
                isExpanded && "ring-2 ring-primary col-span-full"
              )}
              onClick={() => toggleExpand(orderId)}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg">
                      Pedido #{order.PED_NUMPEDIDO}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      Status: {getStatusText(order.STATUS)}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Ano Base: {order.PED_ANOBASE}
                </p>
                {order.APELIDO && (
                  <p className="text-sm text-muted-foreground">
                    Cliente: {order.APELIDO}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantidade Saldo:</span>
                    <span className="font-medium">{order.total_saldo.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor Total:</span>
                    <span className="font-medium">
                      R$ {order.valor_total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-end items-center border-b pb-2">
                        <span className="text-sm font-semibold">Filial: {order.FILIAL}</span>
                      </div>
                      
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-4">Itens do Pedido</h4>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
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
                              {order.items?.map((item, index) => (
                                <TableRow key={`${item.ITEM_CODIGO}-${index}`}>
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

export default JabOrders;
