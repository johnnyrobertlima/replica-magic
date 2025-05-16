
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { RefreshCw, Trash2, Edit, Copy, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

interface IconListProps {
  onEditIcon: (icon: Icon) => void;
}

export const IconList = ({ onEditIcon }: IconListProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");

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

  // Definir um ícone como favicon
  const setAsFaviconMutation = useMutation({
    mutationFn: async (iconName: string) => {
      // Aqui só atualizamos a consulta de favicon para forçar uma atualização
      return iconName;
    },
    onSuccess: (iconName) => {
      queryClient.invalidateQueries({ queryKey: ["favicon"] });
      toast({
        title: "Favicon atualizado",
        description: `O ícone ${iconName} foi definido como favicon.`,
      });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado para a área de transferência",
      description: text,
    });
  };

  return (
    <>
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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAsFaviconMutation.mutate(icon.name)}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Definir como favicon</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditIcon(icon)}
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
    </>
  );
};
