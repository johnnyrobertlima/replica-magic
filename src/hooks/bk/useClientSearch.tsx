
import { useState, useMemo } from "react";
import { BkClient } from "@/types/bk/client";

export const useClientSearch = (clients: BkClient[]) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    
    const searchTerms = searchTerm.toLowerCase().trim().split(/\s+/);
    
    return clients.filter(client => {
      // Normalize strings to improve search
      const normalizeString = (str: string | null | undefined): string => {
        return (str || "").toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
      };
      
      const apelidoNormalized = normalizeString(client.APELIDO);
      const razaoSocialNormalized = normalizeString(client.RAZAOSOCIAL);
      const cnpjCpfNormalized = normalizeString(client.CNPJCPF);
      const codigoStr = String(client.PES_CODIGO);
      
      // Check if ANY search terms match at least one of the fields (more permissive)
      return searchTerms.some(term => {
        return codigoStr.includes(term) ||
               apelidoNormalized.includes(term) ||
               razaoSocialNormalized.includes(term) || 
               cnpjCpfNormalized.includes(term);
      });
    });
  }, [clients, searchTerm]);

  // Log search results for debugging
  useMemo(() => {
    if (searchTerm.trim()) {
      console.log(`Busca por "${searchTerm}" encontrou ${filteredClients.length} resultados`);
      if (filteredClients.length < 10) {
        console.log("Resultados:", filteredClients.map(c => ({ 
          codigo: c.PES_CODIGO, 
          apelido: c.APELIDO, 
          razaoSocial: c.RAZAOSOCIAL 
        })));
      }
    }
  }, [searchTerm, filteredClients]);

  return {
    searchTerm,
    setSearchTerm,
    filteredClients
  };
};
