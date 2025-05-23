
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { OniAgenciaCollaborator } from "@/types/oni-agencia";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { appendToDescriptionHistory } from "@/utils/linkUtils";
import { toast } from "sonner";
import { StatusSelect } from "./StatusSelect";
import { CommentHistory } from "./CommentHistory";

interface StatusUpdateFormProps {
  statuses: any[];
  collaborators: OniAgenciaCollaborator[];
  value: string;
  collaboratorId: string | null;
  description: string;
  isLoading: boolean;
  isLoadingCollaborators: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onValueChange: (value: string) => void;
  onCollaboratorChange: (value: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCancel: () => void;
}

export function StatusUpdateForm({
  statuses,
  collaborators,
  value,
  collaboratorId,
  description,
  isLoading,
  isLoadingCollaborators,
  isSubmitting,
  onSubmit,
  onValueChange,
  onCollaboratorChange,
  onInputChange,
  onCancel
}: StatusUpdateFormProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || "Usuário";

  // Function to handle submission with comment history
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission to handle it manually
    
    try {
      console.log("Adding new comment to history:", newComment);
      
      let updatedDescription = description;
      
      // Only append new comment if there is one
      if (newComment.trim()) {
        // Create updated description with the new comment appended
        updatedDescription = appendToDescriptionHistory(description, newComment, userName);
        console.log("Updated description:", updatedDescription);
        
        // Create a synthetic event to update the description field
        const syntheticEvent = {
          target: {
            name: "description",
            value: updatedDescription
          }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        
        // Update the description field with the complete history
        onInputChange(syntheticEvent);
        
        // Wait a bit to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Log the current state for debugging
      console.log("Unified submission from status tab - all form data will be saved");
      
      // Submit the form using the unified submission function
      await onSubmit(e);
      
      // Clear the comment field after successful submission
      setNewComment("");
      
      // Provide feedback to the user
      toast.success("Agendamento atualizado com sucesso");
    } catch (error) {
      console.error("Error submitting update:", error);
      toast.error("Erro ao atualizar agendamento");
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status" className="text-base font-medium">
          Status
        </Label>
        <StatusSelect 
          statuses={statuses}
          value={value}
          isLoading={isLoading}
          onValueChange={onValueChange}
          required={true}
        />
      </div>

      <div className="space-y-2">
        <CollaboratorSelect
          collaborators={collaborators}
          isLoading={isLoadingCollaborators}
          value={collaboratorId || "null"}
          onValueChange={onCollaboratorChange}
          label="Colaborador Responsável"
          errorMessage="Erro ao carregar colaboradores"
        />
      </div>

      <CommentHistory description={description} />
      
      <div className="space-y-2">
        <Label htmlFor="newComment" className="text-base font-medium">
          Adicionar Comentário
        </Label>
        <Textarea
          id="newComment"
          name="newComment"
          placeholder="Adicione informações sobre esta atualização"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="button"
          disabled={isSubmitting}
          onClick={handleCommentSubmit}
        >
          {isSubmitting ? "Atualizando..." : "Atualizar Status"}
        </Button>
      </div>
    </div>
  );
}
