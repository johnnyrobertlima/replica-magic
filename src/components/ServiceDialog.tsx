import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Monitor, Globe, Users, Video, Share2, BarChart } from "lucide-react";
import { getStorageUrl } from "@/utils/imageUtils";
import { ScrollArea } from "@/components/ui/scroll-area";

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-8 h-8" />,
  Globe: <Globe className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
  Video: <Video className="w-8 h-8" />,
  Share2: <Share2 className="w-8 h-8" />,
  BarChart: <BarChart className="w-8 h-8" />,
};

interface ServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    title: string;
    description: string;
    detailed_description?: string;
    icon: string;
    cover_image_url?: string | null;
    sub_services?: { title: string; description: string }[];
  };
}

export const ServiceDialog = ({ isOpen, onClose, service }: ServiceDialogProps) => {
  const coverImageUrl = service.cover_image_url ? getStorageUrl(service.cover_image_url) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {coverImageUrl && (
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <img
                  src={coverImageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="text-primary">
                  {iconMap[service.icon]}
                </div>
                <DialogTitle className="text-2xl font-bold">{service.title}</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-6 mt-6">
              <p className="text-gray-600">{service.description}</p>
              
              {service.detailed_description && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Detalhes do Serviço</h3>
                  <p className="text-gray-600">{service.detailed_description}</p>
                </div>
              )}

              {service.sub_services && service.sub_services.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Serviços Inclusos</h3>
                  <div className="grid gap-4">
                    {service.sub_services.map((subService, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{subService.title}</h4>
                        <p className="text-gray-600 text-sm">{subService.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};