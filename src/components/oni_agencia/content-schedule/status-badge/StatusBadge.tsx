
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  name: string;
  color?: string | null;
}

export function StatusBadge({ name, color }: StatusBadgeProps) {
  return (
    <Badge 
      className="font-normal text-[9px] py-0 px-1.5 whitespace-nowrap h-4"
      style={{ 
        backgroundColor: color || '#888',
        color: '#fff'
      }}
    >
      {name}
    </Badge>
  );
}
