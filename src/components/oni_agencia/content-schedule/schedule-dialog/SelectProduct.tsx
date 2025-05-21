
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
  required?: boolean;
}

export function SelectProduct({ 
  products, 
  value, 
  isLoading, 
  onChange,
  required = false
}: SelectProductProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="product_id">
        Produto{required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        disabled={isLoading}
        value={value || "null"}
        onValueChange={onChange}
        data-testid="product-select"
      >
        <SelectTrigger className={`w-full bg-white ${required && !value && "border-red-300"}`}>
          <SelectValue placeholder="Selecione um produto" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            <SelectItem value="null">-- Nenhum --</SelectItem>
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
