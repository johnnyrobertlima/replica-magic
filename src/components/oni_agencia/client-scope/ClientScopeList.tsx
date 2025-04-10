
import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ClientScope } from "@/types/oni-agencia";
import { useDeleteClientScope, useClientScopes } from "@/hooks/useOniAgenciaClientScopes";
import { ClientScopeForm } from "./ClientScopeForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useServices } from "@/hooks/useOniAgenciaServices";

export function ClientScopeList() {
  const { data: scopes = [], isLoading } = useClientScopes();
  const { data: clients = [] } = useClients();
  const { data: services = [] } = useServices();
  const deleteScope = useDeleteClientScope();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingScope, setEditingScope] = useState<ClientScope | null>(null);
  const [scopeToDelete, setScopeToDelete] = useState<string | null>(null);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Cliente não encontrado";
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : "Serviço não encontrado";
  };

  const handleEdit = (scope: ClientScope) => {
    setEditingScope(scope);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (scopeToDelete) {
      await deleteScope.mutateAsync(scopeToDelete);
      setScopeToDelete(null);
    }
  };

  const handleAddNew = () => {
    setEditingScope(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingScope(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Escopos por Cliente</h2>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus size={16} />
          Novo Escopo
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">Carregando escopos...</div>
      ) : scopes.length === 0 ? (
        <div className="p-8 text-center border rounded-md bg-muted/10">
          <p className="text-muted-foreground">Nenhum escopo cadastrado</p>
          <Button variant="outline" className="mt-4" onClick={handleAddNew}>
            Adicionar Escopo
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scopes.map((scope) => (
                <TableRow key={scope.id}>
                  <TableCell>{getClientName(scope.client_id)}</TableCell>
                  <TableCell>{getServiceName(scope.service_id)}</TableCell>
                  <TableCell>{scope.quantity}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(scope)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setScopeToDelete(scope.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <ClientScopeForm
            initialData={editingScope || undefined}
            onCancel={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!scopeToDelete} onOpenChange={(open) => !open && setScopeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este escopo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
