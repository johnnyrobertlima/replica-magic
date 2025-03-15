
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useClientForm } from "@/contexts/bk/ClientFormContext";

export const BasicInfoSection = () => {
  const { formData, onInputChange, currentClient } = useClientForm();
  
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="PES_CODIGO">Código</Label>
          <Input
            id="PES_CODIGO"
            name="PES_CODIGO"
            value={formData.PES_CODIGO || ""}
            onChange={onInputChange}
            readOnly={!!currentClient}
            disabled={!!currentClient}
            required
            type="number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="DATACADASTRO">Data de Cadastro</Label>
          <Input
            id="DATACADASTRO"
            name="DATACADASTRO"
            type="date"
            value={formData.DATACADASTRO?.split("T")[0] || new Date().toISOString().split("T")[0]}
            onChange={onInputChange}
            readOnly={!!currentClient}
            disabled={!!currentClient}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="RAZAOSOCIAL">Razão Social</Label>
          <Input
            id="RAZAOSOCIAL"
            name="RAZAOSOCIAL"
            value={formData.RAZAOSOCIAL || ""}
            onChange={onInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="APELIDO">Nome Fantasia</Label>
          <Input
            id="APELIDO"
            name="APELIDO"
            value={formData.APELIDO || ""}
            onChange={onInputChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="CNPJCPF">CNPJ/CPF</Label>
          <Input
            id="CNPJCPF"
            name="CNPJCPF"
            value={formData.CNPJCPF || ""}
            onChange={onInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="INSCRICAO_ESTADUAL">Inscrição Estadual</Label>
          <Input
            id="INSCRICAO_ESTADUAL"
            name="INSCRICAO_ESTADUAL"
            value={formData.INSCRICAO_ESTADUAL || ""}
            onChange={onInputChange}
          />
        </div>
      </div>
    </>
  );
};
