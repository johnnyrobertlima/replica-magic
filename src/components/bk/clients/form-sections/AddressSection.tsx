
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useClientForm } from "@/contexts/bk/ClientFormContext";

export const AddressSection = () => {
  const { formData, onInputChange } = useClientForm();
  
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="CEP">CEP</Label>
          <Input
            id="CEP"
            name="CEP"
            value={formData.CEP || ""}
            onChange={onInputChange}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="ENDERECO">Endereço</Label>
          <Input
            id="ENDERECO"
            name="ENDERECO"
            value={formData.ENDERECO || ""}
            onChange={onInputChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="NUMERO">Número</Label>
          <Input
            id="NUMERO"
            name="NUMERO"
            value={formData.NUMERO || ""}
            onChange={onInputChange}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="COMPLEMENTO">Complemento</Label>
          <Input
            id="COMPLEMENTO"
            name="COMPLEMENTO"
            value={formData.COMPLEMENTO || ""}
            onChange={onInputChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="BAIRRO">Bairro</Label>
          <Input
            id="BAIRRO"
            name="BAIRRO"
            value={formData.BAIRRO || ""}
            onChange={onInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="CIDADE">Cidade</Label>
          <Input
            id="CIDADE"
            name="CIDADE"
            value={formData.CIDADE || ""}
            onChange={onInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="UF">UF</Label>
          <Input
            id="UF"
            name="UF"
            value={formData.UF || ""}
            onChange={onInputChange}
          />
        </div>
      </div>
    </>
  );
};
