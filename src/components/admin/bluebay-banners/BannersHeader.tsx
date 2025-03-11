
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BannersHeaderProps {
  onCreateClick: () => void;
}

export function BannersHeader({ onCreateClick }: BannersHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Banners da Área Bluebay</h1>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Banner
      </Button>
    </div>
  );
}
