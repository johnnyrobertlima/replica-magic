
export const fetchEmpresas = async (): Promise<string[]> => {
  console.info("Buscando todas as empresas...");
  
  // Directly return the hardcoded list of companies
  const empresas = ["Bluebay", "BK", "JAB", "nao_definida"];
  
  console.info(`Total de empresas: ${empresas.length}`);
  
  return empresas.sort();
};
