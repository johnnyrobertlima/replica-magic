import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  id: z.string().optional(),
  page_path: z.string().min(1, "Caminho da página é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  keywords: z.string().min(1, "Palavras-chave são obrigatórias"),
  og_image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type SeoSettingsRow = {
  id: string;
  page_path: string;
  title: string;
  description: string;
  keywords: string[];
  og_image?: string;
};

export const AdminSEO = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      page_path: "",
      title: "",
      description: "",
      keywords: "",
      og_image: "",
    },
  });

  const { data: seoSettings, isLoading } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .order("page_path");
      if (error) throw error;
      return data as SeoSettingsRow[];
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const keywordsArray = values.keywords.split(",").map((k) => k.trim());
      const payload = {
        page_path: values.page_path,
        title: values.title,
        description: values.description,
        keywords: keywordsArray,
        og_image: values.og_image || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("seo_settings")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("seo_settings")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      toast({
        title: "Sucesso",
        description: editingId
          ? "Configurações de SEO atualizadas"
          : "Configurações de SEO criadas",
      });
      form.reset();
      setEditingId(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações de SEO",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (setting: SeoSettingsRow) => {
    setEditingId(setting.id);
    form.reset({
      ...setting,
      keywords: setting.keywords.join(", "),
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("seo_settings").delete().eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      toast({
        title: "Sucesso",
        description: "Configurações de SEO excluídas",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir as configurações de SEO",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações de SEO</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações de SEO para cada página do site
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Editar Configurações" : "Adicionar Configurações"}
          </CardTitle>
          <CardDescription>
            Preencha os campos abaixo para configurar o SEO da página
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="page_path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caminho da Página</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: /sobre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Título da página para SEO"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição da página para SEO"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Palavras-chave</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Palavras-chave separadas por vírgula"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="og_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem Open Graph</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="URL da imagem para compartilhamento"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Atualizar" : "Adicionar"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {seoSettings?.map((setting) => (
          <Card key={setting.id}>
            <CardHeader>
              <CardTitle>{setting.page_path}</CardTitle>
              <CardDescription>{setting.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {setting.keywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(setting)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(setting.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};