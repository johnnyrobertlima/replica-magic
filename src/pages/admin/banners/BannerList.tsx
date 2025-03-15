
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { Loader2 } from "lucide-react";
import { getStorageUrl } from "@/utils/imageUtils";
import { Badge } from "@/components/ui/badge";
import { Banner } from "@/types/banner";

interface BannerListProps {
  banners?: Banner[];
  isLoading: boolean;
  onEdit: (banner: Banner) => void;
  onToggle: (id: string, is_active: boolean) => void;
  onDelete: (id: string) => void;
}

export const BannerList = ({
  banners,
  isLoading,
  onEdit,
  onToggle,
  onDelete,
}: BannerListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'index':
        return 'Página Inicial';
      case 'bluebay':
        return 'Bluebay';
      case 'bk':
        return 'B&K';
      case 'both':
        return 'Todas';
      default:
        return location;
    }
  };

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'index':
        return 'bg-blue-100 text-blue-800';
      case 'bluebay':
        return 'bg-green-100 text-green-800';
      case 'bk':
        return 'bg-purple-100 text-purple-800';
      case 'both':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Imagem</TableHead>
          <TableHead>Localização</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {banners?.map((banner) => (
          <TableRow key={banner.id}>
            <TableCell>{banner.title}</TableCell>
            <TableCell>
              <img
                src={getStorageUrl(banner.image_url)}
                alt={banner.title}
                className="h-16 w-24 object-cover rounded"
              />
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={getLocationColor(banner.page_location)}>
                {getLocationLabel(banner.page_location)}
              </Badge>
            </TableCell>
            <TableCell>
              {banner.is_active ? "Ativo" : "Inativo"}
            </TableCell>
            <TableCell>
              <ActionButtons
                isActive={banner.is_active}
                onToggle={() => onToggle(banner.id, banner.is_active)}
                onEdit={() => onEdit(banner)}
                onDelete={() => onDelete(banner.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
