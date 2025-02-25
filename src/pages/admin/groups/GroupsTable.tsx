
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButtons } from "@/components/admin/ActionButtons";
import type { Group } from "./types";

interface GroupsTableProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (id: string) => void;
}

export const GroupsTable = ({ groups, onEdit, onDelete }: GroupsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Página Inicial</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups?.map((group) => (
            <TableRow key={group.id}>
              <TableCell>{group.name}</TableCell>
              <TableCell>{group.description}</TableCell>
              <TableCell>{group.homepage}</TableCell>
              <TableCell>
                <ActionButtons
                  onEdit={() => onEdit(group)}
                  onDelete={() => onDelete(group.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
