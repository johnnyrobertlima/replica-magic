
import React, { createContext, useContext } from "react";
import { BkClient } from "@/hooks/bk/useClients";

interface ClientFormContextType {
  formData: Partial<BkClient>;
  isSubmitting: boolean;
  currentClient: BkClient | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean, empresa: string) => void;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => void;
}

const ClientFormContext = createContext<ClientFormContextType | undefined>(undefined);

export const ClientFormProvider: React.FC<{
  children: React.ReactNode;
  value: ClientFormContextType;
}> = ({ children, value }) => {
  return (
    <ClientFormContext.Provider value={value}>
      {children}
    </ClientFormContext.Provider>
  );
};

export const useClientForm = () => {
  const context = useContext(ClientFormContext);
  if (context === undefined) {
    throw new Error("useClientForm must be used within a ClientFormProvider");
  }
  return context;
};
