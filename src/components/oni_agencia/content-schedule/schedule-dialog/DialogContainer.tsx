
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReactNode } from "react";

interface DialogContainerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

export function DialogContainer({
  isOpen,
  onOpenChange,
  selectedDate,
  onClose,
  children,
  title
}: DialogContainerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {title}
            <div className="text-sm font-normal text-muted-foreground mt-1">
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
          </DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
