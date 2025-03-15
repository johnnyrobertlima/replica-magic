
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
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6">
      <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, apelido, CNPJ ou código..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="text-xs text-muted-foreground mt-1">
            Digite qualquer parte do nome, apelido, CNPJ ou código do cliente
          </div>
        </div>
        <Button className="ml-0 sm:ml-2" onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>
    </div>
  );
};
