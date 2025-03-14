
import { Card, CardContent } from "@/components/ui/card";

export const EmptyPendingApprovals = () => {
  return (
    <Card className="col-span-2">
      <CardContent className="p-6">
        <p className="text-center text-muted-foreground">
          Nenhum pedido pendente de aprovação financeira.
        </p>
      </CardContent>
    </Card>
  );
};
