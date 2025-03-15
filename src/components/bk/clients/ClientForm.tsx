
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, Package, Book, Percent, Loader2 } from "lucide-react";
import { BkClient } from "@/hooks/bk/useClients";

interface ClientFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  currentClient: BkClient | null;
  formData: Partial<BkClient>;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean, empresa: string) => void;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => void;
}

export const ClientForm = ({
  isOpen,
  onOpenChange,
  isSubmitting,
  currentClient,
  formData,
  onSubmit,
  onInputChange,
  onCheckboxChange,
  onNumberChange,
}: ClientFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentClient ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
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

            <div className="space-y-2">
              <Label>Empresa</Label>
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="empresa-bluebay" 
                    checked={formData.empresas?.includes('Bluebay')}
                    onCheckedChange={(checked) => 
                      onCheckboxChange(checked as boolean, 'Bluebay')
                    }
                  />
                  <Label 
                    htmlFor="empresa-bluebay" 
                    className="flex items-center cursor-pointer"
                  >
                    <Building className="mr-1.5 h-4 w-4" />
                    Bluebay
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="empresa-jab" 
                    checked={formData.empresas?.includes('JAB')}
                    onCheckedChange={(checked) => 
                      onCheckboxChange(checked as boolean, 'JAB')
                    }
                  />
                  <Label 
                    htmlFor="empresa-jab" 
                    className="flex items-center cursor-pointer"
                  >
                    <Package className="mr-1.5 h-4 w-4" />
                    JAB
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="empresa-bk" 
                    checked={formData.empresas?.includes('BK')}
                    onCheckedChange={(checked) => 
                      onCheckboxChange(checked as boolean, 'BK')
                    }
                  />
                  <Label 
                    htmlFor="empresa-bk" 
                    className="flex items-center cursor-pointer"
                  >
                    <Book className="mr-1.5 h-4 w-4" />
                    BK
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="NOME_CATEGORIA">Nome da Categoria</Label>
                <Input
                  id="NOME_CATEGORIA"
                  name="NOME_CATEGORIA"
                  value={formData.NOME_CATEGORIA || ""}
                  onChange={onInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume_saudavel_faturamento">Volume Saudável (Faturamento)</Label>
                <Input
                  id="volume_saudavel_faturamento"
                  name="volume_saudavel_faturamento"
                  type="number"
                  value={formData.volume_saudavel_faturamento || ""}
                  onChange={(e) => onNumberChange(e, 'volume_saudavel_faturamento')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fator_correcao" className="flex items-center">
                  <Percent className="mr-1.5 h-4 w-4" />
                  Fator de Correção
                </Label>
                <div className="relative">
                  <Input
                    id="fator_correcao"
                    name="fator_correcao"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.fator_correcao || ""}
                    onChange={(e) => onNumberChange(e, 'fator_correcao')}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="TELEFONE">Telefone</Label>
                <Input
                  id="TELEFONE"
                  name="TELEFONE"
                  value={formData.TELEFONE || ""}
                  onChange={onInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="EMAIL">Email</Label>
                <Input
                  id="EMAIL"
                  name="EMAIL"
                  type="email"
                  value={formData.EMAIL || ""}
                  onChange={onInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
