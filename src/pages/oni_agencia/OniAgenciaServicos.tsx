
import { useState } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { FileSpreadsheet } from "lucide-react";
import { OniAgenciaService, ServiceFormData } from "@/types/oni-agencia";
import { ServiceForm } from "@/components/oni_agencia/service/ServiceForm";
import { ServiceList } from "@/components/oni_agencia/service/ServiceList";
import { 
  useServices, 
  useCreateService, 
  useUpdateService, 
  useDeleteService 
} from "@/hooks/useOniAgenciaServices";

const OniAgenciaServicos = () => {
  const [editingService, setEditingService] = useState<OniAgenciaService | null>(null);
  
  const { data: services = [], isLoading } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const handleSubmit = async (data: ServiceFormData) => {
    if (editingService) {
      await updateMutation.mutateAsync({ id: editingService.id, service: data });
      setEditingService(null);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (service: OniAgenciaService) => {
    setEditingService(service);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    // If deleting the service that's being edited, clear the form
    if (editingService?.id === id) {
      setEditingService(null);
    }
    await deleteMutation.mutateAsync(id);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-2 mb-6">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Cadastro de Serviços</h1>
        </div>
        
        <div className="space-y-6">
          {/* Form Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </h2>
            <ServiceForm 
              onSubmit={handleSubmit} 
              service={editingService || undefined} 
              isSubmitting={isSubmitting} 
            />
          </div>

          {/* Service List Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Serviços Cadastrados</h2>
            <ServiceList
              services={services}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
              isDeleting={isDeleting}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default OniAgenciaServicos;
