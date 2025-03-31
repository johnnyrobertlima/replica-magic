
import React, { useEffect, useState } from "react";

interface FinancialSummaryProps {
  filteredTitles: any[];
  selectedClient: string | null;
  onSummaryCalculated: (summary: {
    totalValoresVencidos: number;
    totalPago: number;
    totalEmAberto: number;
  }) => void;
}

export const FinancialSummaryCalculator: React.FC<FinancialSummaryProps> = ({
  filteredTitles,
  selectedClient,
  onSummaryCalculated
}) => {
  // Calcular o resumo financeiro baseado nos títulos filtrados
  useEffect(() => {
    const today = new Date();
    let totalPago = 0;
    let totalEmAberto = 0;
    let totalValoresVencidos = 0;

    // Obter os títulos que devem ser considerados (todos filtrados ou apenas os do cliente)
    const titlesToCalculate = selectedClient 
      ? filteredTitles.filter(title => String(title.PES_CODIGO) === selectedClient)
      : filteredTitles;
    
    // Processar títulos para cálculo de resumo, excluindo títulos cancelados (status '4')
    titlesToCalculate
      .filter(title => title.STATUS !== '4') // Excluir títulos cancelados
      .forEach(title => {
        const vencimentoDate = title.DTVENCIMENTO ? new Date(title.DTVENCIMENTO) : null;
        const vlrTitulo = title.VLRTITULO || 0;
        const vlrSaldo = title.VLRSALDO || 0;
        
        // Verificar se o título está pago
        if (title.STATUS === '3') { // Status 3 = Pago
          totalPago += vlrTitulo;
        } else {
          // Adicionar ao total em aberto se não estiver pago
          totalEmAberto += vlrSaldo;
          
          // Verificar se está vencido (data de vencimento está no passado)
          if (vencimentoDate && vencimentoDate < today) {
            totalValoresVencidos += vlrSaldo;
          }
        }
      });

    onSummaryCalculated({
      totalValoresVencidos,
      totalPago,
      totalEmAberto
    });
  }, [filteredTitles, selectedClient, onSummaryCalculated]);

  return null; // Este é um componente funcional sem renderização
};
