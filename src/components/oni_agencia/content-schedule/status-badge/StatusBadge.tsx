
import React from 'react';

export interface StatusBadgeProps {
  color: string;
  children: React.ReactNode;
  className?: string; // Added className as an optional prop
}

export function StatusBadge({ color, children, className }: StatusBadgeProps) {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className || ''}`} 
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
