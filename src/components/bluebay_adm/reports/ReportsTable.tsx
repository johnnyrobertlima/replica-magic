
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { EstoqueItem } from "@/types/bk/estoque";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

interface ReportsTableProps {
  items: EstoqueItem[];
  isLoading: boolean;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ items, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredItems = items.filter(item => 
    item.ITEM_CODIGO.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.DESCRICAO.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.GRU_DESCRICAO.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center border rounded-md px-3 py-2">
        <Search className="h-5 w-5 text-muted-foreground mr-2" />
        <Input
          placeholder="Buscar por código, descrição ou grupo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead className="text-right">Físico</TableHead>
              <TableHead className="text-right">Disponível</TableHead>
              <TableHead className="text-right">Reservado</TableHead>
              <TableHead>Sublocal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  {searchTerm 
                    ? "Nenhum item encontrado para esta busca" 
                    : "Nenhum item disponível"}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.ITEM_CODIGO}>
                  <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                  <TableCell>{item.DESCRICAO}</TableCell>
                  <TableCell>{item.GRU_DESCRICAO}</TableCell>
                  <TableCell className="text-right">{item.FISICO}</TableCell>
                  <TableCell className="text-right">{item.DISPONIVEL}</TableCell>
                  <TableCell className="text-right">{item.RESERVADO}</TableCell>
                  <TableCell>{item.SUBLOCAL}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
