
import { useState, useEffect } from "react";
import { ClientOrderGroup } from "@/types/clientOrders";
import { JabOrdersResponse } from "@/types/jabOrders";
import { groupOrdersByClient } from "@/utils/clientOrdersUtils";
import { enhanceGroupsWithRepresentanteNames } from "@/utils/representativeUtils";

export const useBkGroupProcessing = (ordersData: JabOrdersResponse) => {
  // State to hold the processed groups
  const [processedGroups, setProcessedGroups] = useState<Record<string, ClientOrderGroup>>({});
  const [isProcessingGroups, setIsProcessingGroups] = useState(false);

  // Group orders by client and process them
  useEffect(() => {
    if (!ordersData || !ordersData.orders || ordersData.orders.length === 0) {
      setProcessedGroups({});
      return;
    }
    
    console.log(`Processando ${ordersData.orders.length} pedidos BK para criar grupos de clientes`);
    
    const processGroups = async () => {
      try {
        setIsProcessingGroups(true);
        
        // First group the orders by client - now this is async to fetch overdue data
        const processableOrdersData = {
          orders: ordersData.orders,
          totalCount: ordersData.totalCount,
          itensSeparacao: ordersData.itensSeparacao || {}
        };
        
        const groups = await groupOrdersByClient(processableOrdersData);
        
        // Then enhance the groups with representative names
        const enhancedGroups = await enhanceGroupsWithRepresentanteNames(groups);
        
        // Store the processed groups in state
        setProcessedGroups(enhancedGroups);
      } catch (error) {
        console.error("Erro ao processar grupos de pedidos BK:", error);
        setProcessedGroups({});
      } finally {
        setIsProcessingGroups(false);
      }
    };
    
    processGroups();
  }, [ordersData]);

  return {
    processedGroups,
    isProcessingGroups
  };
};
