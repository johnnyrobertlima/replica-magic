
import { updateVolumeSaudavel as updateVolumeSaudavelUtil } from "@/utils/financialUtils";
import { ClienteFinanceiro } from "@/types/financialClient";

export const useVolumeSaudavel = (
  setClientesFinanceiros: React.Dispatch<React.SetStateAction<ClienteFinanceiro[]>>
) => {
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

  return {
    updateVolumeSaudavel
  };
};
