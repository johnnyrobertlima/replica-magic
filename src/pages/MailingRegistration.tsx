import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ContactRegistrationDialog } from "@/components/mailing/ContactRegistrationDialog";
import { useState, useEffect } from "react";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

const MailingRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedMailing, setSelectedMailing] = useState<{ id: string; nome: string } | null>(null);
  const [session, setSession] = useState<any>(null);

  // Check for authentication status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: "Você precisa estar logado para acessar esta página",
        });
        navigate("/admin/login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
    },
  });

  const { data: mailings, isLoading, refetch } = useQuery({
    queryKey: ['mailings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mailing')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session, // Only fetch if user is authenticated
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: "Você precisa estar logado para cadastrar um mailing",
      });
      return;
    }

    try {
      const { error } = await supabase.from("mailing").insert({
        id: `${values.nome}_${Date.now()}`,
        nome: values.nome,
        telefone: "",
        nome_mailing: values.nome,
        cidade: "",
      });

      if (error) {
        console.error("Error details:", error);
        toast({
          variant: "destructive",
          title: "Erro ao cadastrar",
          description: "Ocorreu um erro ao cadastrar o mailing",
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Mailing cadastrado com sucesso",
      });
      form.reset();
      refetch();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao cadastrar o mailing",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!session) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Você precisa estar logado para excluir um mailing",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('mailing')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Mailing excluído com sucesso",
      });
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o mailing",
      });
    }
  };

  const handleEdit = (mailing: any) => {
    // TODO: Implement edit functionality
    console.log("Edit mailing:", mailing);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cadastro de Mailing</h1>
        
        <div className="mb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Mailing</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="submit">Cadastrar</Button>
                <Button type="button" variant="outline" onClick={() => navigate("/client-area")}>
                  Voltar
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Lista de Mailings</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mailings?.map((mailing) => (
                <TableRow key={mailing.id}>
                  <TableCell>{mailing.nome}</TableCell>
                  <TableCell>
                    {mailing.created_at
                      ? new Date(mailing.created_at).toLocaleDateString("pt-BR")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMailing({ id: mailing.id, nome: mailing.nome })}
                      >
                        Cadastrar Contatos
                      </Button>
                      <ActionButtons
                        onEdit={() => handleEdit(mailing)}
                        onDelete={() => handleDelete(mailing.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ContactRegistrationDialog
        mailingId={selectedMailing?.id || ''}
        mailingName={selectedMailing?.nome || ''}
        isOpen={!!selectedMailing}
        onClose={() => setSelectedMailing(null)}
      />
    </main>
  );
};

export default MailingRegistration;