
import { ReactNode } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileDialogContainerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function MobileDialogContainer({
  isOpen,
  onOpenChange,
  selectedDate,
  onClose,
  title,
  children
}: MobileDialogContainerProps) {
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] p-0 h-[95vh] flex flex-col overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1 capitalize">{formattedDate}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
