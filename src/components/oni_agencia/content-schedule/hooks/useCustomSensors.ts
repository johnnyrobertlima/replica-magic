
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";

// Hook personalizado para criar sensores configurados corretamente para o DnD
export function useCustomDndSensors(delayMs = 0, tolerancePx = 5) {
  const pointerSensor = useSensor(PointerSensor, {
    // Reduzir o atraso e a tolerância para tornar o arrasto mais responsivo
    activationConstraint: {
      delay: delayMs,
      tolerance: tolerancePx,
      // Isso reduz a quantidade de movimento necessária antes de iniciar o arrastar
    }
  });
  
  return useSensors(pointerSensor);
}
