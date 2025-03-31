
import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let variant: "default" | "destructive" | "outline" | "secondary" | null = null;
  let label = status;
  let customClass = "";
  
  switch (status) {
    case "1":
      variant = "outline";
      label = "Em Aberto";
      customClass = "bg-blue-100 text-blue-800 hover:bg-blue-100";
      break;
    case "2":
      variant = "outline";
      label = "Parcialmente Pago";
      break;
    case "3":
      variant = "outline";
      label = "Pago";
      customClass = "bg-green-100 text-green-800 hover:bg-green-100";
      break;
    default:
      variant = "outline";
  }
  
  return (
    <Badge 
      variant={variant} 
      className={customClass}
    >
      {label}
    </Badge>
  );
};
