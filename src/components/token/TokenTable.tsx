import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";
import { Token } from "@/types/token";

interface TokenTableProps {
  tokens: Token[] | undefined;
  onEdit: (token: Token) => void;
  onDelete: (id: string) => void;
}

export const TokenTable = ({ tokens, onEdit, onDelete }: TokenTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome do Chip</TableHead>
            <TableHead>Limite por Dia</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens?.map((token) => (
            <TableRow key={token.id}>
              <TableCell>{token.id}</TableCell>
              <TableCell>{token.NomedoChip}</TableCell>
              <TableCell>{token["limite por dia"]}</TableCell>
              <TableCell>{token.Telefone}</TableCell>
              <TableCell>{token.cliente}</TableCell>
              <TableCell>{token.Status}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(token)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(token.id)}
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