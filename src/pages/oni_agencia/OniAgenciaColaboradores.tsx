
import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";

const OniAgenciaColaboradores = () => {
  const [editingCollaborator, setEditingCollaborator] = useState<OniAgenciaCollaborator | null>(null);
  const { toast } = useToast();
  
  const { data: collaborators = [], isLoading } = useCollaborators();
  const createMutation = useCreateCollaborator();
  const updateMutation = useUpdateCollaborator();
  const deleteMutation = useDeleteCollaborator();

  const handleSubmit = async (data: CollaboratorFormData) => {
    try {
      if (editingCollaborator) {
        console.log("Updating collaborator:", editingCollaborator.id, data);
        await updateMutation.mutateAsync({ id: editingCollaborator.id, collaborator: data });
        setEditingCollaborator(null);
        toast({
          title: "Colaborador atualizado",
          description: "O colaborador foi atualizado com sucesso.",
        });
      } else {
        console.log("Creating new collaborator:", data);
        await createMutation.mutateAsync(data);
        toast({
          title: "Colaborador criado",
          description: "O colaborador foi criado com sucesso.",
        });
      }
    } catch (error) {
      console.error("Error submitting collaborator:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o colaborador.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (collaborator: OniAgenciaCollaborator) => {
    console.log("Editing collaborator:", collaborator);
    setEditingCollaborator(collaborator);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try {
      // If deleting the collaborator that's being edited, clear the form
      if (editingCollaborator?.id === id) {
        setEditingCollaborator(null);
      }
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Colaborador excluído",
        description: "O colaborador foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting collaborator:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o colaborador.",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Debugging output
  useEffect(() => {
    console.log("Current editing collaborator:", editingCollaborator);
  }, [editingCollaborator]);

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
              {editingCollaborator ? `Editar Colaborador: ${editingCollaborator.name}` : "Novo Colaborador"}
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
