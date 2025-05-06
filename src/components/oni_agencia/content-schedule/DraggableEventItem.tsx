
import { useDraggable } from "@dnd-kit/core";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "./EventItem";

interface DraggableEventItemProps {
  event: CalendarEvent;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  showBorder?: boolean;
}

export function DraggableEventItem({ 
  event, 
  onClick, 
  className,
  showBorder = true
}: DraggableEventItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: event.id,
    data: event
  });
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="w-full"
    >
      <EventItem 
        event={event} 
        onClick={onClick} 
        className={className}
        showBorder={showBorder}
        isDragging={isDragging}
      />
    </div>
  );
}
