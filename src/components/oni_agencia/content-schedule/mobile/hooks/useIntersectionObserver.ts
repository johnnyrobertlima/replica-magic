
import { useEffect, useRef } from 'react';

/**
 * Hook to create and manage an intersection observer for infinite scrolling
 */
export function useIntersectionObserver({
  hasMore,
  onLoadMore,
  isLoadingMore
}: {
  hasMore: boolean;
  onLoadMore?: () => void;
  isLoadingMore: boolean;
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, onLoadMore, isLoadingMore]);
  
  return loadMoreRef;
}
