
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
import { useScheduleHistory } from "@/hooks/useScheduleHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarEvent } from "@/types/oni-agencia";

interface StatusUpdateFormProps {
  statuses: any[];
  collaborators: OniAgenciaCollaborator[];
  value: string;
  collaboratorId: string | null;
  description: string;
  isLoading: boolean;
  isLoadingCollaborators: boolean;
  isSubmitting: boolean;
  currentSelectedEvent?: CalendarEvent | null;
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
  currentSelectedEvent,
  onSubmit,
  onValueChange,
  onCollaboratorChange,
  onInputChange,
  onCancel
}: StatusUpdateFormProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || "Usuário";
  
  // Get schedule history for comments - sempre buscar se temos um evento
  const { data: history = [], isLoading: isLoadingHistory, refetch } = useScheduleHistory(
    currentSelectedEvent?.id || ""
  );

  // Function to handle submission with comment history
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      // Refetch history to get the latest comments
      setTimeout(() => {
        refetch();
      }, 1000);
      
      // Provide feedback to the user
      toast.success("Agendamento atualizado com sucesso");
    } catch (error) {
      console.error("Error submitting update:", error);
      toast.error("Erro ao atualizar agendamento");
    }
  };

  // Extract comments from description history
  const extractCommentsFromDescription = (desc: string) => {
    if (!desc) return [];
    
    const commentPattern = /\[(.*?) em (\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2})\]:\s*(.*?)(?=\n\[|$)/gs;
    const comments = [];
    let match;
    
    while ((match = commentPattern.exec(desc)) !== null) {
      comments.push({
        author: match[1],
        date: match[2],
        comment: match[3].trim()
      });
    }
    
    return comments.reverse(); // Show newest first
  };

  // Combine all comments from description and history
  const descriptionComments = extractCommentsFromDescription(description);
  
  // Add history entries that are description changes
  const historyComments = history
    .filter(entry => entry.field_name === 'description' && entry.new_value)
    .map(entry => {
      // Extract comments from the history entry's new_value
      const entryComments = extractCommentsFromDescription(entry.new_value);
      return entryComments.map(comment => ({
        author: comment.author || entry.changed_by_name || 'Sistema',
        date: comment.date || new Date(entry.created_at).toLocaleString('pt-BR'),
        comment: comment.comment
      }));
    })
    .flat();

  // Combine and deduplicate comments
  const allComments = [...descriptionComments, ...historyComments]
    .filter((comment, index, self) => 
      index === self.findIndex(c => 
        c.author === comment.author && 
        c.date === comment.date && 
        c.comment === comment.comment
      )
    )
    .sort((a, b) => {
      // Sort by date, newest first
      const dateA = new Date(a.date.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5'));
      const dateB = new Date(b.date.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5'));
      return dateB.getTime() - dateA.getTime();
    });
  
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

      {/* Comentários do Agendamento - sempre mostrar */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Comentários do Agendamento
        </Label>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Todos os Comentários</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40 w-full">
              {isLoadingHistory ? (
                <div className="text-sm text-gray-500">Carregando comentários...</div>
              ) : allComments.length > 0 ? (
                <div className="space-y-3">
                  {allComments.map((comment, index) => (
                    <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {comment.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {comment.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Nenhum comentário encontrado</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
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
