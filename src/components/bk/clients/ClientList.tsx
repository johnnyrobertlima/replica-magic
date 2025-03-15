
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, Building, Store } from "lucide-react";
import { BkClient } from "@/types/bk/client";
import { useState } from "react";

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
  const [page, setPage] = useState(1);
  const rowsPerPage = 50;
  const totalPages = Math.ceil(clients.length / rowsPerPage);
  
  const paginatedClients = clients.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="bg-white rounded-md shadow overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando clientes...</span>
        </div>
      ) : (
        <>
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Mostrando {paginatedClients.length} de {clients.length} clientes
              </span>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="py-2 px-4 text-sm">
                  Página {page} de {totalPages || 1}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 0}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Código</TableHead>
                  <TableHead className="w-48">Razão Social</TableHead>
                  <TableHead className="w-32 font-bold text-primary">Nome Fantasia (APELIDO)</TableHead>
                  <TableHead className="w-32">CNPJ/CPF</TableHead>
                  <TableHead className="w-32">Cidade</TableHead>
                  <TableHead className="w-24">UF</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow key={client.PES_CODIGO}>
                      <TableCell>{client.PES_CODIGO}</TableCell>
                      <TableCell>{client.RAZAOSOCIAL || "-"}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Store className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-primary-600 font-semibold">
                            {client.APELIDO || "-"}
                          </span>
                        </div>
                      </TableCell>
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
          
          {totalPages > 1 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total: {clients.length} clientes
                </span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="py-2 px-4 text-sm">
                    Página {page} de {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
