
import { useState } from "react";
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
  const [status, setStatus] = useState<"pendente" | "aprovado" | "reprovado">("pendente");
  
  if (!showButtons && status === "pendente") return null;
  
  const handleApprove = () => {
    setStatus("aprovado");
    onApprove(separacaoId);
  };
  
  const handleReject = () => {
    setStatus("reprovado");
    onReject(separacaoId);
  };
  
  return (
    <div className="flex justify-between gap-2 p-4 border-t">
      {status === "pendente" ? (
        <>
          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={handleReject}
          >
            Reprovar
          </Button>
          <Button
            variant="default"
            size="sm"
            type="button"
            onClick={handleApprove}
          >
            Aprovar
          </Button>
        </>
      ) : (
        <div className="ml-auto">
          <span className={`px-2 py-1 text-sm font-medium rounded-md ${
            status === "aprovado" 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {status === "aprovado" ? "Aprovado" : "Reprovado"}
          </span>
        </div>
      )}
    </div>
  );
};
