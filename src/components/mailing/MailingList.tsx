import { ActionButtons } from "@/components/admin/ActionButtons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Mailing {
  id: string;
  nome: string;
  created_at: string;
}

interface MailingListProps {
  mailings: Mailing[] | undefined;
  isLoading: boolean;
  onContactsClick: (mailing: { id: string; nome: string }) => void;
  onRefetch: () => void;
  session: any;
}

export const MailingList = ({ mailings, isLoading, onContactsClick, onRefetch, session }: MailingListProps) => {
  const { toast } = useToast();

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
      // First, delete associated campaigns
      const { error: campaignsError } = await supabase
        .from('campaigns')
        .delete()
        .eq('mailing_id', id);

      if (campaignsError) {
        console.error("Error deleting associated campaigns:", campaignsError);
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao excluir as campanhas associadas",
        });
        return;
      }

      // Then delete the mailing
      const { error: mailingError } = await supabase
        .from('mailing')
        .delete()
        .eq('id', id);

      if (mailingError) {
        console.error("Error deleting mailing:", mailingError);
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao excluir o mailing",
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Mailing e campanhas associadas excluídos com sucesso",
      });
      onRefetch();
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o mailing",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
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
                  onClick={() => onContactsClick({ id: mailing.id, nome: mailing.nome })}
                >
                  Cadastrar Contatos
                </Button>
                <ActionButtons
                  onDelete={() => handleDelete(mailing.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};