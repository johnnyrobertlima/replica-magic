
import React from "react";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/utils";

interface ValueRangeSliderProps {
  minValue: number;
  maxValue: number;
  valueRange: [number, number];
  onValueChange: (range: [number, number]) => void;
}

export const ValueRangeSlider = ({
  minValue,
  maxValue,
  valueRange,
  onValueChange
}: ValueRangeSliderProps) => {
  return (
    <div className="space-y-4">
      <Slider
        min={minValue}
        max={maxValue}
        step={(maxValue - minValue) / 100}
        value={valueRange}
        onValueChange={(value) => onValueChange(value as [number, number])}
        className="my-6"
      />
      
      <div className="flex justify-between text-sm">
        <div className="font-medium">{formatCurrency(valueRange[0])}</div>
        <div className="font-medium">{formatCurrency(valueRange[1])}</div>
      </div>
    </div>
  );
};
