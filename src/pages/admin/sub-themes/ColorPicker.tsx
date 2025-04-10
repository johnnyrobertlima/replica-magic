
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const predefinedColors = [
  "#0052CC", "#172B4D", "#9b87f5", "#7E69AB", "#6E59A5", 
  "#D6BCFA", "#F2FCE2", "#FEF7CD", "#FEC6A1", "#E5DEFF",
  "#FFDEE2", "#FDE1D3", "#D3E4FD", "#F1F0FB", "#8B5CF6",
  "#D946EF", "#F97316", "#0EA5E9", "#10B981", "#EF4444",
  "#F59E0B", "#3B82F6", "#EC4899", "#6366F1", "#14B8A6"
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  
  const handleColorSelect = (color: string) => {
    onChange(color);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start font-normal"
        >
          <div className="flex items-center gap-2">
            {value ? (
              <div 
                className="h-4 w-4 rounded-full" 
                style={{ backgroundColor: value }} 
              />
            ) : (
              <div className="h-4 w-4 rounded-full bg-gray-200" />
            )}
            {value || "Selecione uma cor"}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="grid grid-cols-5 gap-2">
          {predefinedColors.map((color) => (
            <button
              key={color}
              className="h-8 w-8 rounded-full border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
