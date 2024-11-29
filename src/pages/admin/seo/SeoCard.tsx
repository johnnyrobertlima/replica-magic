import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SeoSettingProps = {
  setting: {
    id: string;
    page_path: string;
    title: string;
    description: string;
    keywords: string[];
    favicon_url?: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export const SeoCard = ({ setting, onEdit, onDelete }: SeoSettingProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{setting.page_path}</CardTitle>
        <CardDescription>{setting.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{setting.description}</p>
          <div className="flex flex-wrap gap-1">
            {setting.keywords.map((keyword: string, index: number) => (
              <span
                key={index}
                className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
              >
                {keyword}
              </span>
            ))}
          </div>
          {setting.favicon_url && (
            <div className="mt-2">
              <p className="text-sm font-medium">Favicon:</p>
              <img
                src={setting.favicon_url}
                alt="Favicon"
                className="w-6 h-6 mt-1"
              />
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(setting.id)}
            >
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(setting.id)}
            >
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};