
import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface StatusBadgeProps {
  status?: {
    name?: string;
    color?: string | null;
  };
  color?: string | null;
  className?: string;
  children?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, color, className, children, size = 'md' }: StatusBadgeProps) {
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

  // Determinar a cor a partir do status ou diretamente do prop color
  const badgeColor = status?.color || color;
  const textColor = getTextColor(badgeColor);
  
  const style = badgeColor ? { 
    backgroundColor: badgeColor,
    borderColor: badgeColor 
  } : {};
  
  // Apply size classes
  const sizeClasses = size === 'xs' ? 'text-[0.65rem] px-1 py-0' :
                     size === 'sm' ? 'text-xs px-1.5 py-0' :
                     size === 'lg' ? 'text-sm px-3 py-1' : '';

  return (
    <Badge 
      className={cn("font-medium whitespace-nowrap", textColor, sizeClasses, className)}
      style={style}
    >
      {children || status?.name}
    </Badge>
  );
}
