
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from "@/types/oni-agencia";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick
}) => {
  // Safely extract values with null checks
  const {
    title = "Sem título",
    scheduled_date,
    service,
    status,
    collaborator,
    product,
    client
  } = event;

  // Format the date
  const formattedDate = scheduled_date ? format(new Date(scheduled_date), "dd 'de' MMMM", {
    locale: ptBR
  }) : "Data não definida";

  // Determine service color for the left border
  const serviceColor = service?.color || "#ccc";

  // Safely get status name
  const statusName = status?.name || "Sem status";

  // Calculate status color with default
  const statusColor = status?.color || "#f5f5f5";

  // Determine text color based on background brightness
  const getTextColor = (bgColor: string): string => {
    // Convert hex to RGB
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate perceived brightness
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white text for dark backgrounds, black for light
    return brightness > 0.6 ? "#000" : "#fff";
  };
  
  const statusTextColor = getTextColor(statusColor);
  
  // Get appropriate initials for collaborator fallback
  const getCollaboratorInitials = () => {
    if (!collaborator?.name) return "?";
    
    const nameParts = collaborator.name.trim().split(/\s+/);
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    // Get first and last name initials
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };
  
  // Debug log for collaborator info
  if (collaborator?.photo_url) {
    console.log(`EventCard rendering collaborator with photo: ${collaborator.name}`, collaborator.photo_url);
  }
  
  return (
    <Card 
      className="mb-3 overflow-hidden cursor-pointer hover:shadow-md transition-shadow" 
      onClick={() => onClick(event)} 
      style={{
        borderLeft: `4px solid ${serviceColor}`
      }}
    >
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-base font-medium line-clamp-1">{title}</CardTitle>
        {/* Agora exibimos o cliente e produto juntos na descrição do card */}
        <CardDescription className="text-xs line-clamp-1 mt-0.5">
          {client?.name ? `${client.name}` : "Sem cliente"}
          {product && client?.name ? " • " : ""}
          {product?.name}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-3 pt-0 pb-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">{service?.name || "Sem serviço"}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-1 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Collaborator avatar - agora usando o componente Avatar */}
          <Avatar className="h-6 w-6 flex-shrink-0">
            {collaborator?.photo_url ? (
              <AvatarImage 
                src={collaborator.photo_url} 
                alt={collaborator.name || "?"} 
                onError={(e) => {
                  console.error(`Failed to load avatar in EventCard for ${collaborator?.name || 'unknown'}:`, e);
                  console.error(`Avatar URL that failed to load: ${collaborator?.photo_url}`);
                  // Let the fallback handle it
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <AvatarFallback className="text-xs font-medium border border-gray-200 bg-gray-100">
                {getCollaboratorInitials()}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="text-xs truncate max-w-[120px]">{collaborator?.name || "Sem responsável"}</span>
        </div>
        
        <div className="text-xs py-1 px-2 rounded-full font-medium" style={{
          backgroundColor: statusColor,
          color: statusTextColor
        }}>
          {statusName}
        </div>
      </CardFooter>
    </Card>
  );
};
