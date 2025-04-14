
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent } from "@/types/oni-agencia";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "../status-badge/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EventDateSectionProps {
  dateString: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function EventDateSection({ 
  dateString, 
  events, 
  onEventClick 
}: EventDateSectionProps) {
  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-primary mb-2 capitalize">
        {formatDateHeader(dateString)}
      </h3>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[10%]">Serviço</TableHead>
            <TableHead className="w-[15%]">Linha Editorial</TableHead>
            <TableHead className="w-[15%]">Nome</TableHead>
            <TableHead className="w-[45%]">Descrição</TableHead>
            <TableHead className="w-[10%]">Colaborador</TableHead>
            <TableHead className="w-[5%]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow 
              key={event.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onEventClick(event)}
            >
              <TableCell>
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: event.service.color }}
                  />
                  {event.service.name}
                </div>
              </TableCell>
              <TableCell>
                {event.editorial_line ? (
                  <div className="flex items-center">
                    <div 
                      className="h-3 w-3 rounded-full mr-2" 
                      style={{ backgroundColor: event.editorial_line.color || '#ccc' }}
                    />
                    {event.editorial_line.name}
                  </div>
                ) : "—"}
              </TableCell>
              <TableCell>
                <span className="font-medium">
                  {event.title}
                  {event.product && 
                    <span className="ml-1 text-muted-foreground">
                      - {event.product.name}
                    </span>
                  }
                </span>
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="whitespace-pre-line">
                  {event.description || "—"}
                </p>
              </TableCell>
              <TableCell>
                {event.collaborator ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={event.collaborator.photo_url || ''} 
                        alt={event.collaborator.name} 
                      />
                      <AvatarFallback>
                        {event.collaborator.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{event.collaborator.name}</span>
                  </div>
                ) : "—"}
              </TableCell>
              <TableCell>
                {event.status ? (
                  <StatusBadge color={event.status.color || "#9CA3AF"}>
                    {event.status.name}
                  </StatusBadge>
                ) : (
                  <StatusBadge color="#9CA3AF">
                    Pendente
                  </StatusBadge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
