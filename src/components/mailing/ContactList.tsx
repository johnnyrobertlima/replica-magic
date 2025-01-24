import { ActionButtons } from "@/components/admin/ActionButtons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Contact {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  created_at: string;
}

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export const ContactList = ({ contacts, onEdit, onDelete }: ContactListProps) => {
  return (
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
                  onEdit={() => onEdit(contact)}
                  onDelete={() => onDelete(contact.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};