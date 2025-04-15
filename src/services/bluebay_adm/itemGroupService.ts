
export const fetchEmpresas = async (): Promise<string[]> => {
  console.info("Buscando todas as empresas...");
  
  // Return the hardcoded list of companies
  const empresas = ["Bluebay", "BK", "JAB", "nao_definida"];
  
  console.info(`Total de empresas: ${empresas.length}`);
  
  return empresas.sort();
};

// Mock data for groups - this would be replaced with actual API calls in production
const mockGroups = [
  { 
    GRU_CODIGO: "001", 
    GRU_DESCRICAO: "Calçados", 
    empresa: "Bluebay", 
    ativo: true 
  },
  { 
    GRU_CODIGO: "002", 
    GRU_DESCRICAO: "Roupas", 
    empresa: "BK", 
    ativo: true 
  },
  { 
    GRU_CODIGO: "003", 
    GRU_DESCRICAO: "Acessórios", 
    empresa: "JAB", 
    ativo: true 
  },
  { 
    GRU_CODIGO: "004", 
    GRU_DESCRICAO: "Calçados Infantis", 
    empresa: "Bluebay", 
    ativo: false 
  }
];

export const fetchGroups = async (): Promise<any[]> => {
  console.info("Buscando todos os grupos...");
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.info(`Total de grupos com dados (potencialmente duplicados): ${mockGroups.length}`);
  console.info(`Total de grupos únicos após processamento: ${mockGroups.length}`);
  
  return mockGroups;
};

export const saveGroup = async (groupData: any): Promise<void> => {
  console.info("Salvando grupo:", groupData);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // In a real application, this would send the data to an API
  console.info("Grupo salvo com sucesso:", groupData);
  
  return;
};
