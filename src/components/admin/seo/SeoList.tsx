import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

export interface SeoSettingsRow {
  id: string;
  page_path: string;
  title: string;
  description: string;
  keywords: string;
  og_image?: string;
  favicon_url?: string;
  created_at: string;
  updated_at: string;
}

interface SeoListProps {
  settings: SeoSettingsRow[];
  onEdit: (setting: SeoSettingsRow) => void;
  onDelete: (id: string) => void;
}

export const SeoList = ({ settings, onEdit, onDelete }: SeoListProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {settings.map((setting) => (
        <Card key={setting.id} className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{setting.page_path}</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(setting)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(setting.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h4 className="text-sm font-medium">{setting.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {setting.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {setting.keywords.split(',').map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};