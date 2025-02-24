
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButtons } from "@/components/admin/ActionButtons";
import type { Permission } from "./types";

interface PermissionTableProps {
  permissions?: Permission[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export const PermissionTable = ({ permissions, isLoading, onDelete }: PermissionTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Caminho do Recurso</TableHead>
            <TableHead>Tipo de Permissão</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : permissions?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Nenhuma permissão encontrada
              </TableCell>
            </TableRow>
          ) : (
            permissions?.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.resource_path}</TableCell>
                <TableCell className="capitalize">{permission.permission_type}</TableCell>
                <TableCell>
                  <ActionButtons
                    onDelete={() => onDelete(permission.id)}
                    showEdit={false}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
