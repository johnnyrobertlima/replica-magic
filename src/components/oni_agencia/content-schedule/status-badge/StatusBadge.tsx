
import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface StatusBadgeProps {
  status: {
    name: string;
    color?: string | null;
  };
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Função para determinar a cor do text baseada na cor de fundo
  const getTextColor = (bgColor: string | null | undefined) => {
    if (!bgColor) return "text-foreground";
    
    // Converter hex para RGB para calcular luminosidade
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Fórmula para calcular luminosidade
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retornar cor texto baseada na luminosidade
    return luminance > 0.5 ? "text-black" : "text-white";
  };

  const textColor = getTextColor(status.color);
  
  const style = status.color ? { 
    backgroundColor: status.color,
    borderColor: status.color 
  } : {};

  return (
    <Badge 
      className={cn("font-medium whitespace-nowrap", textColor, className)}
      style={style}
    >
      {status.name}
    </Badge>
  );
}
