
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { BkClient } from "@/hooks/bk/useClients";

interface ClientListProps {
  clients: BkClient[];
  isLoading: boolean;
  onEdit: (client: BkClient) => void;
  onDelete: (client: BkClient) => void;
}

export const ClientList = ({ 
  clients, 
  isLoading, 
  onEdit, 
  onDelete 
}: ClientListProps) => {
  return (
    <div className="bg-white rounded-md shadow overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando clientes...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Código</TableHead>
                <TableHead className="w-48">Razão Social</TableHead>
                <TableHead className="w-32">Nome Fantasia</TableHead>
                <TableHead className="w-32">CNPJ/CPF</TableHead>
                <TableHead className="w-32">Cidade</TableHead>
                <TableHead className="w-24">UF</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.PES_CODIGO}>
                    <TableCell>{client.PES_CODIGO}</TableCell>
                    <TableCell>{client.RAZAOSOCIAL || "-"}</TableCell>
                    <TableCell>{client.APELIDO || "-"}</TableCell>
                    <TableCell>{client.CNPJCPF || "-"}</TableCell>
                    <TableCell>{client.CIDADE || "-"}</TableCell>
                    <TableCell>{client.UF || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDelete(client)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
