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
  processClientsData,
  fetchValoresVencidos
} from "@/services/financialService";

export type { ClienteFinanceiro } from "@/types/financialClient";

export const useClientesFinanceiros = () => {
  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();
  const { toast } = useToast();
  const [clientesFinanceiros, setClientesFinanceiros] = useState<ClienteFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());

  const getSeparacoesPendentesCallback = useCallback(() => {
    return getSeparacoesPendentes(separacoes, hiddenCards);
  }, [separacoes, hiddenCards]);

  const getClientesCodigosCallback = useCallback((sepPendentes: any[]) => {
    return getClientesCodigos(sepPendentes);
  }, []);

  const hideCard = (id: string) => {
    setHiddenCards(current => {
      const newSet = new Set(current);
      newSet.add(id);
      return newSet;
    });
  };

  const updateVolumeSaudavel = async (clienteCodigo: number, valor: number) => {
    const result = await updateVolumeSaudavelUtil(clienteCodigo, valor);
    
    if (result.success) {
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

        const titulos = await fetchFinancialTitles(clientesCodigos);
        const clientes = await fetchClientInfo(clientesCodigos);

        const clienteSeparacoes: Record<number, any[]> = {};
        separacoesPendentes.forEach(sep => {
          if (!clienteSeparacoes[sep.cliente_codigo]) {
            clienteSeparacoes[sep.cliente_codigo] = [];
          }
          clienteSeparacoes[sep.cliente_codigo].push(sep);
        });

        const numeroPedidos = separacoesPendentes
          .flatMap(sep => sep.separacao_itens.map((item: any) => item.pedido))
          .filter((value, index, self) => self.indexOf(value) === index);

        const representantesCodigos = new Set<number>();
        const clienteToRepresentanteMap = new Map<number, number>();
        const representantesInfo = new Map<number, string>();

        if (numeroPedidos.length > 0) {
          const pedidos = await fetchPedidosForRepresentantes(numeroPedidos);

          if (pedidos && pedidos.length > 0) {
            pedidos.forEach(pedido => {
              if (pedido.REPRESENTANTE) {
                representantesCodigos.add(pedido.REPRESENTANTE);
                
                separacoesPendentes.forEach(sep => {
                  if (sep.separacao_itens.some((item: any) => item.pedido === pedido.PED_NUMPEDIDO)) {
                    clienteToRepresentanteMap.set(sep.cliente_codigo, pedido.REPRESENTANTE);
                  }
                });
              }
            });

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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const clientesArray = processClientsData(
          clientes, 
          clienteSeparacoes, 
          clienteToRepresentanteMap, 
          representantesInfo,
          titulos,
          today
        );
        
        console.log("Buscando valores vencidos para cada cliente...");
        
        for (const cliente of clientesArray) {
          console.log(`Processando cliente ${cliente.PES_CODIGO} (${cliente.APELIDO})`);
          const valorVencido = await fetchValoresVencidos(cliente.PES_CODIGO);
          console.log(`Cliente ${cliente.PES_CODIGO}: valor vencido = ${valorVencido}`);
          cliente.valoresVencidos = valorVencido;
          
          if (cliente.volume_saudavel_faturamento !== undefined && cliente.volumeSaudavel === undefined) {
            cliente.volumeSaudavel = cliente.volume_saudavel_faturamento;
          }
          console.log(`Cliente ${cliente.PES_CODIGO}: volume saudável = ${cliente.volumeSaudavel}`);
        }
        
        console.log("Clientes processados:", clientesArray);
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
