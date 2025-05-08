
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { NewEventForm } from './NewEventForm';

interface TabContentProps {
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
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
}

export const TabContent: React.FC<TabContentProps> = ({
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
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts
}) => {
  return (
    <div className="space-y-4">
      <NewEventForm
        formData={formData}
        onInputChange={onInputChange}
        onSelectChange={onSelectChange}
        services={services}
        collaborators={collaborators}
        editorialLines={editorialLines}
        products={products}
        statuses={[]} // Not needed for this tab
        isLoadingServices={isLoadingServices}
        isLoadingCollaborators={isLoadingCollaborators}
        isLoadingEditorialLines={isLoadingEditorialLines}
        isLoadingProducts={isLoadingProducts}
        isLoadingStatuses={false} // Not needed for this tab
        clientId={formData.client_id || ""}
        onCreatorsChange={(creators) => onSelectChange('creators', creators.join(','))}
      />

      <div className="flex justify-end gap-2 pt-4">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={onSubmit}
            >
              Salvar
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
