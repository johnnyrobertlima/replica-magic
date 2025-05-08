
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Product } from "@/pages/admin/sub-themes/types";
import { Loader2 } from "lucide-react";

interface ProductSelectProps {
  products: Product[];
  isLoading: boolean;
  value: string | null;
  onValueChange: (value: string) => void;
}

export function ProductSelect({ 
  products, 
  isLoading, 
  value, 
  onValueChange 
}: ProductSelectProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="product_id">Produto</Label>
      <Select
        value={value || "null"}
        onValueChange={onValueChange}
      >
        <SelectTrigger id="product_id" className="w-full">
          <SelectValue placeholder="Selecione o produto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null">Nenhum</SelectItem>
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
              <span>Carregando...</span>
            </div>
          ) : (
            products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
