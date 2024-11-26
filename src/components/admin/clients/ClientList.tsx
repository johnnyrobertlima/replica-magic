import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { Client } from "@/types/client";
import { getStorageUrl } from "@/utils/imageUtils";

interface ClientListProps {
  clients: Client[];
  onToggle: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export const ClientList = ({ clients, onToggle, onEdit, onDelete }: ClientListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Logo</TableHead>
          <TableHead>Website</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients?.map((client) => {
          const imageUrl = getStorageUrl(client.logo_url);
          console.log('Client logo URL:', imageUrl); // Debug log

          return (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell>
                <img
                  src={imageUrl}
                  alt={client.name}
                  className="h-16 w-24 object-contain rounded"
                  onError={(e) => {
                    console.log('Image load error:', e); // Debug log
                    const img = e.target as HTMLImageElement;
                    img.src = '/placeholder.svg';
                  }}
                />
              </TableCell>
              <TableCell>
                {client.website_url && (
                  <a
                    href={client.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visitar site
                  </a>
                )}
              </TableCell>
              <TableCell>
                {client.is_active ? "Ativo" : "Inativo"}
              </TableCell>
              <TableCell>
                <ActionButtons
                  isActive={client.is_active}
                  onToggle={() => onToggle(client)}
                  onEdit={() => onEdit(client)}
                  onDelete={() => onDelete(client.id)}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};