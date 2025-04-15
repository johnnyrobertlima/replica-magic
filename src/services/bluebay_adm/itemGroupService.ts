
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
  },
  { 
    GRU_CODIGO: "005", 
    GRU_DESCRICAO: "Meias", 
    empresa: "Bluebay", 
    ativo: true 
  },
  { 
    GRU_CODIGO: "006", 
    GRU_DESCRICAO: "Bolsas", 
    empresa: "BK", 
    ativo: true 
  },
  { 
    GRU_CODIGO: "007", 
    GRU_DESCRICAO: "Cintos", 
    empresa: "JAB", 
    ativo: true 
  },
  { 
    GRU_CODIGO: "008", 
    GRU_DESCRICAO: "Chapéus", 
    empresa: "Bluebay", 
    ativo: true 
  }
];

export const fetchGroups = async (): Promise<any[]> => {
  console.info("Buscando todos os grupos...");
  
  // Simulate API call delay with a very short delay for better responsiveness
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.info(`Total de grupos: ${mockGroups.length}`);
  
  // Return a copy of the array to avoid reference issues
  return [...mockGroups];
};

export const saveGroup = async (groupData: any): Promise<void> => {
  console.info("Salvando grupo:", groupData);
  
  // Simulate API call delay with a short delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // If it's an update, find and update the item in mockGroups
  if (groupData.GRU_CODIGO) {
    const index = mockGroups.findIndex(g => g.GRU_CODIGO === groupData.GRU_CODIGO);
    if (index >= 0) {
      mockGroups[index] = { ...groupData };
    }
  } else {
    // For a new group, generate a new ID and add to mockGroups
    const newId = String(parseInt(mockGroups[mockGroups.length - 1].GRU_CODIGO) + 1).padStart(3, '0');
    const newGroup = {
      ...groupData,
      GRU_CODIGO: newId
    };
    mockGroups.push(newGroup);
  }
  
  console.info("Grupo salvo com sucesso:", groupData);
  
  return;
};
