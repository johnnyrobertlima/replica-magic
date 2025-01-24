export type CampaignStatus = "Pausado" | "Em Andamento" | "Finalizado" | "Erro";

export interface Campaign {
  id: string;
  name: string;
  message: string;
  image_url?: string;
  Status?: CampaignStatus;
  created_at?: string;
}