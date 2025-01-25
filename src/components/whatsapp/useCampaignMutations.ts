import { useCreateCampaign } from "./mutations/useCreateCampaign";
import { useUpdateCampaign } from "./mutations/useUpdateCampaign";
import { useUpdateCampaignStatus } from "./mutations/useUpdateCampaignStatus";
import { useDeleteCampaign } from "./mutations/useDeleteCampaign";

export const useCampaignMutations = () => {
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const updateCampaignStatus = useUpdateCampaignStatus();
  const deleteCampaign = useDeleteCampaign();

  return {
    createCampaign,
    updateCampaign,
    updateCampaignStatus,
    deleteCampaign,
  };
};