
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { validateClientForm, isClientCodeUnique } from "@/utils/bk/clientValidation";
import { 
  transformClientFromApi, 
  transformClientForSave, 
  prepareClientForInsert 
} from "@/utils/bk/clientTransformation";

export interface BkClient {
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

export const useClients = () => {
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
      
      // Transform API data to client objects
      const transformedClients = data?.map(transformClientFromApi) || [];
      
      setClients(transformedClients);
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

  const handleCreate = () => {
    setCurrentClient(null);
    setFormData({
      empresas: [],
      fator_correcao: 0
    });
    setIsFormOpen(true);
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

  const validateForm = (): boolean => {
    const validationErrors = validateClientForm(formData);
    
    if (validationErrors.length > 0) {
      toast({
        title: "Erro de validação",
        description: validationErrors[0].message,
        variant: "destructive",
      });
      return false;
    }
    
    // If creating a new client, check if the code is unique
    if (!currentClient && formData.PES_CODIGO) {
      const pesCode = Number(formData.PES_CODIGO);
      if (!isClientCodeUnique(pesCode, clients)) {
        toast({
          title: "Erro de validação",
          description: "Já existe um cliente com este código",
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (currentClient) {
        // Update existing client
        const transformedData = transformClientForSave(formData);
        
        const { error } = await supabase
          .from("BLUEBAY_PESSOA")
          .update(transformedData)
          .eq("PES_CODIGO", currentClient.PES_CODIGO);

        if (error) throw error;

        toast({
          title: "Cliente atualizado",
          description: "As informações do cliente foram atualizadas com sucesso.",
        });
      } else {
        // Create new client
        const clientToInsert = prepareClientForInsert(formData);
        
        const { error } = await supabase
          .from("BLUEBAY_PESSOA")
          .insert([clientToInsert]);

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

  return {
    clients,
    filteredClients,
    searchTerm,
    setSearchTerm,
    isLoading,
    isFormOpen,
    setIsFormOpen,
    currentClient,
    formData,
    isSubmitting,
    handleEdit,
    handleCreate,
    handleDelete,
    handleSubmit,
    handleInputChange,
    handleCheckboxChange,
    handleNumberChange,
  };
};
