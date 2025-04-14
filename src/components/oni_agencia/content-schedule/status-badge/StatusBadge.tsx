
import React from 'react';

export interface StatusBadgeProps {
  color: string;
  children: React.ReactNode;
}

export function StatusBadge({ color, children }: StatusBadgeProps) {
  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
      style={{ 
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`
      }}
    >
      {children}
    </span>
  );
}
