
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, Info } from "lucide-react";

interface EmptyStateDisplayProps {
  type: "no-item" | "item-not-saved" | "no-data";
}

export const EmptyStateDisplay = ({ type }: EmptyStateDisplayProps) => {
  switch (type) {
    case "no-item":
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Grade de Variações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 text-muted-foreground">
              <p>Salve o produto primeiro para poder criar variações</p>
            </div>
          </CardContent>
        </Card>
      );
    
    case "item-not-saved":
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Grade de Variações</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Este item ainda não foi salvo na base de dados. Salve o item primeiro para poder criar variações.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    
    case "no-data":
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Grade de Variações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 text-muted-foreground">
              <Grid className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p>Não há cores ou tamanhos cadastrados</p>
              <p className="text-xs mt-1">Cadastre pelo menos uma cor e um tamanho para montar a grade</p>
            </div>
          </CardContent>
        </Card>
      );
    
    default:
      return null;
  }
};
