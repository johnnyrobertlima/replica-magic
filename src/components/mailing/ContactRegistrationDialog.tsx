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
import { ActionButtons } from "@/components/admin/ActionButtons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

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
  const [editingContact, setEditingContact] = useState<any>(null);

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
      const formattedPhone = values.telefone.startsWith('55') 
        ? values.telefone 
        : `55${values.telefone}`;

      if (editingContact) {
        const { error } = await supabase
          .from("mailing_contacts")
          .update({
            nome: values.nome,
            telefone: formattedPhone,
            email: values.email || null,
          })
          .eq('id', editingContact.id);

        if (error) {
          if (error.code === '23505') {
            toast({
              variant: "destructive",
              title: "Erro ao atualizar",
              description: "Este email ou telefone já está cadastrado neste mailing",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Erro ao atualizar",
              description: "Ocorreu um erro ao atualizar o contato",
            });
          }
          return;
        }

        toast({
          title: "Sucesso!",
          description: "Contato atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from("mailing_contacts")
          .insert({
            mailing_id: mailingId,
            nome: values.nome,
            telefone: formattedPhone,
            email: values.email || null,
          });

        if (error) {
          if (error.code === '23505') {
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
      }

      form.reset();
      setEditingContact(null);
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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mailing_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Contato excluído com sucesso",
      });
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o contato",
      });
    }
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    form.reset({
      nome: contact.nome,
      telefone: contact.telefone.startsWith('55') ? contact.telefone.slice(2) : contact.telefone,
      email: contact.email || '',
    });
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

        const failedContacts: any[] = [];
        const successfulContacts: any[] = [];

        for (const contact of contacts) {
          const { error } = await supabase
            .from("mailing_contacts")
            .insert(contact);

          if (error && error.code === '23505') {
            failedContacts.push(contact);
          } else if (!error) {
            successfulContacts.push(contact);
          }
        }

        if (failedContacts.length > 0) {
          const duplicatesList = failedContacts
            .map(c => `${c.nome} (${c.telefone}${c.email ? `, ${c.email}` : ''})`)
            .join(', ');

          toast({
            variant: "destructive",
            title: `${failedContacts.length} contatos não foram importados`,
            description: `Os seguintes contatos já existem: ${duplicatesList}`,
          });
        }

        if (successfulContacts.length > 0) {
          toast({
            title: "Sucesso!",
            description: `${successfulContacts.length} contatos importados com sucesso`,
          });
        }

        refetch();
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
              <Button type="submit">
                {editingContact ? 'Atualizar' : 'Cadastrar'}
              </Button>
              {editingContact && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingContact(null);
                    form.reset({
                      nome: "",
                      telefone: "",
                      email: "",
                    });
                  }}
                  className="ml-2"
                >
                  Cancelar
                </Button>
              )}
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
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
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
                      <TableCell className="text-right">
                        <ActionButtons
                          onEdit={() => handleEdit(contact)}
                          onDelete={() => handleDelete(contact.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};