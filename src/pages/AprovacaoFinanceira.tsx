
import { BackButton } from "@/components/navigation/BackButton";
import { AprovacaoContent } from "@/components/aprovacao/AprovacaoContent";

const AprovacaoFinanceira = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton to="/client-area" label="Voltar para Área do Cliente" />
      <AprovacaoContent />
    </div>
  );
};

export default AprovacaoFinanceira;
