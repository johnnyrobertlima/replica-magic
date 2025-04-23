
import React, { useState, useEffect } from "react";
import { OniAgenciaCollaborator } from "@/types/oni-agencia";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreatorsSelectMultipleProps {
  collaborators: OniAgenciaCollaborator[];
  isLoading: boolean;
  value: string[];
  onValueChange: (value: string[]) => void;
}

export function CreatorsSelectMultiple({ 
  collaborators,
  isLoading,
  value = [],
  onValueChange
}: CreatorsSelectMultipleProps) {
  const [open, setOpen] = useState(false);
  
  // Garantir que value seja sempre um array válido
  const safeValue = Array.isArray(value) ? value : [];
  
  // Garantir que collaborators seja sempre um array
  const safeCollaborators = Array.isArray(collaborators) ? collaborators : [];
  
  // Encontrar colaboradores selecionados com proteções contra valores undefined
  const selectedCollaborators = safeCollaborators.filter(c => 
    c && c.id && safeValue.includes(c.id)
  );

  const handleToggleCreator = (collaboratorId: string, checked: boolean) => {
    if (!collaboratorId) return;
    
    if (checked) {
      if (!safeValue.includes(collaboratorId)) {
        onValueChange([...safeValue, collaboratorId]);
      }
    } else {
      onValueChange(safeValue.filter(id => id !== collaboratorId));
    }
  };

  const handleRemove = (collaboratorId: string) => {
    if (!collaboratorId) return;
    onValueChange(safeValue.filter(id => id !== collaboratorId));
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="creators">Creators</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
            disabled={isLoading}
            data-testid="creators-select"
          >
            <span className="truncate">
              {safeValue.length === 0
                ? "Selecione os creators..."
                : `${safeValue.length} creator${safeValue.length === 1 ? "" : "s"} selecionado${safeValue.length === 1 ? "" : "s"}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-2">
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {safeCollaborators.length > 0 ? (
                safeCollaborators.map((collaborator) => (
                  collaborator && collaborator.id ? (
                    <div key={collaborator.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`creator-${collaborator.id}`}
                        checked={safeValue.includes(collaborator.id)}
                        onCheckedChange={(checked) => 
                          handleToggleCreator(collaborator.id, checked === true)
                        }
                      />
                      <Label 
                        htmlFor={`creator-${collaborator.id}`}
                        className="text-sm cursor-pointer flex-grow"
                      >
                        {collaborator.name}
                      </Label>
                    </div>
                  ) : null
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  Nenhum colaborador disponível.
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      {selectedCollaborators.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedCollaborators.map((collaborator) => (
            collaborator && collaborator.id ? (
              <Badge
                key={collaborator.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {collaborator.name}
                <button
                  type="button"
                  className="rounded-full outline-none focus:outline-none"
                  onClick={() => handleRemove(collaborator.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null
          ))}
        </div>
      )}
    </div>
  );
}
