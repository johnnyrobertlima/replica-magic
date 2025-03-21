
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EstoqueSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const EstoqueSearchFilter = ({ searchTerm, setSearchTerm }: EstoqueSearchFilterProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Consulta de Estoque (Somente itens com estoque físico ou disponível)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar por código, descrição ou grupo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
