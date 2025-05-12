
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NovoClienteFeirinha } from "@/types/feirinha";
import { format } from "date-fns";
import { formSchema, NovoClienteFormValues } from "./schema";

export const useNovoClienteForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<NovoClienteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solicitante: "",
      nome_lojista: "",
      telefone_proprietario: "",
      corredor: "",
      numero_banca: "",
      observacao: "",
    },
  });

  const onSubmit = async (values: NovoClienteFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert form values to match the expected NovoClienteFeirinha type
      const clienteData: NovoClienteFeirinha = {
        solicitante: values.solicitante,
        nome_lojista: values.nome_lojista,
        telefone_proprietario: values.telefone_proprietario,
        corredor: values.corredor,
        numero_banca: values.numero_banca,
        data_inauguracao: format(values.data_inauguracao, 'yyyy-MM-dd'),
        observacao: values.observacao,
      };

      console.log("Submitting data:", clienteData);
      
      const { data, error } = await supabase
        .from("feirinha_novo_cliente")
        .insert(clienteData)
        .select();

      if (error) {
        console.error("Erro ao inserir dados:", error);
        toast({
          variant: "destructive",
          title: "Erro ao cadastrar",
          description: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        });
        return;
      }

      console.log("Submission successful:", data);
      setSubmitted(true);
      form.reset();
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Seus dados foram enviados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao processar o formulário:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => setSubmitted(false);

  return {
    form,
    isSubmitting,
    submitted,
    onSubmit,
    resetForm,
  };
};
