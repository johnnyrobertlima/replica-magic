import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  id: z.string().optional(),
  page_path: z.string().min(1, "Caminho da página é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  keywords: z.string().min(1, "Palavras-chave são obrigatórias"),
  og_image: z.string().optional(),
  favicon_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type SeoFormProps = {
  onSubmit: (values: FormValues) => void;
  initialValues?: FormValues;
  isEditing?: boolean;
  onCancel?: () => void;
};

export const SeoForm = ({
  onSubmit,
  initialValues,
  isEditing,
  onCancel,
}: SeoFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      page_path: "",
      title: "",
      description: "",
      keywords: "",
      og_image: "",
      favicon_url: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Configurações" : "Adicionar Configurações"}</CardTitle>
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
            <FormField
              control={form.control}
              name="favicon_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Favicon</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="URL do favicon (formato .ico recomendado)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? "Atualizar" : "Adicionar"}
              </Button>
              {isEditing && onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
