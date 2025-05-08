
import { StatusSelect } from './StatusSelect';
import { TabContent } from './TabContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface StatusSelectProps {
  value: string;
  onValueChange: (statusId: string) => void;
  statuses: any[];
  isLoading: boolean;
}

interface EventEditorProps {
  currentSelectedEvent: any;
  isSubmitting: boolean;
  onCancelEdit: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  onInputChange: (field: string, value: string) => void;
  onSelectChange: (field: string, value: string) => void;
  services: any[];
  collaborators: any[];
  editorialLines: any[];
  products: any[];
  statuses: any[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  onStatusUpdate: (e: React.FormEvent) => void;
  onDelete: () => void;
}

export const EventEditor = ({
  currentSelectedEvent,
  isSubmitting,
  onCancelEdit,
  onSubmit,
  formData,
  onInputChange,
  onSelectChange,
  services,
  collaborators,
  editorialLines,
  products,
  statuses,
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts,
  isLoadingStatuses,
  onStatusUpdate,
  onDelete
}: EventEditorProps) => {
  return (
    <div>
      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <TabContent
            currentSelectedEvent={currentSelectedEvent}
            isSubmitting={isSubmitting}
            onCancelEdit={onCancelEdit}
            onSubmit={onSubmit}
            formData={formData}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            services={services}
            collaborators={collaborators}
            editorialLines={editorialLines}
            products={products}
            isLoadingServices={isLoadingServices}
            isLoadingCollaborators={isLoadingCollaborators}
            isLoadingEditorialLines={isLoadingEditorialLines}
            isLoadingProducts={isLoadingProducts}
          />
        </TabsContent>
        
        <TabsContent value="status">
          <div className="p-4 space-y-4">
            <h3 className="font-medium">Atualizar Status</h3>
            
            <div className="space-y-2">
              <StatusSelect 
                value={formData.status_id || ''} 
                onValueChange={(value) => onSelectChange('status_id', value)}
                statuses={statuses}
                isLoading={isLoadingStatuses}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <button 
                    type="button" 
                    onClick={onStatusUpdate}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
                  >
                    Atualizar Status
                  </button>
                  <button 
                    type="button" 
                    onClick={onDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="p-4 text-center text-gray-500">
            Histórico de alterações será implementado em breve.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
