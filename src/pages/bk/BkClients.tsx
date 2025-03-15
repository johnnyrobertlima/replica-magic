import { useState, useEffect } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Edit, Plus, Trash2, Loader2, Percent, Building, Package, Book } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface BkClient {
  PES_CODIGO: number;
  CATEGORIA?: string | null;
  NOME_CATEGORIA?: string | null;
  RAZAOSOCIAL?: string | null;
  CNPJCPF?: string | null;
  APELIDO?: string | null;
  INSCRICAO_ESTADUAL?: string | null;
  CEP?: string | null;
  ENDERECO?: string | null;
  NUMERO?: string | null;
  COMPLEMENTO?: string | null;
  BAIRRO?: string | null;
  CIDADE?: string | null;
  UF?: string | null;
  TELEFONE?: string | null;
  EMAIL?: string | null;
  DATACADASTRO?: string | null;
  volume_saudavel_faturamento?: number | null;
  empresas?: string[];
  fator_correcao?: number | null;
}

const BkClients = () => {
  const [clients, setClients] = useState<BkClient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<BkClient | null>(null);
  const [formData, setFormData] = useState<Partial<BkClient>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("BLUEBAY_PESSOA")
        .select("*")
        .order("PES_CODIGO", { ascending: true });

      if (error) throw error;
      
      const clientsWithNewFields = data?.map(client => ({
        ...client,
        empresas: client.CATEGORIA?.split(',') || [],
        fator_correcao: client.volume_saudavel_faturamento || 0
      })) || [];
      
      setClients(clientsWithNewFields);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Ocorreu um erro ao buscar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (client.RAZAOSOCIAL?.toLowerCase().includes(searchLower) || "") ||
      (client.APELIDO?.toLowerCase().includes(searchLower) || "") ||
      (client.CNPJCPF?.toLowerCase().includes(searchLower) || "") ||
      String(client.PES_CODIGO).includes(searchTerm)
    );
  });

  const handleEdit = (client: BkClient) => {
    setCurrentClient(client);
    setFormData({
      ...client,
      empresas: client.empresas || [],
      fator_correcao: client.fator_correcao || 0
    });
    setIsFormOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (checked: boolean, empresa: string) => {
    const empresas = formData.empresas || [];
    const newEmpresas = checked
      ? [...empresas, empresa]
      : empresas.filter(e => e !== empresa);
    setFormData({ ...formData, empresas: newEmpresas });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value === "" ? null : parseFloat(e.target.value);
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleCreate = () => {
    setCurrentClient(null);
    setFormData({
      empresas: [],
      fator_correcao: 0
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        CATEGORIA: formData.empresas?.join(',')
      };
      
      const { empresas, fator_correcao, ...dataToSave } = dataToSubmit;

      if (currentClient) {
        const { error } = await supabase
          .from("BLUEBAY_PESSOA")
          .update(dataToSave)
          .eq("PES_CODIGO", currentClient.PES_CODIGO);

        if (error) throw error;

        toast({
          title: "Cliente atualizado",
          description: "As informações do cliente foram atualizadas com sucesso.",
        });
      } else {
        if (!dataToSave.PES_CODIGO) {
          throw new Error("Código do cliente é obrigatório");
        }
        
        const { error } = await supabase
          .from("BLUEBAY_PESSOA")
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Cliente criado",
          description: "Novo cliente foi criado com sucesso.",
        });
      }

      fetchClients();
      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Error saving client:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as informações do cliente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (client: BkClient) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${client.RAZAOSOCIAL || client.APELIDO || client.PES_CODIGO}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("BLUEBAY_PESSOA")
        .delete()
        .eq("PES_CODIGO", client.PES_CODIGO);

      if (error) throw error;

      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });

      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o cliente.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="container-fluid p-0 max-w-full">
      <BkMenu />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar cliente..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button className="ml-2" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando clientes...</span>
            </div>
          ) : (
            <div className="bg-white rounded-md shadow overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Código</TableHead>
                      <TableHead className="w-48">Razão Social</TableHead>
                      <TableHead className="w-32">Nome Fantasia</TableHead>
                      <TableHead className="w-32">CNPJ/CPF</TableHead>
                      <TableHead className="w-32">Cidade</TableHead>
                      <TableHead className="w-24">UF</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                          Nenhum cliente encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClients.map((client) => (
                        <TableRow key={client.PES_CODIGO}>
                          <TableCell>{client.PES_CODIGO}</TableCell>
                          <TableCell>{client.RAZAOSOCIAL || "-"}</TableCell>
                          <TableCell>{client.APELIDO || "-"}</TableCell>
                          <TableCell>{client.CNPJCPF || "-"}</TableCell>
                          <TableCell>{client.CIDADE || "-"}</TableCell>
                          <TableCell>{client.UF || "-"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(client)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(client)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="PES_CODIGO">Código</Label>
                  <Input
                    id="PES_CODIGO"
                    name="PES_CODIGO"
                    value={formData.PES_CODIGO || ""}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="APELIDO">Nome Fantasia</Label>
                  <Input
                    id="APELIDO"
                    name="APELIDO"
                    value={formData.APELIDO || ""}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="INSCRICAO_ESTADUAL">Inscrição Estadual</Label>
                  <Input
                    id="INSCRICAO_ESTADUAL"
                    name="INSCRICAO_ESTADUAL"
                    value={formData.INSCRICAO_ESTADUAL || ""}
                    onChange={handleInputChange}
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
                        handleCheckboxChange(checked as boolean, 'Bluebay')
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
                        handleCheckboxChange(checked as boolean, 'JAB')
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
                        handleCheckboxChange(checked as boolean, 'BK')
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
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume_saudavel_faturamento">Volume Saudável (Faturamento)</Label>
                  <Input
                    id="volume_saudavel_faturamento"
                    name="volume_saudavel_faturamento"
                    type="number"
                    value={formData.volume_saudavel_faturamento || ""}
                    onChange={(e) => handleNumberChange(e, 'volume_saudavel_faturamento')}
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
                      onChange={(e) => handleNumberChange(e, 'fator_correcao')}
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
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="ENDERECO">Endereço</Label>
                  <Input
                    id="ENDERECO"
                    name="ENDERECO"
                    value={formData.ENDERECO || ""}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="COMPLEMENTO">Complemento</Label>
                  <Input
                    id="COMPLEMENTO"
                    name="COMPLEMENTO"
                    value={formData.COMPLEMENTO || ""}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="CIDADE">Cidade</Label>
                  <Input
                    id="CIDADE"
                    name="CIDADE"
                    value={formData.CIDADE || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="UF">UF</Label>
                  <Input
                    id="UF"
                    name="UF"
                    value={formData.UF || ""}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="EMAIL">Email</Label>
                  <Input
                    id="EMAIL"
                    name="EMAIL"
                    type="email"
                    value={formData.EMAIL || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
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
    </main>
  );
};

export default BkClients;
