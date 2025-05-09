
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DialogContainerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  "aria-describedby"?: string;
}

export function DialogContainer({
  isOpen,
  onOpenChange,
  selectedDate,
  onClose,
  title,
  children,
  "aria-describedby": ariaDescribedby,
}: DialogContainerProps) {
  const formattedDate = selectedDate
    ? format(new Date(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onClose();
        }}
        aria-describedby={ariaDescribedby}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {formattedDate}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
