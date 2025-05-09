
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SelectProductProps {
  products: any[];
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function SelectProduct({ 
  products, 
  value, 
  isLoading, 
  onChange 
}: SelectProductProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="product_id">Produto</Label>
      <Select
        disabled={isLoading}
        value={value || ""}
        onValueChange={onChange}
        data-testid="product-select"
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um produto" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="">-- Nenhum --</SelectItem>
            {products && products.length > 0 && products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
