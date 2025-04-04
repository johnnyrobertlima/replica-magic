
import { StockItem } from "./types";

// Generate realistic sample data for preview purposes
export const generateSampleStockData = (): StockItem[] => {
  console.log("Gerando dados de exemplo para análise estoque-vendas");
  
  const groups = ["CONEXÕES", "TUBOS", "VÁLVULAS", "FLANGES", "INSTRUMENTOS", "ACESSÓRIOS"];
  const sampleItems: StockItem[] = [];
  
  // Generate 20 sample items
  for (let i = 1; i <= 20; i++) {
    const groupIndex = i % groups.length;
    const isNewProduct = i % 5 === 0;
    const isTopSeller = i <= 3;
    const fisico = Math.floor(Math.random() * 500) + 10;
    const vendido = Math.floor(Math.random() * 300);
    const valorUnitario = Math.round((Math.random() * 1000 + 50) * 100) / 100;
    const custoMedio = valorUnitario * 0.6; // 60% of sale price for sample data
    const valorVendido = vendido * valorUnitario;
    const custoTotal = vendido * custoMedio;
    const lucro = valorVendido - custoTotal;
    
    sampleItems.push({
      ITEM_CODIGO: `ITEM${i.toString().padStart(5, '0')}`,
      DESCRICAO: `${groups[groupIndex]} - Item de amostra ${i}`,
      GRU_DESCRICAO: groups[groupIndex],
      DATACADASTRO: isNewProduct ? new Date().toISOString() : new Date(2022, 0, 1).toISOString(),
      FISICO: fisico,
      DISPONIVEL: Math.max(0, fisico - Math.floor(Math.random() * 20)),
      RESERVADO: Math.floor(Math.random() * 20),
      ENTROU: Math.floor(Math.random() * 200) + 50,
      LIMITE: 100,
      QTD_VENDIDA: vendido,
      VALOR_TOTAL_VENDIDO: valorVendido,
      PRECO_MEDIO: valorUnitario,
      DATA_ULTIMA_VENDA: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      GIRO_ESTOQUE: fisico > 0 ? vendido / fisico : 0,
      PERCENTUAL_ESTOQUE_VENDIDO: (vendido + fisico) > 0 ? (vendido / (vendido + fisico)) * 100 : 0,
      DIAS_COBERTURA: vendido > 0 ? fisico / (vendido / 90) : fisico > 0 ? 999 : 0,
      PRODUTO_NOVO: isNewProduct,
      RANKING: isTopSeller ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 50) + 11,
      CUSTO_MEDIO: custoMedio,
      LUCRO: lucro
    });
  }
  
  // Set isSampleData flag for UI indication
  return sampleItems.map(item => ({ ...item, isSampleData: true }));
};
