
import { OniAgenciaClient } from "@/types/oni-agencia";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ClientListProps {
  clients: OniAgenciaClient[];
  onEdit: (client: OniAgenciaClient) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  isDeleting: boolean;
}

export const ClientList = ({ 
  clients, 
  onEdit, 
  onDelete, 
  isLoading, 
  isDeleting 
}: ClientListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-md border shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Carregando clientes...</span>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-md border shadow-sm p-8 text-center">
        <p className="text-muted-foreground">
          Nenhum cliente cadastrado. Utilize o formulário acima para adicionar um novo cliente.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  {client.logo_url ? (
                    <AvatarImage src={client.logo_url} alt={client.name} />
                  ) : null}
                  <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email || "-"}</TableCell>
              <TableCell>{client.phone || "-"}</TableCell>
              <TableCell>{client.cnpj || "-"}</TableCell>
              <TableCell>{client.city || "-"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(client)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(client.id)}
                    disabled={isDeleting}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
