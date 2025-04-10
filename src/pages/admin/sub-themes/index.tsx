
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeManager } from "./ThemeManager";
import { SubThemeManager } from "./SubThemeManager";
import { EditorialLineManager } from "./EditorialLineManager";
import { ProductManager } from "./ProductManager";

export default function AdminSubThemes() {
  const [activeTab, setActiveTab] = useState("themes");

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Conteúdo</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="themes">Temas</TabsTrigger>
          <TabsTrigger value="subThemes">Sub Temas</TabsTrigger>
          <TabsTrigger value="editorialLines">Linhas Editoriais</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="themes">
          <ThemeManager />
        </TabsContent>
        
        <TabsContent value="subThemes">
          <SubThemeManager />
        </TabsContent>
        
        <TabsContent value="editorialLines">
          <EditorialLineManager />
        </TabsContent>
        
        <TabsContent value="products">
          <ProductManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
