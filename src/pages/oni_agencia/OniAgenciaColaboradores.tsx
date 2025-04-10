
import { useState } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { UserPlus } from "lucide-react";
import { OniAgenciaCollaborator, CollaboratorFormData } from "@/types/oni-agencia";
import { CollaboratorForm } from "@/components/oni_agencia/collaborator/CollaboratorForm";
import { CollaboratorList } from "@/components/oni_agencia/collaborator/CollaboratorList";
import { 
  useCollaborators, 
  useCreateCollaborator, 
  useUpdateCollaborator, 
  useDeleteCollaborator 
} from "@/hooks/useOniAgenciaCollaborators";

const OniAgenciaColaboradores = () => {
  const [editingCollaborator, setEditingCollaborator] = useState<OniAgenciaCollaborator | null>(null);
  
  const { data: collaborators = [], isLoading } = useCollaborators();
  const createMutation = useCreateCollaborator();
  const updateMutation = useUpdateCollaborator();
  const deleteMutation = useDeleteCollaborator();

  const handleSubmit = async (data: CollaboratorFormData) => {
    if (editingCollaborator) {
      await updateMutation.mutateAsync({ id: editingCollaborator.id, collaborator: data });
      setEditingCollaborator(null);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (collaborator: OniAgenciaCollaborator) => {
    setEditingCollaborator(collaborator);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    // If deleting the collaborator that's being edited, clear the form
    if (editingCollaborator?.id === id) {
      setEditingCollaborator(null);
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
          <UserPlus className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Cadastro de Colaboradores</h1>
        </div>
        
        <div className="space-y-6">
          {/* Form Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">
              {editingCollaborator ? "Editar Colaborador" : "Novo Colaborador"}
            </h2>
            <CollaboratorForm 
              onSubmit={handleSubmit} 
              collaborator={editingCollaborator || undefined} 
              isSubmitting={isSubmitting} 
            />
          </div>

          {/* Collaborator List Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Colaboradores Cadastrados</h2>
            <CollaboratorList
              collaborators={collaborators}
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

export default OniAgenciaColaboradores;
