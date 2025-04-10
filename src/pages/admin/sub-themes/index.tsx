
import { useState } from "react";
import { Book, ListTree } from "lucide-react";
import { SubThemeManager } from "./SubThemeManager";
import { ThemeManager } from "./ThemeManager";
import { EditorialLineManager } from "./EditorialLineManager";
import { ProductManager } from "./ProductManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminSubThemes = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <ListTree className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Gerenciamento de Conteúdo</h1>
      </div>

      <Tabs defaultValue="sub-themes" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="sub-themes">Sub Temas</TabsTrigger>
          <TabsTrigger value="themes">Temas</TabsTrigger>
          <TabsTrigger value="editorial-lines">Linhas Editoriais</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="sub-themes">
          <SubThemeManager />
        </TabsContent>
        
        <TabsContent value="themes">
          <ThemeManager />
        </TabsContent>
        
        <TabsContent value="editorial-lines">
          <EditorialLineManager />
        </TabsContent>
        
        <TabsContent value="products">
          <ProductManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSubThemes;
