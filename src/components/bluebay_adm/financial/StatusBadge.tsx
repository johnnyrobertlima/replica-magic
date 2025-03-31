
import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" | null = null;
  let label = status;
  
  switch (status) {
    case "1":
      variant = "secondary";
      label = "Em Aberto";
      break;
    case "2":
      variant = "outline";
      label = "Parcialmente Pago";
      break;
    case "3":
      variant = "default";
      label = "Pago";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};
