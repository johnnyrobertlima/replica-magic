
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Loader2, User } from "lucide-react";
import { OniAgenciaCollaborator } from "@/types/oni-agencia";

interface CollaboratorListProps {
  collaborators: OniAgenciaCollaborator[];
  onEdit: (collaborator: OniAgenciaCollaborator) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  isDeleting: boolean;
}

export function CollaboratorList({ 
  collaborators, 
  onEdit, 
  onDelete, 
  isLoading, 
  isDeleting 
}: CollaboratorListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
            <TableHead className="w-[60px]">Foto</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collaborators.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Nenhum colaborador cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            collaborators.map((collaborator) => (
              <TableRow key={collaborator.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={collaborator.photo_url || undefined} alt={collaborator.name} />
                    <AvatarFallback>{getInitials(collaborator.name)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{collaborator.name}</TableCell>
                <TableCell>{collaborator.email || "-"}</TableCell>
                <TableCell>{collaborator.phone || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(collaborator)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(collaborator.id)}
                      disabled={isDeleting && deletingId === collaborator.id}
                    >
                      {isDeleting && deletingId === collaborator.id ? (
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
