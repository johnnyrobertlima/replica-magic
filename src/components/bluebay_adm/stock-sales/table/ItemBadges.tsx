
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ItemBadgesProps {
  isNew: boolean;
  isTop10: boolean;
  ranking?: number | null;
}

export const ItemBadges: React.FC<ItemBadgesProps> = ({ isNew, isTop10, ranking }) => {
  return (
    <>
      {isNew && (
        <Badge className="ml-2 bg-blue-600">Novo</Badge>
      )}
      {isTop10 && (
        <Badge className="ml-2 bg-yellow-600">
          <Star className="h-3 w-3 mr-1" />
          Top {ranking}
        </Badge>
      )}
    </>
  );
};
