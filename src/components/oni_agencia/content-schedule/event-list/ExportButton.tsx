
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
}

export function ExportButton({ onClick }: ExportButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <File className="h-4 w-4" />
      <span>Exportar PDF</span>
    </Button>
  );
}
