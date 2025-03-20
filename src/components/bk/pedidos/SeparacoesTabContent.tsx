
import { SeparacaoCard } from "@/components/jab-orders/SeparacaoCard";
import type { Separacao } from "@/types/separacao";

interface SeparacoesTabContentProps {
  separacoes: Separacao[];
}

export const SeparacoesTabContent = ({ separacoes }: SeparacoesTabContentProps) => {
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Separações em Andamento</h2>
      {separacoes.length === 0 ? (
        <div className="bg-muted p-8 rounded-md text-center">
          <p className="text-lg text-muted-foreground">
            Nenhuma separação em andamento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {separacoes.map((separacao) => (
            <SeparacaoCard key={separacao.id} separacao={separacao} />
          ))}
        </div>
      )}
    </div>
  );
};
