
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { OniAgenciaService } from "@/types/oni-agencia";

interface ServiceListProps {
  services: OniAgenciaService[];
  onEdit: (service: OniAgenciaService) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  isDeleting: boolean;
}

export function ServiceList({ 
  services, 
  onEdit, 
  onDelete, 
  isLoading, 
  isDeleting 
}: ServiceListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Cor</TableHead>
            <TableHead>Nome do Serviço</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum serviço cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: service.color }} 
                  />
                </TableCell>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell className="max-w-md truncate">
                  {service.description}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(service)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(service.id)}
                      disabled={isDeleting && deletingId === service.id}
                    >
                      {isDeleting && deletingId === service.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
