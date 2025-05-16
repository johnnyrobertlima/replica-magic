
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { validateImage } from "@/utils/imageUtils";

interface IconSize {
  name: string;
  width: number;
  height: number;
  description: string;
}

interface IconUploadFormProps {
  recommendedSizes: IconSize[];
  isEditMode: boolean;
  fileName: string;
  setFileName: (name: string) => void;
  currentEditId: string | null;
  onCancelEdit: () => void;
}

export const IconUploadForm = ({
  recommendedSizes,
  isEditMode,
  fileName,
  setFileName,
  currentEditId,
  onCancelEdit
}: IconUploadFormProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedIconType, setSelectedIconType] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  // Mutação para upload de ícones
  const uploadIconMutation = useMutation({
    mutationFn: async ({ file, fileName }: { file: File; fileName: string }) => {
      // Validar nome do arquivo
      if (!fileName || !fileName.trim()) {
        throw new Error("Nome do arquivo é obrigatório");
      }

      // Garantir que o arquivo tem uma extensão
      let finalFileName = fileName;
      if (!finalFileName.includes('.')) {
        const fileExtension = file.name.split('.').pop();
        finalFileName = `${finalFileName}.${fileExtension}`;
      }

      const path = `icons/${finalFileName}`;
      const { data, error } = await supabase.storage
        .from("oni-media")
        .upload(path, file, {
          upsert: isEditMode,
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["icons"] });
      setFile(null);
      setFileName("");
      setPreviewUrl(null);
      setSelectedIconType(null);
      setImageSize(null);
      toast({
        title: isEditMode ? "Ícone atualizado" : "Ícone enviado",
        description: `O ícone ${fileName} foi ${isEditMode ? "atualizado" : "enviado"} com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar ícone",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      try {
        // Validar o tipo de arquivo
        const allowedTypes = ['image/png', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];
        if (!allowedTypes.includes(selectedFile.type)) {
          throw new Error("Tipo de arquivo não permitido. Use PNG, SVG ou ICO.");
        }

        // Validar o tamanho do arquivo
        validateImage(selectedFile);

        // Criar URL para preview
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        setFile(selectedFile);

        // Extrair informações adicionais da imagem
        if (selectedFile.type !== 'image/svg+xml' && selectedFile.type !== 'image/x-icon') {
          const img = new Image();
          img.onload = () => {
            setImageSize({ width: img.width, height: img.height });
          };
          img.src = objectUrl;
        }

        // Definir nome padrão do arquivo baseado no tipo selecionado
        if (selectedIconType) {
          const iconSizeTemplate = recommendedSizes.find(size => size.name === selectedIconType);
          if (iconSizeTemplate) {
            setFileName(iconSizeTemplate.name);
          }
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro ao processar arquivo",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
        setFile(null);
        setPreviewUrl(null);
      }
    }
  };

  const handleIconTypeChange = (value: string) => {
    setSelectedIconType(value);
    const iconSizeTemplate = recommendedSizes.find(size => size.name === value);
    if (iconSizeTemplate) {
      setFileName(iconSizeTemplate.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && fileName) {
      uploadIconMutation.mutate({ file, fileName });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? "Atualizar Ícone" : "Enviar Novo Ícone"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="icon-type">Tipo de Ícone</Label>
            <Select value={selectedIconType || ''} onValueChange={handleIconTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de ícone" />
              </SelectTrigger>
              <SelectContent>
                {recommendedSizes.map(size => (
                  <SelectItem key={size.name} value={size.name}>
                    {size.name} {size.width > 0 ? `(${size.width}x${size.height})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon-file">Arquivo de Ícone</Label>
            <Input
              id="icon-file"
              type="file"
              accept=".png,.ico,.svg"
              onChange={handleFileChange}
              disabled={uploadIconMutation.isPending}
            />
            <p className="text-sm text-muted-foreground">
              Formatos aceitos: PNG, ICO, SVG
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-name">Nome do Arquivo</Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Ex: favicon.ico"
              disabled={uploadIconMutation.isPending}
            />
          </div>

          {previewUrl && (
            <div className="mt-4 flex flex-col items-center space-y-2">
              <p className="text-sm font-medium">Preview:</p>
              <div className="border p-4 rounded-md bg-slate-50 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              </div>
              {imageSize && (
                <p className="text-sm">
                  Dimensões: {imageSize.width}x{imageSize.height} pixels
                  {selectedIconType && (
                    <span>
                      {' '}
                      {(() => {
                        const recommended = recommendedSizes.find(
                          (size) => size.name === selectedIconType
                        );
                        if (
                          recommended &&
                          recommended.width > 0 &&
                          (imageSize.width !== recommended.width ||
                            imageSize.height !== recommended.height)
                        ) {
                          return (
                            <Badge variant="destructive" className="ml-2">
                              Diferente do tamanho recomendado ({recommended.width}x
                              {recommended.height})
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isEditMode && (
          <Button variant="outline" onClick={onCancelEdit}>
            Cancelar
          </Button>
        )}
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={!file || !fileName || uploadIconMutation.isPending}
        >
          {uploadIconMutation.isPending ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isEditMode ? "Atualizar Ícone" : "Enviar Ícone"}
        </Button>
      </CardFooter>
    </Card>
  );
};
