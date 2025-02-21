
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useJabOrders } from "./useJabOrders";
import type { ClientOrder } from "@/components/jab-orders-by-client/types";

export function useClientOrders() {
  const hoje = new Date();
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(hoje.getDate() - 30);

  const [date, setDate] = useState<DateRange | undefined>({
    from: trintaDiasAtras,
    to: hoje,
  });
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(date);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: orders = [], isLoading } = useJabOrders(searchDate);

  const handleSearch = () => {
    setIsSearching(true);
    setSearchDate(date);
    setCurrentPage(1);
  };

  // Group orders by client
  const clientOrders = orders.reduce<Record<string, ClientOrder>>((acc, order) => {
    const pesCodigoKey = order.PES_CODIGO ? order.PES_CODIGO.toString() : 'NAO_IDENTIFICADO';

    if (!acc[pesCodigoKey]) {
      acc[pesCodigoKey] = {
        PES_CODIGO: order.PES_CODIGO || 0,
        total_saldo: 0,
        valor_total: 0,
        pedidos: [],
        items: []
      };
    }

    const clientOrder = acc[pesCodigoKey];
    
    clientOrder.pedidos.push(order);
    clientOrder.total_saldo += order.QTDE_SALDO || 0;
    clientOrder.valor_total += order.valor_total || 0;

    if (order.ITEM_CODIGO) {
      // Check if the item already exists to avoid duplicates
      const existingItemIndex = clientOrder.items.findIndex(
        item => item.ITEM_CODIGO === order.ITEM_CODIGO && 
                item.PED_NUMPEDIDO === order.PED_NUMPEDIDO
      );

      if (existingItemIndex === -1) {
        clientOrder.items.push({
          ITEM_CODIGO: order.ITEM_CODIGO,
          DESCRICAO: order.DESCRICAO || null,
          QTDE_SALDO: order.QTDE_SALDO || 0,
          QTDE_PEDIDA: order.QTDE_PEDIDA || 0,
          QTDE_ENTREGUE: order.QTDE_ENTREGUE || 0,
          VALOR_UNITARIO: order.VALOR_UNITARIO || 0,
          PED_NUMPEDIDO: order.PED_NUMPEDIDO
        });
      }
    }

    return acc;
  }, {});

  const filteredClients = Object.values(clientOrders).filter(client => {
    if (!isSearching) return true; // Changed back to true to show initial results
    
    if (searchQuery) {
      return (
        client.PES_CODIGO.toString().includes(searchQuery) ||
        client.items.some(item => 
          item.ITEM_CODIGO.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    }
    return true;
  });

  return {
    date,
    setDate,
    searchQuery,
    setSearchQuery,
    handleSearch,
    filteredClients,
    isLoading,
    currentPage,
    setCurrentPage
  };
}
