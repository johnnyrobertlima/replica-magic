
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SelectCollaboratorProps {
  clientId: string;
  value: string;
  onChange: (value: string) => void;
}

export function SelectCollaborator({ 
  clientId, 
  value, 
  onChange 
}: SelectCollaboratorProps) {
  // Fetch collaborators
  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ['collaborators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oni_agencia_collaborators')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching collaborators:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="grid gap-2">
      <Label htmlFor="collaborator_id">Responsável</Label>
      <Select
        disabled={isLoading}
        value={value || "null"}
        onValueChange={onChange}
        data-testid="collaborator-select"
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Selecione um responsável" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            <SelectItem value="null">-- Nenhum --</SelectItem>
            {collaborators && collaborators.length > 0 && collaborators.map((collaborator) => (
              <SelectItem key={collaborator.id} value={collaborator.id}>
                {collaborator.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
