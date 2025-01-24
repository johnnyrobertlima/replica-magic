import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link as LinkIcon } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { useToast } from "@/components/ui/use-toast";

type CampaignStatus = "Pausado" | "Em Andamento" | "Finalizado" | "Erro";

interface CampaignTableProps {
  campaigns: Campaign[];
  onStatusChange: (id: string, status: CampaignStatus) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
}

export const CampaignTable = ({
  campaigns,
  onStatusChange,
  onEdit,
  onDelete,
}: CampaignTableProps) => {
  const { toast } = useToast();

  const handleCopyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada!",
      description: "A URL da imagem foi copiada para sua área de transferência.",
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data de Criação</TableHead>
          <TableHead>URL Imagem</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns?.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell>{campaign.name}</TableCell>
            <TableCell>
              <Select
                value={campaign.Status || "Pausado"}
                onValueChange={(value: CampaignStatus) =>
                  onStatusChange(campaign.id, value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pausado">Pausado</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                  <SelectItem value="Erro">Erro</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              {campaign.created_at
                ? new Date(campaign.created_at).toLocaleDateString("pt-BR")
                : "-"}
            </TableCell>
            <TableCell>
              {campaign.image_url ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleCopyImageUrl(campaign.image_url!)}
                >
                  <LinkIcon className="h-4 w-4" />
                  Copiar URL
                </Button>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell className="text-right">
              <ActionButtons
                onEdit={() => onEdit(campaign)}
                onDelete={() => onDelete(campaign.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};