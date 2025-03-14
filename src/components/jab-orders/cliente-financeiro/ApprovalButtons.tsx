
import { Button } from "@/components/ui/button";

interface ApprovalButtonsProps {
  separacaoId: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  showButtons: boolean;
}

export const ApprovalButtons = ({ 
  separacaoId, 
  onApprove, 
  onReject, 
  showButtons 
}: ApprovalButtonsProps) => {
  if (!showButtons) return null;
  
  return (
    <div className="flex justify-end gap-2 p-4 border-t">
      <Button
        variant="destructive"
        size="sm"
        type="button"
        onClick={() => onReject(separacaoId)}
      >
        Reprovar
      </Button>
      <Button
        variant="default"
        size="sm"
        type="button"
        onClick={() => onApprove(separacaoId)}
      >
        Aprovar
      </Button>
    </div>
  );
};
