
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

// Custom hook for creating properly configured sensors for DnD
export function useCustomDndSensors(delayMs = 0, tolerancePx = 5) {
  // Pointer sensor with better default settings
  const pointerSensor = useSensor(PointerSensor, {
    // Reduce delay and tolerance to make dragging more responsive
    activationConstraint: {
      delay: delayMs,
      tolerance: tolerancePx,
      // This reduces the amount of movement needed before starting the drag
    }
  });
  
  // Add keyboard sensor for accessibility
  const keyboardSensor = useSensor(KeyboardSensor, {});
  
  // Return multiple sensors
  return useSensors(pointerSensor, keyboardSensor);
}
