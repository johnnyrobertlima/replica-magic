import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ContactForm } from "./ContactForm";
import { ContactList } from "./ContactList";
import { CSVImport } from "./CSVImport";

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

  const handleSubmit = async (values: any) => {
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
          handleError(error);
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
          handleError(error);
          return;
        }

        toast({
          title: "Sucesso!",
          description: "Contato cadastrado com sucesso",
        });
      }

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

  const handleError = (error: any) => {
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

  const handleCSVImport = async (contacts: any[]) => {
    const failedContacts: any[] = [];
    const successfulContacts: any[] = [];

    for (const contact of contacts) {
      try {
        const { error } = await supabase
          .from("mailing_contacts")
          .insert({
            ...contact,
            mailing_id: mailingId,
          });

        if (error) {
          if (error.code === '23505') {
            failedContacts.push(contact);
          } else {
            console.error("Error importing contact:", error);
          }
        } else {
          successfulContacts.push(contact);
        }
      } catch (error) {
        console.error("Error importing contact:", error);
      }
    }

    if (failedContacts.length > 0) {
      const duplicatesList = failedContacts
        .map(c => `${c.nome} (${c.telefone}${c.email ? `, ${c.email}` : ''})`)
        .join('\n');

      toast({
        variant: "destructive",
        title: `${failedContacts.length} contatos não foram importados`,
        description: `Os seguintes contatos já existem:\n${duplicatesList}`,
      });
    }

    if (successfulContacts.length > 0) {
      toast({
        title: "Sucesso!",
        description: `${successfulContacts.length} contatos importados com sucesso`,
      });
      refetch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cadastro de Contatos - {mailingName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <ContactForm
            onSubmit={handleSubmit}
            initialValues={editingContact}
            isEditing={!!editingContact}
            onCancel={() => setEditingContact(null)}
          />

          <CSVImport onImport={handleCSVImport} />

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ContactList
              contacts={contacts || []}
              onEdit={setEditingContact}
              onDelete={handleDelete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};