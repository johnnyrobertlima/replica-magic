
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { StockItem } from "@/services/bluebay/stockSales/types";

interface ItemBadgesProps {
  item: StockItem;
}

export const ItemBadges: React.FC<ItemBadgesProps> = ({ item }) => {
  const isNew = !!item.PRODUTO_NOVO;
  const isTop10 = item.RANKING !== null && item.RANKING <= 10;
  const ranking = item.RANKING ? Number(item.RANKING) : undefined;

  return (
    <>
      {isNew && (
        <Badge className="ml-2 bg-blue-600">Novo</Badge>
      )}
      {isTop10 && ranking && (
        <Badge className="ml-2 bg-yellow-600">
          <Star className="h-3 w-3 mr-1" />
          Top {ranking}
        </Badge>
      )}
    </>
  );
};
