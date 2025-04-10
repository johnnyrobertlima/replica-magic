
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as Icons from "lucide-react";

interface SymbolSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const iconList = [
  "BookText", "Book", "BookOpen", "Bookmark", "BookMarked", "BookType", 
  "FileBadge", "FileText", "FileJson", "FileCheck", "FileCode", "FileWarning",
  "PenTool", "Pencil", "PenSquare", "Edit3", "Type", "Heading", "AlignLeft",
  "AlignCenter", "AlignRight", "AlignJustify", "ListOrdered", "List", "Feather",
  "Quote", "Clock", "Calendar", "CalendarDays", "CalendarCheck", "CalendarRange",
  "Tags", "Tag", "Hash", "Flag", "Mailbox", "Send", "Mail", "MessageSquare", 
  "MessageCircle", "Music", "Video", "Image", "Camera", "Palette", "Paintbrush",
  "CircleUser", "Users", "Target", "Award", "Trophy", "Crown", "Star", "Heart",
  "ArrowUpCircle", "TrendingUp", "BarChart", "PieChart", "LineChart", "Activity",
  "Zap", "Lightbulb", "Sparkles", "Flame", "Diamond", "Gift", "Rocket", "Compass",
  "Globe", "Map", "MapPin", "Navigation", "Building", "Home", "School", "Landmark"
];

export function SymbolSelector({ value, onChange }: SymbolSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
  };

  // Dynamically get the icon component
  const SelectedIcon = value ? (Icons as any)[value] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start text-left font-normal"
        >
          {value ? (
            <>
              {SelectedIcon && <SelectedIcon className="mr-2 h-4 w-4" />}
              {value}
            </>
          ) : (
            "Selecione um símbolo"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-3 gap-2 p-4">
            {iconList.map((iconName) => {
              const IconComponent = (Icons as any)[iconName];
              return (
                <Button
                  key={iconName}
                  variant="ghost"
                  className="flex flex-col items-center justify-center h-16 py-1 px-2 gap-1"
                  onClick={() => handleIconSelect(iconName)}
                >
                  {IconComponent && <IconComponent className="h-5 w-5" />}
                  <span className="text-xs">{iconName}</span>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
