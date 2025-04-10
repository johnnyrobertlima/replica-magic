
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import * as Icons from "lucide-react";

interface Entity {
  id: string;
  name: string;
  symbol?: string;
}

interface EntityTableProps {
  entityName: string;
  entities: Entity[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  showSymbols?: boolean;
}

export function EntityTable({ entityName, entities, isLoading, onDelete, showSymbols = false }: EntityTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Nenhum {entityName} encontrado</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {showSymbols && <TableHead className="w-[60px]">Símbolo</TableHead>}
            <TableHead>Nome</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entities.map((entity) => {
            // Find the icon component if entity has a symbol
            const EntityIcon = entity.symbol && showSymbols 
              ? (Icons as any)[entity.symbol] 
              : null;
              
            return (
              <TableRow key={entity.id}>
                {showSymbols && (
                  <TableCell>
                    {EntityIcon && <EntityIcon className="h-5 w-5" />}
                  </TableCell>
                )}
                <TableCell>{entity.name}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete(entity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
