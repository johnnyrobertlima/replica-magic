
import { useClientCRUD } from "./useClientCRUD";
import { useClientSearch } from "./useClientSearch";
import { useClientForm } from "./useClientForm";

export type { BkClient } from "@/types/bk/client";

export const useClients = () => {
  const { clients, isLoading, fetchClients, handleDelete } = useClientCRUD();
  const { searchTerm, setSearchTerm, filteredClients } = useClientSearch(clients);
  const { 
    isFormOpen,
    setIsFormOpen,
    currentClient,
    formData,
    isSubmitting,
    handleEdit,
    handleCreate,
    handleSubmit,
    handleInputChange,
    handleCheckboxChange,
    handleNumberChange,
  } = useClientForm(clients, fetchClients);

  return {
    clients,
    filteredClients, 
    searchTerm, 
    setSearchTerm,
    isLoading, 
    isFormOpen, 
    setIsFormOpen,
    currentClient, 
    formData, 
    isSubmitting,
    handleEdit, 
    handleCreate, 
    handleDelete, 
    handleSubmit,
    handleInputChange,
    handleCheckboxChange,
    handleNumberChange,
  };
};
