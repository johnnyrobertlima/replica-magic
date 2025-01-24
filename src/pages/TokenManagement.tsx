import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Token {
  id: string;
  NomedoChip: string | null;
  "limite por dia": number | null;
  Telefone: number | null;
  cliente: string | null;
  Status: string | null;
}

const TokenManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [formData, setFormData] = useState({
    NomedoChip: "",
    limitePorDia: "",
    Telefone: "",
    cliente: "",
    Status: "Ativo",
  });

  // Check authentication status
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

  const createToken = useMutation({
    mutationFn: async (tokenData: Omit<Token, "id">) => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;

      const newId = crypto.randomUUID();
      
      const { error } = await supabase
        .from("Token_Whats")
        .insert({
          id: newId,
          NomedoChip: tokenData.NomedoChip,
          "limite por dia": tokenData["limite por dia"],
          Telefone: tokenData.Telefone,
          cliente: tokenData.cliente,
          Status: tokenData.Status,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      toast({ title: "Token criado com sucesso!" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar token",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateToken = useMutation({
    mutationFn: async (token: Token) => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;

      const { error } = await supabase
        .from("Token_Whats")
        .update({
          NomedoChip: token.NomedoChip,
          "limite por dia": token["limite por dia"],
          Telefone: token.Telefone,
          cliente: token.cliente,
          Status: token.Status,
        })
        .eq("id", token.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      toast({ title: "Token atualizado com sucesso!" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar token",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteToken = useMutation({
    mutationFn: async (id: string) => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;

      const { error } = await supabase
        .from("Token_Whats")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      toast({ title: "Token excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir token",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenData = {
      NomedoChip: formData.NomedoChip || null,
      "limite por dia": formData.limitePorDia ? Number(formData.limitePorDia) : null,
      Telefone: formData.Telefone ? Number(formData.Telefone) : null,
      cliente: formData.cliente || null,
      Status: formData.Status || null,
    };

    if (editingToken) {
      updateToken.mutate({ ...tokenData, id: editingToken.id });
    } else {
      createToken.mutate(tokenData);
    }
  };

  const handleEdit = (token: Token) => {
    setEditingToken(token);
    setFormData({
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

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="NomedoChip">Nome do Chip</Label>
            <Input
              id="NomedoChip"
              value={formData.NomedoChip}
              onChange={(e) =>
                setFormData({ ...formData, NomedoChip: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="limitePorDia">Limite por Dia</Label>
            <Input
              id="limitePorDia"
              type="number"
              value={formData.limitePorDia}
              onChange={(e) =>
                setFormData({ ...formData, limitePorDia: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="Telefone">Telefone</Label>
            <Input
              id="Telefone"
              type="number"
              value={formData.Telefone}
              onChange={(e) =>
                setFormData({ ...formData, Telefone: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Input
              id="cliente"
              value={formData.cliente}
              onChange={(e) =>
                setFormData({ ...formData, cliente: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">
            {editingToken ? "Atualizar Token" : "Criar Token"}
          </Button>
          {editingToken && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Chip</TableHead>
              <TableHead>Limite por Dia</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens?.map((token) => (
              <TableRow key={token.id}>
                <TableCell>{token.NomedoChip}</TableCell>
                <TableCell>{token["limite por dia"]}</TableCell>
                <TableCell>{token.Telefone}</TableCell>
                <TableCell>{token.cliente}</TableCell>
                <TableCell>{token.Status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(token)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteToken.mutate(token.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
};

export default TokenManagement;