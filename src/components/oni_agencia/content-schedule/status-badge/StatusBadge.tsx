
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  name: string;
  color?: string | null;
}

export function StatusBadge({ name, color }: StatusBadgeProps) {
  return (
    <Badge 
      className="font-normal text-xs whitespace-nowrap"
      style={{ 
        backgroundColor: color || '#888',
        color: '#fff'
      }}
    >
      {name}
    </Badge>
  );
}
