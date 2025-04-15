
import { ItemsTable } from "@/components/bluebay_adm/item-management/ItemsTable";
import { ItemsTableSkeleton } from "@/components/bluebay_adm/item-management/ItemsTableSkeleton";
import { Pagination } from "@/components/bluebay_adm/item-management/Pagination";

interface ItemsContentProps {
  items: any[];
  isLoading: boolean;
  onEdit: (item: any) => void;
  onDelete: (item: any) => Promise<void>;
  pagination: {
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    pageSize: number;
  };
  totalCount: number;
}

export const ItemsContent = ({
  items,
  isLoading,
  onEdit,
  onDelete,
  pagination,
  totalCount
}: ItemsContentProps) => {
  return (
    <>
      {isLoading ? (
        <ItemsTableSkeleton />
      ) : (
        <>
          <ItemsTable 
            items={items} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
          
          <div className="mt-4">
            <Pagination 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goToPage}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              goToNextPage={pagination.goToNextPage}
              goToPreviousPage={pagination.goToPreviousPage}
              totalCount={totalCount}
              pageSize={pagination.pageSize}
            />
          </div>
        </>
      )}
    </>
  );
};
