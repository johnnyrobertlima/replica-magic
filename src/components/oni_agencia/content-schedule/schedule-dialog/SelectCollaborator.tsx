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
import { getStorageUrl } from "@/utils/imageUtils";

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

  // Process collaborator photo URL - use the same mechanism as the collaborators page
  const getPhotoUrl = (photoUrl: string | null) => {
    // If no photo, return null
    if (!photoUrl) return null;
    
    // If it's already a complete URL (http/https) or data URL, return as is
    if (photoUrl.startsWith('http') || photoUrl.startsWith('data:')) {
      return photoUrl;
    }
    
    // Otherwise, use the storage URL helper
    return getStorageUrl(photoUrl);
  };

  // Debug log to check all collaborators data including photo_url
  console.log("All collaborators data:", collaborators.map(c => ({
    id: c.id,
    name: c.name,
    hasPhoto: !!c.photo_url,
    photoUrlOriginal: c.photo_url,
    photoUrlProcessed: getPhotoUrl(c.photo_url)
  })));
  
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
                    const photoUrl = getPhotoUrl(selectedCollaborator.photo_url);
                    console.log("Selected collaborator data:", {
                      id: selectedCollaborator.id,
                      name: selectedCollaborator.name,
                      hasPhoto: !!selectedCollaborator.photo_url,
                      photoUrlOriginal: selectedCollaborator.photo_url,
                      photoUrlProcessed: photoUrl
                    });
                    return (
                      <>
                        <Avatar className="h-5 w-5">
                          {photoUrl ? (
                            <AvatarImage 
                              src={photoUrl} 
                              alt={selectedCollaborator.name} 
                              onError={(e) => {
                                console.error(`Failed to load avatar for ${selectedCollaborator.name}:`, e);
                                console.error(`Avatar URL that failed to load: ${photoUrl}`);
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
            {collaborators && collaborators.length > 0 && collaborators.map((collaborator) => {
              const photoUrl = getPhotoUrl(collaborator.photo_url);
              return (
                <SelectItem key={collaborator.id} value={collaborator.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <Avatar className="h-5 w-5">
                      {photoUrl ? (
                        <AvatarImage 
                          src={photoUrl} 
                          alt={collaborator.name} 
                          onError={(e) => {
                            console.error(`Failed to load collaborator avatar for ${collaborator.name}:`, e);
                            console.error(`Avatar URL that failed to load: ${photoUrl}`);
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
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
