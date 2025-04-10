
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubThemeManager } from "./SubThemeManager";
import { ThemeManager } from "./ThemeManager";
import { EditorialLineManager } from "./EditorialLineManager";
import { ProductManager } from "./ProductManager";
import { StatusManager } from "./StatusManager";

export default function SubThemesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Conteúdo</h1>
      
      <Tabs defaultValue="sub-themes">
        <TabsList className="mb-4">
          <TabsTrigger value="sub-themes">Sub Temas</TabsTrigger>
          <TabsTrigger value="themes">Temas</TabsTrigger>
          <TabsTrigger value="editorial-lines">Linhas Editoriais</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
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
        
        <TabsContent value="status">
          <StatusManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
