
import { Card, CardContent } from "@/components/ui/card";
import { Grid, AlertCircle, PlusCircle } from "lucide-react";

type EmptyStateType = "no-item" | "no-data" | "item-not-saved" | "item-not-found";

interface EmptyStateDisplayProps {
  type: EmptyStateType;
}

export const EmptyStateDisplay = ({ type }: EmptyStateDisplayProps) => {
  let icon = <Grid className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />;
  let title = "";
  let description = "";

  switch (type) {
    case "no-item":
      icon = <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />;
      title = "Nenhum item selecionado";
      description = "Selecione um item para gerenciar suas variações";
      break;
    case "no-data":
      icon = <Grid className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />;
      title = "Não há cores ou tamanhos cadastrados";
      description = "Cadastre pelo menos uma cor e um tamanho para montar a grade";
      break;
    case "item-not-saved":
      icon = <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />;
      title = "Item não salvo";
      description = "Este item precisa ser salvo antes de adicionar variações";
      break;
    case "item-not-found":
      icon = <AlertCircle className="mx-auto h-12 w-12 text-orange-500/70 mb-4" />;
      title = "Item não encontrado na base";
      description = "Este item existe mas não foi encontrado com a matriz e filial corretas. Verifique se o item está corretamente cadastrado.";
      break;
  }

  return (
    <Card className="mt-4">
      <CardContent className="text-center p-6">
        {icon}
        <p className="font-medium">{title}</p>
        <p className="text-sm mt-2 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
