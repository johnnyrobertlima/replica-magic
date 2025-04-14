
import { useState, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useEditorialLines } from "@/hooks/useOniAgenciaThemes";

interface EditorialLinePopoverProps {
  events: CalendarEvent[];
}

export function EditorialLinePopover({ events }: EditorialLinePopoverProps) {
  const { data: editorialLines = [] } = useEditorialLines();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize all editorial lines with zero count
    const initialCounts: Record<string, number> = {};
    editorialLines.forEach(line => {
      initialCounts[line.id] = 0;
    });
    
    // Count events per editorial line
    events.forEach(event => {
      if (event.editorial_line_id) {
        initialCounts[event.editorial_line_id] = (initialCounts[event.editorial_line_id] || 0) + 1;
      }
    });
    
    setCounts(initialCounts);
  }, [events, editorialLines]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" title="Visualizar contagem por linha editorial">
          <FileText className="h-4 w-4 mr-2" />
          <span>Linha Editorial</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border shadow-md">
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Contagem por Linha Editorial</h3>
          <div className="max-h-[300px] overflow-y-auto">
            {editorialLines.length > 0 ? (
              <div className="space-y-1">
                {editorialLines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      <div 
                        className="h-3 w-3 rounded-full mr-2" 
                        style={{ backgroundColor: line.color || '#CBD5E1' }} 
                      />
                      <span className="text-sm">{line.name}</span>
                    </div>
                    <span className="text-sm font-medium">{counts[line.id] || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma linha editorial encontrada</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
