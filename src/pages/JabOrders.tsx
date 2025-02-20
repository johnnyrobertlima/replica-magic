
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useJabOrders } from "@/hooks/useJabOrders";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const JabOrders = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  
  const { data: orders = [], isLoading } = useJabOrders(date);

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map((order) => (
          <Card 
            key={`${order.MATRIZ}-${order.FILIAL}-${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <CardTitle className="text-lg">
                Pedido #{order.PED_NUMPEDIDO}
              </CardTitle>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default JabOrders;
