
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { Loader2 } from "lucide-react";
import { getStorageUrl } from "@/utils/imageUtils";

interface Banner {
  id: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string;
  youtube_url: string | null;
  is_active: boolean;
}

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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Imagem</TableHead>
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
