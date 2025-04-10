
import { useState } from "react";
import { Search, Filter, Save, Edit, Trash2, Plus, PackageCheck } from "lucide-react";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useItemManagement } from "@/hooks/bluebay_adm/useItemManagement";
import { ItemForm } from "@/components/bluebay_adm/item-management/ItemForm";
import { ItemsTable } from "@/components/bluebay_adm/item-management/ItemsTable";
import { ItemsTableSkeleton } from "@/components/bluebay_adm/item-management/ItemsTableSkeleton";
import { Pagination } from "@/components/bluebay_adm/item-management/Pagination";

const BluebayAdmItemManagement = () => {
  const { 
    items, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    groupFilter, 
    setGroupFilter, 
    groups,
    selectedItem,
    setSelectedItem,
    isDialogOpen,
    setIsDialogOpen,
    handleSaveItem,
    handleDeleteItem,
    pagination,
    totalCount
  } = useItemManagement();

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Gerenciamento de Itens</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-2 items-center">
                <Plus className="h-4 w-4" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>{selectedItem ? "Editar Item" : "Novo Item"}</DialogTitle>
                <DialogDescription>
                  {selectedItem 
                    ? "Edite as informações do item selecionado" 
                    : "Preencha os dados para cadastrar um novo item"}
                </DialogDescription>
              </DialogHeader>
              
              <ItemForm 
                item={selectedItem} 
                onSave={handleSaveItem} 
                groups={groups}
              />
            </DialogContent>
          </Dialog>
        </div>

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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  onValueChange={setGroupFilter}
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

        {isLoading ? (
          <ItemsTableSkeleton />
        ) : (
          <>
            <ItemsTable 
              items={items} 
              onEdit={(item) => {
                setSelectedItem(item);
                setIsDialogOpen(true);
              }}
              onDelete={handleDeleteItem}
            />
            
            <div className="mt-4">
              <Pagination 
                currentPage={pagination.currentPage}
                totalPages={Math.ceil(totalCount / pagination.pageSize)}
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
      </div>
    </main>
  );
};

export default BluebayAdmItemManagement;
