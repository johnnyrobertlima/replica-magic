
/**
 * Processa os dados de faturamento e agrupa por item
 */
export const processFaturamentoData = async (data: any[]) => {
  try {
    console.log("Processando dados de faturamento em itens agrupados...");
    
    // Mapeia os códigos de itens únicos
    const itemCodes = [...new Set(data.filter(item => item.ITEM_CODIGO).map(item => item.ITEM_CODIGO))];
    console.log("Códigos de itens únicos encontrados:", itemCodes.length);
    
    if (itemCodes.length === 0) {
      console.log("Nenhum código de item encontrado para processar");
      return [];
    }
    
    // Agrupa os dados por item_codigo
    const groupedData = data.reduce((acc, item) => {
      if (!item.ITEM_CODIGO) return acc;
      
      if (!acc[item.ITEM_CODIGO]) {
        acc[item.ITEM_CODIGO] = {
          ITEM_CODIGO: item.ITEM_CODIGO,
          DESCRICAO: "",
          GRU_DESCRICAO: "Sem Grupo",
          TOTAL_QUANTIDADE: 0,
          TOTAL_VALOR: 0,
          OCORRENCIAS: 0
        };
      }
      
      acc[item.ITEM_CODIGO].TOTAL_QUANTIDADE += (item.QUANTIDADE || 0);
      acc[item.ITEM_CODIGO].TOTAL_VALOR += (item.VALOR_NOTA || 0);
      acc[item.ITEM_CODIGO].OCORRENCIAS += 1;
      
      return acc;
    }, {});
    
    // Converte o mapa em array para retornar
    const result = Object.values(groupedData);
    
    console.log("Itens processados:", result);
    return result;
  } catch (error) {
    console.error("Erro ao processar dados:", error);
    return [];
  }
};
