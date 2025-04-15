
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ItemFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  groupFilter: string;
  onGroupFilterChange: (value: string) => void;
  groups: any[];
}

export const ItemFilters = ({
  searchTerm,
  onSearchChange,
  groupFilter,
  onGroupFilterChange,
  groups
}: ItemFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Buscar</label>
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="w-full md:w-[250px]">
            <label className="text-sm font-medium mb-1 block">Grupo</label>
            <Select 
              value={groupFilter} 
              onValueChange={onGroupFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os grupos</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.GRU_CODIGO} value={group.GRU_CODIGO}>
                    {group.GRU_DESCRICAO}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
