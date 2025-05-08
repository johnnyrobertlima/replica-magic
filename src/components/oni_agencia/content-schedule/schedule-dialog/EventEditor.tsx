
import { CalendarEvent } from "@/types/oni-agencia";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { StatusSelect } from "./StatusSelect";
import { Loader2, Trash2 } from "lucide-react";

interface EventEditorProps {
  event: CalendarEvent;
  statuses: any[];
  isLoadingStatuses: boolean;
  onStatusUpdate: (statusId: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function EventEditor({ 
  event, 
  statuses,
  isLoadingStatuses,
  onStatusUpdate,
  onDelete,
  isDeleting
}: EventEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.title || "Evento sem título"}</CardTitle>
        <CardDescription>
          {event.service?.name} • {format(new Date(event.scheduled_date), "dd/MM/yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {event.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Descrição</p>
              <p className="mt-1">{event.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <div className="mt-2">
              <StatusSelect
                value={event.status_id || ""}
                onChange={onStatusUpdate}
                statuses={statuses}
                isLoading={isLoadingStatuses}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
