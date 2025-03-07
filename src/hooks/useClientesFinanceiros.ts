
import { useState, useEffect, useCallback } from "react";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TituloFinanceiro {
  PES_CODIGO: string | number;
  VLRTITULO: number;
  VLRDESCONTO: number;
  VLRABATIMENTO: number;
  VLRSALDO: number;
  DTVENCIMENTO: string;
  STATUS: string;
}

export interface ClienteFinanceiro {
  PES_CODIGO: number;
  APELIDO: string | null;
  volume_saudavel_faturamento: number | null;
  valoresTotais: number;
  valoresEmAberto: number;
  valoresVencidos: number;
  separacoes: any[]; // Separações associadas a este cliente
}

export const useClientesFinanceiros = () => {
  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();
  const { toast } = useToast();
  const [clientesFinanceiros, setClientesFinanceiros] = useState<ClienteFinanceiro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenCards, setHiddenCards] = useState<Set<string>>(new Set());

  // Get separações pendentes
  const getSeparacoesPendentes = useCallback(() => {
    const pendentes = separacoes
      .filter(sep => sep.status === 'pendente')
      .filter(sep => !hiddenCards.has(sep.id));
    
    return pendentes;
  }, [separacoes, hiddenCards]);

  // Get unique client codes
  const getClientesCodigos = useCallback((sepPendentes: any[]) => {
    const codigos = sepPendentes
      .map(sep => sep.cliente_codigo)
      .filter((value, index, self) => self.indexOf(value) === index);
    
    return codigos;
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
    try {
      const { error } = await supabase
        .from('BLUEBAY_PESSOA')
        .update({ volume_saudavel_faturamento: valor })
        .eq('PES_CODIGO', clienteCodigo);
      
      if (error) throw error;
      
      // Update local state
      setClientesFinanceiros(prev => 
        prev.map(cliente => 
          cliente.PES_CODIGO === clienteCodigo
            ? { ...cliente, volume_saudavel_faturamento: valor } 
            : cliente
        )
      );
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar volume saudável:", error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        
        const separacoesPendentes = getSeparacoesPendentes();
        const clientesCodigos = getClientesCodigos(separacoesPendentes);

        if (clientesCodigos.length === 0) {
          setClientesFinanceiros([]);
          setIsLoading(false);
          return;
        }

        // Fetch financial titles
        const { data: titulos, error: titulosError } = await supabase
          .from('BLUEBAY_TITULO')
          .select('*')
          .in('PES_CODIGO', clientesCodigos.map(String))
          .in('STATUS', ['1', '2', '3']);

        if (titulosError) throw titulosError;

        // Fetch client info
        const { data: clientes, error: clientesError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, APELIDO, volume_saudavel_faturamento')
          .in('PES_CODIGO', clientesCodigos);

        if (clientesError) throw clientesError;

        // Current date for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Group titles by client
        const clientesMap = new Map<number, ClienteFinanceiro>();

        if (clientes) {
          clientes.forEach(cliente => {
            if (cliente.PES_CODIGO) {
              // Find separations for this client
              const clienteSeparacoes = separacoesPendentes.filter(
                sep => sep.cliente_codigo === cliente.PES_CODIGO
              );
              
              clientesMap.set(cliente.PES_CODIGO, {
                PES_CODIGO: cliente.PES_CODIGO,
                APELIDO: cliente.APELIDO,
                volume_saudavel_faturamento: cliente.volume_saudavel_faturamento,
                valoresTotais: 0,
                valoresEmAberto: 0,
                valoresVencidos: 0,
                separacoes: clienteSeparacoes
              });
            }
          });
        }

        // Calculate values for each client
        if (titulos) {
          titulos.forEach((titulo: TituloFinanceiro) => {
            const pesCodigoNumerico = typeof titulo.PES_CODIGO === 'string' 
              ? parseInt(titulo.PES_CODIGO, 10) 
              : titulo.PES_CODIGO;
            
            if (isNaN(pesCodigoNumerico) || !clientesMap.has(pesCodigoNumerico)) return;

            const cliente = clientesMap.get(pesCodigoNumerico)!;
            
            // Total values = VLRTITULO - VLRDESCONTO - VLRABATIMENTO
            const valorTotal = (titulo.VLRTITULO || 0) - (titulo.VLRDESCONTO || 0) - (titulo.VLRABATIMENTO || 0);
            cliente.valoresTotais += valorTotal;
            
            // Open values = VLRSALDO
            cliente.valoresEmAberto += (titulo.VLRSALDO || 0);
            
            // Overdue values = VLRSALDO of overdue titles
            if (titulo.DTVENCIMENTO) {
              const vencimento = new Date(titulo.DTVENCIMENTO);
              if (vencimento < today) {
                cliente.valoresVencidos += (titulo.VLRSALDO || 0);
              }
            }
          });
        }

        // Convert map to array
        const clientesArray = Array.from(clientesMap.values());
        
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
  }, [getSeparacoesPendentes, getClientesCodigos, toast]);

  return {
    clientesFinanceiros,
    isLoading,
    isLoadingSeparacoes,
    hideCard,
    updateVolumeSaudavel
  };
};
