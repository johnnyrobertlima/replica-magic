
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

// Hook to create properly configured sensors
export function useCustomDndSensors(delayMs = 150, tolerancePx = 8) {
  return useSensors(
    useSensor(PointerSensor, {
      // Configure the activation constraints
      activationConstraint: {
        delay: delayMs,
        tolerance: tolerancePx,
      }
    })
  );
}
