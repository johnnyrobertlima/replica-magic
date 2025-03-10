
import { useState, useEffect, useCallback } from "react";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { useToast } from "@/hooks/use-toast";
import { ClienteFinanceiro } from "@/types/financialClient";
import { getSeparacoesPendentes, getClientesCodigos, updateVolumeSaudavel as updateVolumeSaudavelUtil } from "@/utils/financialUtils";
import { 
  fetchFinancialTitles, 
  fetchClientInfo, 
  fetchPedidosForRepresentantes, 
  fetchRepresentantesInfo,
  processClientsData
} from "@/services/financialService";

export type { ClienteFinanceiro } from "@/types/financialClient";

export const useClientesFinanceiros = () => {
  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();
  const { toast } = useToast();
  const [clientesFinanceiros, setClientesFinanceiros] = useState<ClienteFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());

  // Get separações pendentes with memoization
  const getSeparacoesPendentesCallback = useCallback(() => {
    return getSeparacoesPendentes(separacoes, hiddenCards);
  }, [separacoes, hiddenCards]);

  // Get unique client codes with memoization
  const getClientesCodigosCallback = useCallback((sepPendentes: any[]) => {
    return getClientesCodigos(sepPendentes);
  }, []);

  // Hide a card
  const hideCard = (id: string) => {
    setHiddenCards(current => {
      const newSet = new Set(current);
      newSet.add(id);
      return newSet;
    });
  };

  // Update volume saudavel
  const updateVolumeSaudavel = async (clienteCodigo: number, valor: number) => {
    const result = await updateVolumeSaudavelUtil(clienteCodigo, valor);
    
    if (result.success) {
      // Update local state
      setClientesFinanceiros(prev => 
        prev.map(cliente => 
          cliente.PES_CODIGO === clienteCodigo
            ? { ...cliente, volume_saudavel_faturamento: valor } 
            : cliente
        )
      );
    }
    
    return result;
  };

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        
        const separacoesPendentes = getSeparacoesPendentesCallback();
        const clientesCodigos = getClientesCodigosCallback(separacoesPendentes);

        if (clientesCodigos.length === 0) {
          setClientesFinanceiros([]);
          setIsLoading(false);
          return;
        }

        // Fetch financial titles
        const titulos = await fetchFinancialTitles(clientesCodigos);

        // Fetch client info
        const clientes = await fetchClientInfo(clientesCodigos);

        // Map clients to their separacoes
        const clienteSeparacoes: Record<number, any[]> = {};
        separacoesPendentes.forEach(sep => {
          if (!clienteSeparacoes[sep.cliente_codigo]) {
            clienteSeparacoes[sep.cliente_codigo] = [];
          }
          clienteSeparacoes[sep.cliente_codigo].push(sep);
        });

        // Get unique pedido numbers from separações
        const numeroPedidos = separacoesPendentes
          .flatMap(sep => sep.separacao_itens.map((item: any) => item.pedido))
          .filter((value, index, self) => self.indexOf(value) === index);

        // Initialize maps for representantes
        const representantesCodigos = new Set<number>();
        const clienteToRepresentanteMap = new Map<number, number>();
        const representantesInfo = new Map<number, string>();

        if (numeroPedidos.length > 0) {
          // Fetch pedidos to get representantes
          const pedidos = await fetchPedidosForRepresentantes(numeroPedidos);

          if (pedidos && pedidos.length > 0) {
            // Map each cliente to their representante
            pedidos.forEach(pedido => {
              if (pedido.REPRESENTANTE) {
                representantesCodigos.add(pedido.REPRESENTANTE);
                
                // Find the separação with this pedido
                separacoesPendentes.forEach(sep => {
                  if (sep.separacao_itens.some((item: any) => item.pedido === pedido.PED_NUMPEDIDO)) {
                    clienteToRepresentanteMap.set(sep.cliente_codigo, pedido.REPRESENTANTE);
                  }
                });
              }
            });

            // Fetch representantes info if we have any
            if (representantesCodigos.size > 0) {
              const representantes = await fetchRepresentantesInfo(Array.from(representantesCodigos));

              if (representantes) {
                representantes.forEach(rep => {
                  representantesInfo.set(rep.PES_CODIGO, rep.RAZAOSOCIAL);
                });
              }
            }
          }
        }

        // Create today's date with hours set to 0 to compare only dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Process and set clients data
        const clientesArray = processClientsData(
          clientes, 
          clienteSeparacoes, 
          clienteToRepresentanteMap, 
          representantesInfo,
          titulos,
          today
        );
        
        setClientesFinanceiros(clientesArray);
      } catch (error) {
        console.error("Erro ao buscar dados financeiros:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados financeiros.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [getSeparacoesPendentesCallback, getClientesCodigosCallback, toast]);

  return {
    clientesFinanceiros,
    isLoading,
    isLoadingSeparacoes,
    hideCard,
    updateVolumeSaudavel
  };
};
