
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { validateClientForm, isClientCodeUnique } from "@/utils/bk/clientValidation";
import { 
  transformClientForSave, 
  prepareClientForInsert 
} from "@/utils/bk/clientTransformation";
import { BkClient } from "@/types/bk/client";

export const useClientForm = (clients: BkClient[], onSuccessfulSave: () => void) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<BkClient | null>(null);
  const [formData, setFormData] = useState<Partial<BkClient>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

      onSuccessfulSave();
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
    isFormOpen,
    setIsFormOpen,
    currentClient,
    formData,
    isSubmitting,
    handleEdit,
    handleCreate,
    handleSubmit,
    handleInputChange,
    handleCheckboxChange,
    handleNumberChange,
  };
};
