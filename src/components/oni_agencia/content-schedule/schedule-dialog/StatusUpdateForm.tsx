
import React from "react";
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
  
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          Descrição
        </Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Atualize a descrição do agendamento"
          value={description}
          onChange={onInputChange}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Atualizando..." : "Atualizar Status"}
        </Button>
      </div>
    </form>
  );
}
