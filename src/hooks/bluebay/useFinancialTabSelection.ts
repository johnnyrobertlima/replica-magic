
import { useState } from "react";

export const useFinancialTabSelection = () => {
  const [activeTab, setActiveTab] = useState("titles");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const handleClientSelect = (clientCode: string) => {
    setSelectedClient(clientCode);
    setActiveTab("titles");
  };

  const handleResetClientSelection = () => {
    setSelectedClient(null);
  };

  return {
    activeTab,
    setActiveTab,
    selectedClient,
    handleClientSelect,
    handleResetClientSelection
  };
};
