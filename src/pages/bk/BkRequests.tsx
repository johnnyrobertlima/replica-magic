
import { useState, useEffect } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, FileUp, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";

// Define department options
const DEPARTMENTS = [
  "Showroom", 
  "Pedidos", 
  "Contas a Pagar", 
  "Contas a Receber", 
  "BK", 
  "Cariacica", 
  "Santa Catarina", 
  "RH", 
  "Fiscal", 
  "Desenvolvimento", 
  "Diretoria", 
  "Representantes", 
  "TI"
];

// Request status with corresponding badge colors
const REQUEST_STATUS = {
  "Aberto": "default",
  "Em Análise": "warning",
  "Em Andamento": "secondary",
  "Respondido": "info",
  "Concluído": "success",
  "Cancelado": "destructive"
};

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

interface Request {
  id: string;
  protocol: string;
  title: string;
  department: string;
  description: string;
  status: keyof typeof REQUEST_STATUS;
  created_at: string;
  updated_at: string;
  attachment_url?: string;
  response?: string;
}

const BkRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch user's requests on load
  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      setIsLoading(true);
      
      // First get the current user's ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para visualizar suas solicitações.",
          variant: "destructive",
        });
        return;
      }
      
      // Then fetch the requests for this user
      const { data, error } = await supabase
        .from('bk_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Erro ao carregar solicitações",
        description: error.message || "Não foi possível carregar suas solicitações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${session.user.id}/${protocolNumber}/${Math.random()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('request_attachments')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) throw uploadError;
        
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('request_attachments')
          .getPublicUrl(filePath);
        
        attachmentUrl = publicUrl;
      }
      
      // Insert request into database
      const { data, error } = await supabase
        .from('bk_requests')
        .insert([{
          protocol: protocolNumber,
          title: values.title,
          department: values.department,
          description: values.description,
          status: 'Aberto',
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
      fetchUserRequests();
      
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

  const getBadgeVariant = (status: keyof typeof REQUEST_STATUS) => {
    return REQUEST_STATUS[status] as "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BkMenu />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Solicitações</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Requests List Section */}
          <div className="lg:col-span-8">
            <Card className="mb-6">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Minhas Solicitações</CardTitle>
                  <CardDescription>
                    Acompanhe o status das suas solicitações
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchUserRequests}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Atualizar
                </Button>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : requests.length > 0 ? (
                  <Accordion type="multiple" className="w-full">
                    {requests.map((request) => (
                      <AccordionItem key={request.id} value={request.id} className="border-b">
                        <AccordionTrigger className="py-4 hover:no-underline hover:bg-gray-50 px-4 -mx-4 rounded-md">
                          <div className="flex items-center justify-between w-full text-left">
                            <div className="flex items-center gap-3">
                              <Badge variant={getBadgeVariant(request.status)}>
                                {request.status}
                              </Badge>
                              <div>
                                <p className="font-medium">{request.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {request.protocol} • {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground hidden md:block">
                              {request.department}
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 px-4 pt-2">
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium">Descrição:</h4>
                              <p className="mt-1 text-sm whitespace-pre-line">
                                {request.description}
                              </p>
                            </div>
                            
                            {request.attachment_url && (
                              <div>
                                <h4 className="text-sm font-medium">Anexo:</h4>
                                <a 
                                  href={request.attachment_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-sm text-blue-600 hover:underline flex items-center mt-1"
                                >
                                  <FileUp className="h-4 w-4 mr-1" />
                                  Visualizar anexo
                                </a>
                              </div>
                            )}
                            
                            {request.response && (
                              <div className="mt-4 bg-blue-50 p-3 rounded-md">
                                <h4 className="text-sm font-medium">Resposta:</h4>
                                <p className="mt-1 text-sm whitespace-pre-line">
                                  {request.response}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                              <p>Criado em: {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}</p>
                              {request.updated_at !== request.created_at && (
                                <p>Atualizado em: {format(new Date(request.updated_at), 'dd/MM/yyyy HH:mm')}</p>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-10 px-4">
                    <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Você ainda não possui solicitações. Use o formulário ao lado para criar uma nova solicitação.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-4">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BkRequests;
