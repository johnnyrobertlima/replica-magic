
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface LoadMoreIndicatorProps {
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore?: () => void;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

export function LoadMoreIndicator({ 
  hasMore, 
  isLoadingMore, 
  onLoadMore,
  loadMoreRef
}: LoadMoreIndicatorProps) {
  if (!hasMore) return null;

  return (
    <div
      ref={loadMoreRef}
      className="w-full flex justify-center py-4"
    >
      {isLoadingMore ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando mais...</span>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          onClick={onLoadMore}
          className="text-xs flex items-center"
        >
          <ChevronDown className="h-4 w-4 mr-1" />
          Carregar mais
        </Button>
      )}
    </div>
  );
}
