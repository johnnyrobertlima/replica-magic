
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TreemapControlsProps {
  minValue: number;
  maxValue: number;
  onValueRangeChange: (range: [number, number]) => void;
  onZoomReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const TreemapControls = ({
  minValue,
  maxValue,
  onValueRangeChange,
  onZoomReset,
  onZoomIn,
  onZoomOut
}: TreemapControlsProps) => {
  const [valueRange, setValueRange] = useState<[number, number]>([minValue, maxValue]);
  
  const handleRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setValueRange(newRange);
    onValueRangeChange(newRange);
  };

  return (
    <div className="mb-4 bg-white rounded-lg p-4 border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium">Filtrar por valor</h4>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onZoomIn}
            className="h-8 w-8 p-0"
            title="Ampliar seleção"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onZoomOut}
            className="h-8 w-8 p-0"
            title="Reduzir visualização"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onZoomReset}
            className="h-8 w-8 p-0"
            title="Resetar visualização"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <Slider
          min={minValue}
          max={maxValue}
          step={(maxValue - minValue) / 100}
          value={valueRange}
          onValueChange={handleRangeChange}
          className="my-6"
        />
        
        <div className="flex justify-between text-sm">
          <div className="font-medium">{formatCurrency(valueRange[0])}</div>
          <div className="font-medium">{formatCurrency(valueRange[1])}</div>
        </div>
      </div>
    </div>
  );
};
