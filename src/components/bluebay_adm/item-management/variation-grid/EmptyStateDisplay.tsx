
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Package, Save } from "lucide-react";

type EmptyStateType = "no-item" | "item-not-saved" | "no-data";

interface EmptyStateDisplayProps {
  type: EmptyStateType;
}

export const EmptyStateDisplay = ({ type }: EmptyStateDisplayProps) => {
  let icon = <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />;
  let title = "Atenção";
  let message = "Ocorreu um erro ao carregar os dados.";

  if (type === "no-item") {
    icon = <Package className="h-10 w-10 text-muted-foreground mb-2" />;
    title = "Nenhum Item Selecionado";
    message = "Selecione um item para gerenciar suas variações.";
  } else if (type === "item-not-saved") {
    icon = <Save className="h-10 w-10 text-amber-500 mb-2" />;
    title = "Atenção";
    message = "Este item ainda não foi salvo na base de dados. Salve o item primeiro para poder criar variações.";
  } else if (type === "no-data") {
    icon = <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />;
    title = "Sem dados";
    message = "Não há cores ou tamanhos cadastrados. Adicione cores e tamanhos primeiro.";
  }

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center h-40 text-center">
          {icon}
          <h3 className="font-medium mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
};
