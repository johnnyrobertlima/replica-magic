
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { OniAgenciaCollaborator } from "@/types/oni-agencia";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { appendToDescriptionHistory, linkifyText } from "@/utils/linkUtils";

interface StatusSelectProps {
  statuses: any[];
  value: string;
  isLoading: boolean;
  onValueChange: (value: string) => void;
  required?: boolean;
}

function StatusSelect({
  statuses,
  value,
  isLoading,
  onValueChange,
  required = false
}: StatusSelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione um status" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Carregando...
          </SelectItem>
        ) : (
          statuses.map((status: any) => (
            <SelectItem key={status.id} value={status.id}>
              {status.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

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
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission to handle it manually
    
    if (newComment.trim()) {
      console.log("Adding new comment to history:", newComment);
      
      // Create updated description with the new comment appended
      const updatedDescription = appendToDescriptionHistory(description, newComment, userName);
      console.log("Updated description:", updatedDescription);
      
      // Create a synthetic event to update the hidden input
      const syntheticEvent = {
        target: {
          name: "description",
          value: updatedDescription
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      // Update the hidden field with the complete history
      onInputChange(syntheticEvent);
      
      // Clear the comment field after submitting
      setNewComment("");
      
      // Submit the form
      onSubmit(e);
    } else if (value) {
      // If no new comment but status changed, submit the form
      onSubmit(e);
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

      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          Histórico de Descrição
        </Label>
        {description && (
          <div 
            className="rounded-md border border-input bg-background p-3 text-sm text-muted-foreground h-[150px] overflow-y-auto whitespace-pre-wrap mb-2"
            dangerouslySetInnerHTML={{ __html: linkifyText(description) }}
          />
        )}
        
        <Label htmlFor="newComment" className="text-base font-medium">
          Adicionar Comentário
        </Label>
        <Textarea
          id="newComment"
          name="newComment"
          placeholder="Adicione informações sobre esta atualização de status"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        
        {/* Campo oculto para manter o valor completo da descrição */}
        <input 
          type="hidden" 
          name="description" 
          value={description || ''}
        />
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="button"
          disabled={isSubmitting || (!newComment.trim() && !value)}
          onClick={handleCommentSubmit}
        >
          {isSubmitting ? "Atualizando..." : "Atualizar Status"}
        </Button>
      </div>
    </div>
  );
}
