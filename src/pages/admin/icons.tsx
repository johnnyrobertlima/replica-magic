
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { IconList } from "@/components/admin/icons/IconList";
import { IconUploadForm } from "@/components/admin/icons/IconUploadForm";
import { SizeGuide } from "@/components/admin/icons/SizeGuide";
import { recommendedSizes } from "@/components/admin/icons/constants";

interface Icon {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  updated_at: string;
  width?: number;
  height?: number;
}

export const AdminIconsPage = () => {
  const [fileName, setFileName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  const startEdit = (icon: Icon) => {
    setIsEditMode(true);
    setCurrentEditId(icon.id);
    setFileName(icon.name);
    // Preencher o tipo do ícone baseado no nome do arquivo
    const iconType = recommendedSizes.find(size => size.name === icon.name);
    if (iconType) {
      // No need to set selectedIconType here as it's handled in the IconUploadForm component
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setCurrentEditId(null);
    setFileName("");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciador de Ícones do Site</h1>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload de Ícones</TabsTrigger>
          <TabsTrigger value="list">Lista de Ícones</TabsTrigger>
          <TabsTrigger value="guide">Guia de Tamanhos</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <IconUploadForm
            recommendedSizes={recommendedSizes}
            isEditMode={isEditMode}
            fileName={fileName}
            setFileName={setFileName}
            currentEditId={currentEditId}
            onCancelEdit={cancelEdit}
          />
        </TabsContent>

        <TabsContent value="list">
          <IconList onEditIcon={startEdit} />
        </TabsContent>

        <TabsContent value="guide">
          <SizeGuide recommendedSizes={recommendedSizes} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminIconsPage;
