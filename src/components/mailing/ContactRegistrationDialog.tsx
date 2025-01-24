import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Upload } from "lucide-react";
import Papa from 'papaparse';

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(8, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal('')),
});

interface ContactRegistrationDialogProps {
  mailingId: string;
  mailingName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactRegistrationDialog = ({
  mailingId,
  mailingName,
  isOpen,
  onClose,
}: ContactRegistrationDialogProps) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
    },
  });

  const { data: contacts, isLoading, refetch } = useQuery({
    queryKey: ['mailing-contacts', mailingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mailing_contacts')
        .select('*')
        .eq('mailing_id', mailingId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Format phone number
      const formattedPhone = values.telefone.startsWith('55') 
        ? values.telefone 
        : `55${values.telefone}`;

      const { error } = await supabase
        .from("mailing_contacts")
        .insert({
          mailing_id: mailingId,
          nome: values.nome,
          telefone: formattedPhone,
          email: values.email || null,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            variant: "destructive",
            title: "Erro ao cadastrar",
            description: "Este email ou telefone já está cadastrado neste mailing",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao cadastrar",
            description: "Ocorreu um erro ao cadastrar o contato",
          });
        }
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Contato cadastrado com sucesso",
      });
      form.reset();
      refetch();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao cadastrar o contato",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: async (results) => {
        const contacts = results.data.slice(1).map((row: any) => ({
          mailing_id: mailingId,
          nome: row[0],
          telefone: row[1].startsWith('55') ? row[1] : `55${row[1]}`,
          email: row[2] || null,
        }));

        const { error } = await supabase
          .from("mailing_contacts")
          .insert(contacts);

        if (error) {
          toast({
            variant: "destructive",
            title: "Erro ao importar",
            description: "Alguns contatos podem já estar cadastrados neste mailing",
          });
        } else {
          toast({
            title: "Sucesso!",
            description: "Contatos importados com sucesso",
          });
          refetch();
        }
      },
      header: true,
    });
  };

  const downloadTemplate = () => {
    const template = 'Nome,Telefone,Email\nJoão Silva,11999999999,joao@email.com';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_mailing.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cadastro de Contatos - {mailingName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Cadastrar</Button>
            </form>
          </Form>

          <div className="flex gap-4 items-center">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="max-w-xs"
            />
            <Button variant="outline" onClick={downloadTemplate}>
              <Upload className="h-4 w-4 mr-2" />
              Baixar Template
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts?.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.nome}</TableCell>
                    <TableCell>{contact.telefone}</TableCell>
                    <TableCell>{contact.email || '-'}</TableCell>
                    <TableCell>
                      {contact.created_at
                        ? new Date(contact.created_at).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};