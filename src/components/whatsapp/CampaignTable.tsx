import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { CampaignStatusSelect } from "./CampaignStatusSelect";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Play } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CampaignTableProps {
  campaigns: Campaign[];
  onStatusChange: (id: string, status: CampaignStatus) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
}

export function CampaignTable({
  campaigns,
  onStatusChange,
  onEdit,
  onDelete,
}: CampaignTableProps) {
  const { toast } = useToast();

  const handlePlayClick = async (campaign: Campaign) => {
    try {
      // Get client webhook URL
      const { data: client } = await supabase
        .from('Clientes_Whats')
        .select('webhook_url')
        .eq('id', campaign.client_id)
        .single();

      if (!client?.webhook_url) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "URL do webhook não configurada para este cliente",
        });
        return;
      }

      // Get mailing information
      const { data: mailing } = await supabase
        .from('mailing')
        .select('*')
        .eq('id', campaign.mailing_id)
        .single();

      const webhookData = {
        campaign_name: campaign.name,
        client_id: campaign.client_id,
        mailing_id: campaign.mailing_id,
        mailing_name: mailing?.nome,
        message: campaign.message,
        image_url: campaign.image_url,
      };

      // Call our Edge Function to trigger the webhook
      const { data: response, error } = await supabase.functions.invoke('trigger-webhook', {
        body: {
          webhookUrl: client.webhook_url,
          data: webhookData,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Campanha iniciada com sucesso",
      });
    } catch (error) {
      console.error('Error triggering webhook:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao iniciar a campanha",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data de Criação</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => (
          <TableRow key={campaign.id}>
            <TableCell>{campaign.name}</TableCell>
            <TableCell>
              <CampaignStatusSelect
                status={campaign.Status || "Pausado"}
                onStatusChange={(status) => onStatusChange(campaign.id, status)}
              />
            </TableCell>
            <TableCell>
              {campaign.created_at
                ? new Date(campaign.created_at).toLocaleDateString("pt-BR")
                : "-"}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePlayClick(campaign)}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(campaign)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(campaign.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}