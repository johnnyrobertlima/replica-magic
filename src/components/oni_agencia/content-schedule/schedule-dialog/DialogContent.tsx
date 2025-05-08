
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { EventEditor } from './EventEditor';
import { NewEventForm } from './NewEventForm';
import { CalendarEvent } from "@/types/oni-agencia";
import { EventList } from './EventList';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface EventListProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

interface DialogContentProps {
  events: CalendarEvent[];
  currentSelectedEvent?: CalendarEvent;
  clientId: string;
  selectedDate: Date;
  services: any[];
  collaborators: any[];
  editorialLines: any[];
  products: any[];
  statuses: any[];
  clients: any[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  isLoadingClients: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  formData: any;
  onSelectEvent: (event: CalendarEvent) => void;
  onResetForm: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onStatusUpdate: (e: React.FormEvent) => void;
  onDelete: () => void;
  onCancel: () => void;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  onDateChange: (field: string, value: Date | null) => void;
  onDateTimeChange: (field: string, value: Date | null) => void;
  onAllDayChange: (field: string, value: boolean) => void;
}

export const DialogContent = ({
  events,
  currentSelectedEvent,
  clientId,
  selectedDate,
  services,
  collaborators,
  editorialLines,
  products,
  statuses,
  clients,
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts,
  isLoadingStatuses,
  isLoadingClients,
  isSubmitting,
  isDeleting,
  formData,
  onSelectEvent,
  onResetForm,
  onSubmit,
  onStatusUpdate,
  onDelete,
  onCancel,
  onInputChange,
  onSelectChange,
  onDateChange,
  onDateTimeChange,
  onAllDayChange
}: DialogContentProps) => {
  const [showNewEventForm, setShowNewEventForm] = useState(!currentSelectedEvent);

  const handleCreatorsChange = (creators: string[]) => {
    // This function will be called when the creators selection changes
    onSelectChange('creators', creators.join(','));
  };
  
  const filteredEvents = events.filter(event => 
    event.scheduled_date === selectedDate.toISOString().split('T')[0]
  );

  return (
    <div className="px-4 pb-4 pt-2">
      {filteredEvents.length > 0 && !showNewEventForm && !currentSelectedEvent && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Eventos neste dia:</h3>
          <EventList 
            events={filteredEvents}
            onSelectEvent={onSelectEvent}
          />
          <div className="mt-4 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={() => setShowNewEventForm(true)}
            >
              Novo Evento
            </Button>
          </div>
        </div>
      )}
      
      {(showNewEventForm || currentSelectedEvent) && (
        <div>
          {currentSelectedEvent ? (
            <EventEditor
              currentSelectedEvent={currentSelectedEvent}
              isSubmitting={isSubmitting}
              onCancelEdit={() => {
                onResetForm();
                setShowNewEventForm(false);
              }}
              onSubmit={onSubmit}
              formData={formData}
              onInputChange={onInputChange}
              onSelectChange={onSelectChange}
              services={services}
              collaborators={collaborators}
              editorialLines={editorialLines}
              products={products}
              statuses={statuses}
              isLoadingServices={isLoadingServices}
              isLoadingCollaborators={isLoadingCollaborators}
              isLoadingEditorialLines={isLoadingEditorialLines}
              isLoadingProducts={isLoadingProducts}
              isLoadingStatuses={isLoadingStatuses}
              onStatusUpdate={onStatusUpdate}
              onDelete={onDelete}
            />
          ) : (
            <>
              <NewEventForm 
                formData={formData}
                onInputChange={onInputChange}
                onSelectChange={onSelectChange}
                services={services}
                collaborators={collaborators}
                editorialLines={editorialLines}
                products={products}
                statuses={statuses}
                isLoadingServices={isLoadingServices}
                isLoadingCollaborators={isLoadingCollaborators}
                isLoadingEditorialLines={isLoadingEditorialLines}
                isLoadingProducts={isLoadingProducts}
                isLoadingStatuses={isLoadingStatuses}
                clientId={clientId}
                onCreatorsChange={handleCreatorsChange}
              />

              <Separator className="my-4" />
              
              <div className="flex justify-end gap-2">
                {filteredEvents.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewEventForm(false)}
                  >
                    Voltar para eventos
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Salvar
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
