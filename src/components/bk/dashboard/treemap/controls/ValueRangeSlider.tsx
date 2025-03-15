
import React, { useEffect, useState, useRef } from "react";
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
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update local value when props change (e.g., when reset button is clicked)
  useEffect(() => {
    setLocalValue(valueRange);
    
    // Force a rerender of the slider component when valueRange changes
    if (sliderRef.current) {
      const event = new Event('change', { bubbles: true });
      sliderRef.current.dispatchEvent(event);
    }
  }, [valueRange]);

  const handleValueChange = (value: number[]) => {
    const newRange = value as [number, number];
    setLocalValue(newRange);
    onValueChange(newRange);
  };

  return (
    <div className="space-y-4" ref={sliderRef}>
      <Slider
        min={minValue}
        max={maxValue}
        step={(maxValue - minValue) / 100}
        value={localValue}
        onValueChange={handleValueChange}
        className="my-6 treemap-value-slider"
      />
      
      <div className="flex justify-between text-sm">
        <div className="font-medium text-gray-700">{formatCurrency(localValue[0])}</div>
        <div className="font-medium text-gray-700">{formatCurrency(localValue[1])}</div>
      </div>
    </div>
  );
};
