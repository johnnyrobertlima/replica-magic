
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  name: string;
  color?: string | null;
}

export function StatusBadge({ name, color }: StatusBadgeProps) {
  // Calculate text color based on background color brightness
  const calculateTextColor = (bgColor: string | null | undefined): string => {
    if (!bgColor) return "#fff";
    
    // Convert hex to RGB
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate perceived brightness
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // If brightness is greater than 0.5, use black text, otherwise use white
    return brightness > 0.5 ? "#000" : "#fff";
  };
  
  const textColor = calculateTextColor(color);
  
  return (
    <Badge 
      className="font-normal text-[9px] py-0 px-1.5 whitespace-nowrap h-4"
      style={{ 
        backgroundColor: color || '#888',
        color: textColor
      }}
    >
      {name}
    </Badge>
  );
}
