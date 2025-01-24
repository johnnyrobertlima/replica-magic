import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActionButtons } from "@/components/admin/ActionButtons";

type CampaignStatus = "Pausado" | "Em Andamento" | "Finalizado" | "Erro";

interface Campaign {
  id: string;
  name: string;
  message: string;
  image_url?: string;
  Status?: CampaignStatus;
  created_at?: string;
}

const WhatsAppService = () => {
  const [campaignName, setCampaignName] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campaigns").insert([
        {
          name: campaignName,
          message: message,
          image_url: imageUrl,
          Status: "Pausado" as CampaignStatus,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Campanha criada com sucesso!" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async (campaign: Campaign) => {
      const { error } = await supabase
        .from("campaigns")
        .update({
          name: campaign.name,
          message: campaign.message,
          image_url: campaign.image_url,
        })
        .eq("id", campaign.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Campanha atualizada com sucesso!" });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar campanha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCampaignStatus = useMutation({
    mutationFn: async ({ id, Status }: { id: string; Status: CampaignStatus }) => {
      const { error } = await supabase
        .from("campaigns")
        .update({ Status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Status atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast({ title: "Campanha excluída com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir campanha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName || !selectedClient || !message) {
      toast({
        title: "Erro ao criar campanha",
        description: "Nome da campanha, cliente e mensagem são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (editingCampaign) {
      updateCampaign.mutate({
        ...editingCampaign,
        name: campaignName,
        message: message,
        image_url: imageUrl,
      });
    } else {
      createCampaign.mutate();
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignName(campaign.name);
    setMessage(campaign.message);
    setImageUrl(campaign.image_url || "");
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setCampaignName("");
    setSelectedClient("");
    setMessage("");
    setImageUrl("");
    setEditingCampaign(null);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Link to="/client-area" className="inline-flex items-center gap-2 mb-6 hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Área do Cliente
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Disparo de WhatsApp</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Configure sua campanha de WhatsApp preenchendo os campos abaixo.
        </p>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="campaign-name" className="text-sm font-medium">
                    Nome da Campanha
                  </label>
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Digite o nome da campanha"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="client" className="text-sm font-medium">
                    Cliente
                  </label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Mensagem da Campanha
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite a mensagem da campanha"
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Imagem da Campanha (Opcional)
                </label>
                <ImageUpload
                  name="campaign-image"
                  bucket="campaign-images"
                  onUrlChange={setImageUrl}
                  currentImage={imageUrl}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createCampaign.isPending || updateCampaign.isPending}
                >
                  {editingCampaign
                    ? updateCampaign.isPending
                      ? "Atualizando..."
                      : "Atualizar Campanha"
                    : createCampaign.isPending
                    ? "Criando..."
                    : "Inserir Campanha"}
                </Button>
                {editingCampaign && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Campanhas Cadastradas</h2>
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
                {campaigns?.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>
                      <Select
                        value={campaign.Status || "Pausado"}
                        onValueChange={(value: CampaignStatus) =>
                          updateCampaignStatus.mutate({ id: campaign.id, Status: value })
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
                    <TableCell className="text-right">
                      <ActionButtons
                        onEdit={() => handleEdit(campaign)}
                        onDelete={() => deleteCampaign.mutate(campaign.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default WhatsAppService;