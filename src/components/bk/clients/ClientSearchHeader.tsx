
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

interface ClientSearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateNew: () => void;
}

export const ClientSearchHeader = ({ 
  searchTerm, 
  onSearchChange, 
  onCreateNew 
}: ClientSearchHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
      <div className="flex gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, apelido, CNPJ ou código..."
            className="pl-8 w-[300px]"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button className="ml-2" onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>
    </div>
  );
};
