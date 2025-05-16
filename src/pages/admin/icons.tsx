
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, Trash2, RefreshCw, Info, Edit, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { validateImage } from "@/utils/imageUtils";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Icon {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  updated_at: string;
}

interface IconSize {
  name: string;
  width: number;
  height: number;
  description: string;
}

const recommendedSizes: IconSize[] = [
  { name: "favicon.ico", width: 32, height: 32, description: "Ícone padrão do site" },
  { name: "apple-touch-icon.png", width: 180, height: 180, description: "Ícone para iOS Safari" },
  { name: "android-chrome-192x192.png", width: 192, height: 192, description: "Ícone para Android Chrome" },
  { name: "android-chrome-512x512.png", width: 512, height: 512, description: "Ícone para Android Chrome (grande)" },
  { name: "mstile-144x144.png", width: 144, height: 144, description: "Ícone para Windows" },
  { name: "safari-pinned-tab.svg", width: 0, height: 0, description: "Ícone SVG para Safari" },
];

export const AdminIconsPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedIconType, setSelectedIconType] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  // Consultar ícones existentes
  const { data: icons, isLoading } = useQuery({
    queryKey: ["icons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .storage
        .from("oni-media")
        .list("icons", {
          sortBy: { column: "name", order: "asc" }
        });

      if (error) {
        console.error("Erro ao buscar ícones:", error);
        throw error;
      }

      if (!data) return [];

      // Mapear informações adicionais dos ícones
      const iconsWithDetails = await Promise.all(data.map(async (item) => {
        const path = `icons/${item.name}`;
        const publicUrl = supabase.storage.from("oni-media").getPublicUrl(path).data.publicUrl;
        
        return {
          id: item.id,
          name: item.name,
          path: publicUrl,
          type: item.metadata?.mimetype || "unknown",
          size: item.metadata?.size || 0,
          updated_at: item.updated_at
        };
      }));

      return iconsWithDetails;
    },
  });

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
      setIsEditMode(false);
      setCurrentEditId(null);
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

  // Mutação para deletar ícones
  const deleteIconMutation = useMutation({
    mutationFn: async (path: string) => {
      const { error } = await supabase.storage
        .from("oni-media")
        .remove([`icons/${path}`]);

      if (error) throw error;
      return path;
    },
    onSuccess: (path) => {
      queryClient.invalidateQueries({ queryKey: ["icons"] });
      toast({
        title: "Ícone excluído",
        description: `O ícone ${path} foi excluído com sucesso.`,
      });
      setConfirmDeleteId(null);
      setConfirmDeleteName("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir ícone",
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

  const startEdit = (icon: Icon) => {
    setIsEditMode(true);
    setCurrentEditId(icon.id);
    setFileName(icon.name);
    // Preencher o tipo do ícone baseado no nome do arquivo
    const iconType = recommendedSizes.find(size => size.name === icon.name);
    if (iconType) {
      setSelectedIconType(iconType.name);
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setCurrentEditId(null);
    setFileName("");
    setFile(null);
    setPreviewUrl(null);
    setSelectedIconType(null);
    setImageSize(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado para a área de transferência",
      description: text,
    });
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
                <Button variant="outline" onClick={cancelEdit}>
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
        </TabsContent>

        <TabsContent value="list">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {icons && icons.length > 0 ? (
                    icons.map((icon) => (
                      <TableRow key={icon.id}>
                        <TableCell>
                          <div className="h-10 w-10 flex items-center justify-center border p-1 rounded bg-slate-50">
                            <img
                              src={icon.path}
                              alt={icon.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{icon.name}</TableCell>
                        <TableCell>{icon.type}</TableCell>
                        <TableCell>{Math.round(icon.size / 1024)} KB</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <div className="flex items-center space-x-2">
                            <span className="truncate">{icon.path}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(icon.path)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copiar URL</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(icon)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setConfirmDeleteId(icon.id);
                                setConfirmDeleteName(icon.name);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        Nenhum ícone encontrado. Faça upload de novos ícones na aba "Upload de Ícones".
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Guia de Tamanhos de Ícones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                É importante utilizar os tamanhos corretos de ícones para garantir que seu site seja exibido adequadamente
                em diferentes dispositivos e plataformas. Abaixo estão listados os tamanhos recomendados.
              </p>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Arquivo</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Uso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">favicon.ico</TableCell>
                      <TableCell>32x32 pixels</TableCell>
                      <TableCell>Ícone padrão do site</TableCell>
                      <TableCell className="font-mono text-sm">
                        {'<link rel="icon" href="/icons/favicon.ico">'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">apple-touch-icon.png</TableCell>
                      <TableCell>180x180 pixels</TableCell>
                      <TableCell>Ícone para iOS Safari</TableCell>
                      <TableCell className="font-mono text-sm">
                        {'<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">android-chrome-192x192.png</TableCell>
                      <TableCell>192x192 pixels</TableCell>
                      <TableCell>Ícone para Android Chrome</TableCell>
                      <TableCell className="font-mono text-sm">
                        {'<link rel="icon" type="image/png" sizes="192x192" href="/icons/android-chrome-192x192.png">'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">android-chrome-512x512.png</TableCell>
                      <TableCell>512x512 pixels</TableCell>
                      <TableCell>Ícone para Android Chrome (grande)</TableCell>
                      <TableCell className="font-mono text-sm">
                        {'<link rel="icon" type="image/png" sizes="512x512" href="/icons/android-chrome-512x512.png">'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">mstile-144x144.png</TableCell>
                      <TableCell>144x144 pixels</TableCell>
                      <TableCell>Ícone para Windows</TableCell>
                      <TableCell className="font-mono text-sm">
                        {'<meta name="msapplication-TileImage" content="/icons/mstile-144x144.png">'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">safari-pinned-tab.svg</TableCell>
                      <TableCell>SVG (qualquer tamanho)</TableCell>
                      <TableCell>Ícone SVG para Safari</TableCell>
                      <TableCell className="font-mono text-sm">
                        {'<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5">'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Melhores práticas:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use formatos PNG para a maioria dos ícones</li>
                  <li>O arquivo favicon.ico deve ser no formato ICO</li>
                  <li>Mantenha o tamanho dos arquivos pequeno para carregamento rápido</li>
                  <li>Utilize SVG para o safari-pinned-tab para melhor qualidade</li>
                  <li>Mantenha cores consistentes com sua marca</li>
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Implementação no HTML:</h3>
                <div className="bg-slate-50 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm">
{`<link rel="icon" href="/icons/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="192x192" href="/icons/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/icons/android-chrome-512x512.png">
<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5">
<meta name="msapplication-TileImage" content="/icons/mstile-144x144.png">
<meta name="msapplication-TileColor" content="#da532c">`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmação para exclusão */}
      <AlertDialog open={confirmDeleteId !== null} onOpenChange={() => setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o ícone "{confirmDeleteName}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDeleteName) {
                  deleteIconMutation.mutate(confirmDeleteName);
                }
              }}
            >
              {deleteIconMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminIconsPage;
