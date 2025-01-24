import { Database } from "@/integrations/supabase/types";
import { CampaignNameField } from "./form-fields/CampaignNameField";
import { ClientSelectField } from "./form-fields/ClientSelectField";
import { MailingSelectField } from "./form-fields/MailingSelectField";
import { MessageField } from "./form-fields/MessageField";
import { ImageUrlField } from "./form-fields/ImageUrlField";

type ClientesWhats = Database["public"]["Tables"]["Clientes_Whats"]["Row"];

interface CampaignFormFieldsProps {
  campaignName: string;
  setCampaignName: (value: string) => void;
  selectedClient: string;
  setSelectedClient: (value: string) => void;
  selectedMailing: string;
  setSelectedMailing: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  clients: ClientesWhats[];
}

export function CampaignFormFields({
  campaignName,
  setCampaignName,
  selectedClient,
  setSelectedClient,
  selectedMailing,
  setSelectedMailing,
  message,
  setMessage,
  imageUrl,
  setImageUrl,
  clients,
}: CampaignFormFieldsProps) {
  return (
    <>
      <CampaignNameField 
        value={campaignName}
        onChange={setCampaignName}
      />

      <ClientSelectField
        value={selectedClient}
        onChange={setSelectedClient}
        clients={clients}
      />

      <MailingSelectField
        value={selectedMailing}
        onChange={setSelectedMailing}
      />

      <MessageField
        value={message}
        onChange={setMessage}
      />

      <ImageUrlField
        value={imageUrl}
        onChange={setImageUrl}
      />
    </>
  );
}