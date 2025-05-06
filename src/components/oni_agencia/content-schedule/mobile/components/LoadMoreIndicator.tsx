
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreIndicatorProps {
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore?: () => void;
  loadMoreRef?: React.RefObject<HTMLDivElement>;
  hideWhenNoMoreData?: boolean; // New prop to control visibility
}

export function LoadMoreIndicator({ 
  hasMore, 
  isLoadingMore, 
  onLoadMore,
  loadMoreRef,
  hideWhenNoMoreData = true // Default to true
}: LoadMoreIndicatorProps) {
  // If there's no more data and we want to hide the component
  if (!hasMore && hideWhenNoMoreData) {
    return null;
  }
  
  return (
    <div 
      ref={loadMoreRef} 
      className="flex justify-center py-4"
    >
      {hasMore ? (
        <Button
          variant="outline"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="w-full max-w-[200px]"
        >
          {isLoadingMore ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            'Carregar mais'
          )}
        </Button>
      ) : (
        <span className="text-sm text-muted-foreground">
          Todos os eventos carregados
        </span>
      )}
    </div>
  );
}
