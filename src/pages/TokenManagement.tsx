import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Token, TokenFormData } from "@/types/token";
import { useTokenMutations } from "@/hooks/useTokenMutations";
import { TokenForm } from "@/components/token/TokenForm";
import { TokenTable } from "@/components/token/TokenTable";

const TokenManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [formData, setFormData] = useState<TokenFormData>({
    id: "",
    NomedoChip: "",
    limitePorDia: "",
    Telefone: "",
    cliente: "",
    Status: "Ativo",
  });

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Não autorizado",
        description: "Você precisa estar logado para acessar esta página",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }
    return true;
  };

  const { data: tokens, isLoading } = useQuery({
    queryKey: ["tokens"],
    queryFn: async () => {
      await checkAuth();
      const { data, error } = await supabase
        .from("Token_Whats")
        .select("*");
      
      if (error) {
        console.error("Error fetching tokens:", error);
        throw error;
      }
      
      return data as Token[];
    },
  });

  const { createToken, updateToken, deleteToken } = useTokenMutations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenData = {
      id: formData.id,
      NomedoChip: formData.NomedoChip || null,
      "limite por dia": formData.limitePorDia ? Number(formData.limitePorDia) : null,
      Telefone: formData.Telefone ? Number(formData.Telefone) : null,
      cliente: formData.cliente || null,
      Status: formData.Status || null,
    };

    if (editingToken) {
      updateToken.mutate(tokenData);
    } else {
      createToken.mutate(tokenData);
    }
    resetForm();
  };

  const handleEdit = (token: Token) => {
    setEditingToken(token);
    setFormData({
      id: token.id,
      NomedoChip: token.NomedoChip || "",
      limitePorDia: token["limite por dia"]?.toString() || "",
      Telefone: token.Telefone?.toString() || "",
      cliente: token.cliente || "",
      Status: token.Status || "Ativo",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      id: "",
      NomedoChip: "",
      limitePorDia: "",
      Telefone: "",
      cliente: "",
      Status: "Ativo",
    });
    setEditingToken(null);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Cadastro de Tokens</h1>

      <TokenForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={!!editingToken}
        onCancel={resetForm}
      />

      <TokenTable
        tokens={tokens}
        onEdit={handleEdit}
        onDelete={(id) => deleteToken.mutate(id)}
      />
    </main>
  );
};

export default TokenManagement;