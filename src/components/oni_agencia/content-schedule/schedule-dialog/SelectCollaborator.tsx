
import React from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface SelectCollaboratorProps {
  collaborators: any[];
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function SelectCollaborator({ 
  collaborators, 
  value, 
  isLoading, 
  onChange 
}: SelectCollaboratorProps) {
  // Helper function to get initials from a name
  const getInitials = (name: string) => {
    if (!name) return "?";
    
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    // Get first and last name initials
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };

  // Debug log to check collaborators data
  console.log("SelectCollaborator - received collaborators:", collaborators);
  
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
          <SelectValue placeholder="Selecione um responsável">
            {value !== "null" && value ? (
              <div className="flex items-center gap-2">
                {(() => {
                  const selectedCollaborator = collaborators.find(c => c.id === value);
                  if (selectedCollaborator) {
                    console.log("Selected collaborator:", selectedCollaborator);
                    return (
                      <>
                        <Avatar className="h-5 w-5">
                          {selectedCollaborator.photo_url ? (
                            <AvatarImage 
                              src={selectedCollaborator.photo_url} 
                              alt={selectedCollaborator.name} 
                              onError={(e) => {
                                console.error(`Failed to load avatar for ${selectedCollaborator.name}:`, e);
                                console.error(`Avatar URL that failed to load: ${selectedCollaborator.photo_url}`);
                                // Let the fallback handle it
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <AvatarFallback className="text-xs bg-gray-100">
                              {getInitials(selectedCollaborator.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span>{selectedCollaborator.name}</span>
                      </>
                    );
                  }
                  return "Selecione um responsável";
                })()}
              </div>
            ) : (
              "-- Nenhum --"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            <SelectItem value="null" className="flex items-center">
              -- Nenhum --
            </SelectItem>
            {collaborators && collaborators.length > 0 && collaborators.map((collaborator) => (
              <SelectItem key={collaborator.id} value={collaborator.id} className="flex items-center gap-2">
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-5 w-5">
                    {collaborator.photo_url ? (
                      <AvatarImage 
                        src={collaborator.photo_url} 
                        alt={collaborator.name} 
                        onError={(e) => {
                          console.error(`Failed to load collaborator avatar for ${collaborator.name}:`, e);
                          console.error(`Avatar URL that failed to load: ${collaborator.photo_url}`);
                          // Let the fallback handle it
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <AvatarFallback className="text-xs bg-gray-100">
                        {getInitials(collaborator.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{collaborator.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
