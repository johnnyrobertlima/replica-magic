
import { ServiceSelect } from './ServiceSelect';
import { CollaboratorSelect } from './CollaboratorSelect';
import { StatusSelect } from './StatusSelect';
import { EditorialLineSelect } from './EditorialLineSelect';
import { ProductSelect } from './ProductSelect';
import { ExecutionPhaseSelect } from './ExecutionPhaseSelect';
import { CreatorsMultiSelect } from '../CreatorsMultiSelect';

interface ServiceSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  services: any[];
  isLoading: boolean;
}

interface CollaboratorSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  collaborators: any[];
  isLoading: boolean;
}

interface EditorialLineSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  editorialLines: any[];
  isLoading: boolean;
}

interface ProductSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  products: any[];
  isLoading: boolean;
}

interface ExecutionPhaseSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

interface CreatorsMultiSelectProps {
  value: string[];
  onChange: (creators: string[]) => void;
  collaborators: any[];
  isLoading: boolean;
}

interface NewEventFormProps {
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
  clientId: string;
  onCreatorsChange: (creators: string[]) => void;
}

export const NewEventForm = ({
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
  clientId,
  onCreatorsChange
}: NewEventFormProps) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">Título</label>
        <input
          type="text"
          id="title"
          value={formData.title || ''}
          onChange={(e) => onInputChange('title', e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Título da pauta"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="service-select" className="block text-sm font-medium">Serviço</label>
        <ServiceSelect 
          value={formData.service_id || ''} 
          onValueChange={(value) => onSelectChange('service_id', value)}
          services={services}
          isLoading={isLoadingServices}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="collaborator-select" className="block text-sm font-medium">Colaborador Responsável</label>
        <CollaboratorSelect 
          value={formData.collaborator_id || ''} 
          onValueChange={(value) => onSelectChange('collaborator_id', value)}
          collaborators={collaborators}
          isLoading={isLoadingCollaborators}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="status-select" className="block text-sm font-medium">Status</label>
        <StatusSelect 
          value={formData.status_id || ''} 
          onValueChange={(value) => onSelectChange('status_id', value)}
          statuses={statuses}
          isLoading={isLoadingStatuses}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="editorial-line-select" className="block text-sm font-medium">Linha Editorial</label>
        <EditorialLineSelect 
          value={formData.editorial_line_id || ''} 
          onValueChange={(value) => onSelectChange('editorial_line_id', value)}
          editorialLines={editorialLines}
          isLoading={isLoadingEditorialLines}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="product-select" className="block text-sm font-medium">Produto</label>
        <ProductSelect 
          value={formData.product_id || ''} 
          onValueChange={(value) => onSelectChange('product_id', value)}
          products={products}
          isLoading={isLoadingProducts}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="execution-phase-select" className="block text-sm font-medium">Fase de Execução</label>
        <ExecutionPhaseSelect 
          value={formData.execution_phase || ''} 
          onValueChange={(value) => onSelectChange('execution_phase', value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">Descrição</label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => onInputChange('description', e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Descrição da pauta"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="creators-select" className="block text-sm font-medium">Creators</label>
        <CreatorsMultiSelect 
          value={formData.creators || []}
          onChange={onCreatorsChange}
          collaborators={collaborators}
          isLoading={isLoadingCollaborators}
        />
      </div>
    </div>
  );
};
