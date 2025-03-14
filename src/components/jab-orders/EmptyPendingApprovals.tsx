
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export const EmptyPendingApprovals = () => {
  return (
    <Card className="col-span-2 border border-dashed bg-slate-50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium">Tudo em dia!</h3>
        <p className="text-muted-foreground max-w-md">
          Não há pedidos pendentes para aprovação financeira no momento.
        </p>
      </CardContent>
    </Card>
  );
};
