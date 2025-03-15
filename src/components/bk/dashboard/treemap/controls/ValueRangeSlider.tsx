
import React, { useEffect, useState } from "react";
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
  // Create local state to track the slider value during interactions
  const [localValue, setLocalValue] = useState<[number, number]>(valueRange);

  // Update local value when props change (e.g., when reset button is clicked)
  useEffect(() => {
    setLocalValue(valueRange);
  }, [valueRange]);

  const handleValueChange = (value: number[]) => {
    const newRange = value as [number, number];
    setLocalValue(newRange);
    onValueChange(newRange);
  };

  return (
    <div className="space-y-4">
      <Slider
        min={minValue}
        max={maxValue}
        step={(maxValue - minValue) / 100}
        value={localValue}
        onValueChange={handleValueChange}
        className="my-6 treemap-value-slider"
      />
      
      <div className="flex justify-between text-sm">
        <div className="font-medium">{formatCurrency(localValue[0])}</div>
        <div className="font-medium">{formatCurrency(localValue[1])}</div>
      </div>
    </div>
  );
};
