import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DEPARTMENTS, RequestStatus } from "./types";

// Form validation schema
const requestSchema = z.object({
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres" }),
  department: z.string().refine(val => DEPARTMENTS.includes(val), {
    message: "Por favor selecione um departamento válido"
  }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  attachment: z.any().optional()
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestFormProps {
  onRequestSubmitted: () => void;
}

export default function RequestForm({ onRequestSubmitted }: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      department: "",
      description: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const onSubmit = async (values: RequestFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para enviar uma solicitação.",
          variant: "destructive",
        });
        return;
      }
      
      // Generate protocol number: BK-YYYY-NNNNN
      const protocolNumber = `BK-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      let attachmentUrl = null;
      
      // Upload file if there is one
      if (selectedFile) {
        try {
          // First check if the bucket exists
          const { data: bucketList, error: bucketError } = await supabase.storage
            .listBuckets();
            
          const bucketExists = bucketList?.some(bucket => bucket.name === 'request_attachments');
            
          if (bucketError || !bucketExists) {
            console.error("Bucket check error:", bucketError || "Bucket request_attachments does not exist");
            toast({
              title: "Aviso",
              description: "Sistema de armazenamento não está configurado. Sua solicitação será enviada sem anexo.",
              variant: "default",
            });
          } else {
            // Upload the file
            const fileExt = selectedFile.name.split('.').pop();
            const filePath = `${session.user.id}/${protocolNumber}/${Math.random()}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('request_attachments')
              .upload(filePath, selectedFile, {
                cacheControl: '3600',
                upsert: false
              });
            
            if (uploadError) {
              console.error("File upload error:", uploadError);
              toast({
                title: "Erro ao enviar arquivo",
                description: "Não foi possível enviar o anexo, mas sua solicitação será processada.",
                variant: "default",
              });
            } else {
              // Get public URL for the uploaded file
              const { data: { publicUrl } } = supabase.storage
                .from('request_attachments')
                .getPublicUrl(filePath);
              
              attachmentUrl = publicUrl;
            }
          }
        } catch (fileError: any) {
          console.error("File upload error:", fileError);
          toast({
            title: "Erro ao enviar arquivo",
            description: "Não foi possível enviar o anexo, mas sua solicitação será processada.",
            variant: "default",
          });
        }
      }
      
      // Insert request into database
      const { data, error } = await supabase
        .from('bk_requests')
        .insert([{
          protocol: protocolNumber,
          title: values.title,
          department: values.department,
          description: values.description,
          status: 'Aberto' as RequestStatus,
          user_id: session.user.id,
          user_email: session.user.email,
          attachment_url: attachmentUrl
        }])
        .select();
      
      if (error) throw error;
      
      // Reset form
      form.reset();
      setSelectedFile(null);
      
      // Reload requests list
      onRequestSubmitted();
      
      toast({
        title: "Solicitação enviada com sucesso",
        description: `Protocolo gerado: ${protocolNumber}`,
        variant: "default",
      });
      
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message || "Não foi possível enviar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Nova Solicitação</CardTitle>
        <CardDescription>
          Preencha o formulário para abrir uma nova solicitação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Resumo da sua solicitação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meu Departamento</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um departamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhe sua solicitação aqui..."
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="attachment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anexar Documento (opcional)</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <Input
                        type="file"
                        onChange={(e) => {
                          handleFileChange(e);
                          field.onChange(e);
                        }}
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="text-xs text-muted-foreground">
                          Arquivo selecionado: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Tamanho máximo: 5MB. Formatos: PDF, DOCX, XLSX, PNG, JPG
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Solicitação
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
