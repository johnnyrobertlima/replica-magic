
import React, { useState, useEffect } from "react";
import { ValueRangeSlider } from "./controls/ValueRangeSlider";
import { ZoomControls } from "./controls/ZoomControls";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TreemapControlsProps {
  minValue: number;
  maxValue: number;
  onValueRangeChange: (range: [number, number]) => void;
  onZoomReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isZoomed: boolean;
}

export const TreemapControls = ({
  minValue,
  maxValue,
  onValueRangeChange,
  onZoomReset,
  onZoomIn,
  onZoomOut,
  isZoomed
}: TreemapControlsProps) => {
  const [valueRange, setValueRange] = useState<[number, number]>([minValue, maxValue]);
  
  // Update value range when min/max change
  useEffect(() => {
    setValueRange([minValue, maxValue]);
  }, [minValue, maxValue]);
  
  const handleRangeChange = (newRange: [number, number]) => {
    setValueRange(newRange);
    onValueRangeChange(newRange);
  };

  const handleClearFilter = () => {
    const resetRange: [number, number] = [minValue, maxValue];
    setValueRange(resetRange);
    onValueRangeChange(resetRange);
  };

  return (
    <div className="bg-white rounded-lg p-5 border shadow-sm transition-all duration-200 animate-fade-in">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Controles de Visualização</h4>
          <ZoomControls 
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onZoomReset={onZoomReset}
            isZoomed={isZoomed}
          />
        </div>
        
        <Separator className="my-1" />
        
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-medium text-gray-500">Filtrar por valor</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilter} 
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Limpar filtro
            </Button>
          </div>
          <ValueRangeSlider
            minValue={minValue}
            maxValue={maxValue}
            valueRange={valueRange}
            onValueChange={handleRangeChange}
          />
        </div>
      </div>
    </div>
  );
};
