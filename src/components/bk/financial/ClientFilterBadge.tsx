
import React from "react";
import { Button } from "@/components/ui/button";

interface ClientFilterBadgeProps {
  onReset: () => void;
}

export const ClientFilterBadge: React.FC<ClientFilterBadgeProps> = ({ onReset }) => {
  return (
    <div className="flex items-center mb-4">
      <div className="px-4 py-2 bg-blue-100 border rounded-md flex items-center">
        <span className="font-medium mr-2">Cliente selecionado</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="h-6 text-blue-600 hover:text-blue-800"
        >
          Limpar seleção
        </Button>
      </div>
    </div>
  );
};
