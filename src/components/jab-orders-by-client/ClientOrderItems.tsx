
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { OrderItem } from "./types";
import { useState } from "react";

interface ClientOrderItemsProps {
  items: OrderItem[];
  showZeroBalance: boolean;
  onToggleZeroBalance: () => void;
  clientId: string;
}

const ITEMS_PER_PAGE = 10;

const ClientOrderItems = ({ items, showZeroBalance, onToggleZeroBalance, clientId }: ClientOrderItemsProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = items.filter(item => showZeroBalance || item.QTDE_SALDO > 0);
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Switch
            checked={showZeroBalance}
            onCheckedChange={onToggleZeroBalance}
            id={`show-zero-balance-${clientId}`}
          />
          <label 
            htmlFor={`show-zero-balance-${clientId}`}
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Mostrar itens com saldo zero
          </label>
        </div>
        <span className="text-sm text-muted-foreground">
          Total de itens: {filteredItems.length}
        </span>
      </div>
      
      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-4">Itens Consolidados</h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">QT Pedido</TableHead>
                <TableHead className="text-right">QT Faturada</TableHead>
                <TableHead className="text-right">QT Saldo</TableHead>
                <TableHead className="text-right">VL Uni</TableHead>
                <TableHead className="text-right">VL Total Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item, index) => (
                <TableRow key={`${item.ITEM_CODIGO}-${item.PED_NUMPEDIDO}-${index}`}>
                  <TableCell>{item.PED_NUMPEDIDO}</TableCell>
                  <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                  <TableCell>{item.DESCRICAO || '-'}</TableCell>
                  <TableCell className="text-right">{item.QTDE_PEDIDA.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.QTDE_ENTREGUE.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.QTDE_SALDO.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {item.VALOR_UNITARIO.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {(item.QTDE_SALDO * item.VALOR_UNITARIO).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4" onClick={e => e.stopPropagation()}>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOrderItems;
