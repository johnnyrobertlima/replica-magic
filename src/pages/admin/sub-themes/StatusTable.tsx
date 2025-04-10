
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Status } from "./types";
import { Trash, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StatusTableProps {
  entityName: string;
  statuses: Status[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function StatusTable({ entityName, statuses, isLoading, onDelete }: StatusTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDelete(id);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || `Erro ao excluir ${entityName}`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Função para encontrar o status pelo ID
  const findStatusName = (statusId: string | null | undefined) => {
    if (!statusId) return "Nenhum";
    const status = statuses.find(s => s.id === statusId);
    return status ? status.name : "Não encontrado";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Status Anterior</TableHead>
            <TableHead>Próximo Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {statuses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                Nenhum {entityName} encontrado.
              </TableCell>
            </TableRow>
          ) : (
            statuses.map((status) => (
              <TableRow key={status.id}>
                <TableCell>{status.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: status.color || "#6E59A5" }}
                    />
                    {status.color || "N/A"}
                  </div>
                </TableCell>
                <TableCell>{findStatusName(status.previous_status_id)}</TableCell>
                <TableCell>{findStatusName(status.next_status_id)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // A função handleEdit deve ser passada por props do componente pai
                        const event = new CustomEvent('statusEdit', { detail: status });
                        document.dispatchEvent(event);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(status.id)}
                      disabled={deletingId === status.id}
                    >
                      {deletingId === status.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4 text-destructive" />
                      )}
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
