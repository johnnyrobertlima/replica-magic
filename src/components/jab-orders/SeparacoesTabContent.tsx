
import { Card, CardContent } from "@/components/ui/card";
import { SeparacaoCard } from "./SeparacaoCard";

interface SeparacoesTabContentProps {
  separacoes: any[];
}

export const SeparacoesTabContent = ({ separacoes }: SeparacoesTabContentProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {separacoes.length > 0 ? (
        separacoes.map((separacao) => (
          <SeparacaoCard key={separacao.id} separacao={separacao} />
        ))
      ) : (
        <Card className="col-span-full">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Nenhuma separação encontrada.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
