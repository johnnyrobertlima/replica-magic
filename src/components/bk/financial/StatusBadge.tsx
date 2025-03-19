
import React from "react";
import { Check, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string | null;
  children?: React.ReactNode;
}

export const StatusBadge = ({ status, children }: StatusBadgeProps) => {
  const normalizedStatus = status || "Desconhecido";
  const displayText = children || normalizedStatus;
  
  const getStatusConfig = (statusValue: string) => {
    switch (statusValue) {
      case '1':
        return {
          className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
          icon: <AlertCircle className="h-3 w-3 mr-1" />
        };
      case '2':
        return {
          className: "bg-red-100 text-red-800 hover:bg-red-100",
          icon: <AlertCircle className="h-3 w-3 mr-1" />
        };
      case '3':
        return {
          className: "bg-green-100 text-green-800 hover:bg-green-100",
          icon: <Check className="h-3 w-3 mr-1" />
        };
      case '4':
        return {
          className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
          icon: <XCircle className="h-3 w-3 mr-1" />
        };
      case 'Concluído':
        return {
          className: "bg-green-100 text-green-800 hover:bg-green-100",
          icon: <Check className="h-3 w-3 mr-1" />
        };
      case 'Pendente':
        return {
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
          icon: <AlertCircle className="h-3 w-3 mr-1" />
        };
      case 'Cancelado':
        return {
          className: "bg-red-100 text-red-800 hover:bg-red-100",
          icon: <XCircle className="h-3 w-3 mr-1" />
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
          icon: null
        };
    }
  };

  const { className, icon } = getStatusConfig(normalizedStatus);

  return (
    <Badge variant="outline" className={className}>
      <span className="flex items-center">
        {icon}
        {displayText}
      </span>
    </Badge>
  );
};
