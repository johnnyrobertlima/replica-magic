
import { PackageOpen, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GroupedEstoque, EstoqueItem } from "@/types/bk/estoque";

interface EstoqueSummaryCardsProps {
  groupedItems: GroupedEstoque[];
  filteredItems: EstoqueItem[];
}

export const EstoqueSummaryCards = ({ groupedItems, filteredItems }: EstoqueSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <PackageOpen className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Grupos</p>
              <p className="text-2xl font-bold">{groupedItems.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Itens</p>
              <p className="text-2xl font-bold">{filteredItems.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary mr-4" />
            <div>
              <p className="text-sm text-muted-foreground">Estoque Físico Total</p>
              <p className="text-2xl font-bold">
                {filteredItems.reduce((sum, item) => sum + (Number(item.FISICO) || 0), 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
