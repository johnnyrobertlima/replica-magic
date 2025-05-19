
import { useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

// Custom mouse sensor that only activates on left-click for draggable elements
export class CustomMouseSensor extends MouseSensor {
  static activators = [{
    eventName: 'onMouseDown' as const,
    handler: ({ nativeEvent: event }: ReactMouseEvent<Element, MouseEvent>) => {
      if (event.button !== 0) return false; // Only left clicks
      
      // Check if we're clicking on a draggable element
      const target = event.target as HTMLElement;
      const isDraggable = target.closest('[data-draggable="true"]');
      
      if (!isDraggable) return false;
      
      return true;
    },
  }];
}

// Custom touch sensor with improved activation for draggable elements
export class CustomTouchSensor extends TouchSensor {
  static activators = [{
    eventName: 'onTouchStart' as const,
    handler: ({ nativeEvent: event }: ReactTouchEvent<Element>) => {
      // Check if we're touching a draggable element
      const target = event.target as HTMLElement;
      const isDraggable = target.closest('[data-draggable="true"]');
      
      if (!isDraggable) return false;
      
      return true;
    },
  }];
}

// Hook to create properly configured sensors
export function useCustomDndSensors(delayMs = 150, tolerancePx = 8) {
  return useSensors(
    useSensor(CustomMouseSensor, {
      activationConstraint: {
        delay: delayMs,
        tolerance: tolerancePx,
      }
    }),
    useSensor(CustomTouchSensor, {
      activationConstraint: {
        delay: delayMs,
        tolerance: tolerancePx,
      }
    })
  );
}
