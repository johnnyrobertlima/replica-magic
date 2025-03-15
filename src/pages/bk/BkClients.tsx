
import { BkMenu } from "@/components/bk/BkMenu";
import { ClientList } from "@/components/bk/clients/ClientList";
import { ClientForm } from "@/components/bk/clients/ClientForm";
import { ClientSearchHeader } from "@/components/bk/clients/ClientSearchHeader";
import { useClients } from "@/hooks/bk/useClients";

const BkClients = () => {
  const { 
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
  } = useClients();

  return (
    <main className="container-fluid p-0 max-w-full">
      <BkMenu />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Gestão de Clientes</h1>

          <ClientSearchHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateNew={handleCreate}
          />

          <ClientList 
            clients={filteredClients}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <ClientForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        isSubmitting={isSubmitting}
        currentClient={currentClient}
        formData={formData}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onCheckboxChange={handleCheckboxChange}
        onNumberChange={handleNumberChange}
      />
    </main>
  );
};

export default BkClients;
