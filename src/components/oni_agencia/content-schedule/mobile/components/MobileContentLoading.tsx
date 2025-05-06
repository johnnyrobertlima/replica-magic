
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export function MobileContentLoading() {
  // Create an array to render multiple card skeletons
  const skeletons = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <div className="space-y-4 p-4">
      {skeletons.map((index) => (
        <div 
          key={index} 
          className="bg-white rounded-md border p-3 overflow-hidden"
          style={{ borderLeft: '4px solid #e5e7eb' }}
        >
          {/* Card header - title & client/product */}
          <div className="mb-2">
            <Skeleton className="h-5 w-3/4 mb-1" />
            <Skeleton className="h-3 w-2/4 mt-1" /> {/* Cliente e produto */}
          </div>
          
          {/* Card body - date & service */}
          <div className="mb-3">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
          
          {/* Card footer - collaborator & status */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
