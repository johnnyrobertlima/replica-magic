import { useState, useMemo } from "react";
import { BkClient } from "@/types/bk/client";

export const useClientSearch = (clients: BkClient[]) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Prioritize APELIDO in search
      const apelidoMatch = client.APELIDO?.toLowerCase().includes(searchLower) || false;
      
      // If APELIDO matches, return immediately
      if (apelidoMatch) return true;
      
      // Otherwise check other fields
      return (
        (client.RAZAOSOCIAL?.toLowerCase().includes(searchLower) || false) ||
        (client.CNPJCPF?.toLowerCase().includes(searchLower) || false) ||
        String(client.PES_CODIGO).includes(searchTerm)
      );
    });
  }, [clients, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredClients
  };
};
