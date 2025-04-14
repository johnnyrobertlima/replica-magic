
import { useState, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useProducts } from "@/hooks/useOniAgenciaThemes";

interface ProductsPopoverProps {
  events: CalendarEvent[];
}

export function ProductsPopover({ events }: ProductsPopoverProps) {
  const { data: products = [] } = useProducts();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize all products with zero count
    const initialCounts: Record<string, number> = {};
    products.forEach(product => {
      initialCounts[product.id] = 0;
    });
    
    // Count events per product
    events.forEach(event => {
      if (event.product_id) {
        initialCounts[event.product_id] = (initialCounts[event.product_id] || 0) + 1;
      }
    });
    
    setCounts(initialCounts);
  }, [events, products]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" title="Visualizar contagem por produto">
          <Package className="h-4 w-4 mr-2" />
          <span>Produtos</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border shadow-md">
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Contagem por Produto</h3>
          <div className="max-h-[300px] overflow-y-auto">
            {products.length > 0 ? (
              <div className="space-y-1">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center">
                      <div 
                        className="h-3 w-3 rounded-full mr-2" 
                        style={{ backgroundColor: product.color || '#CBD5E1' }} 
                      />
                      <span className="text-sm">{product.name}</span>
                    </div>
                    <span className="text-sm font-medium">{counts[product.id] || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
