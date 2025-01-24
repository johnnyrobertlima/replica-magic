import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { edit, trash } from "lucide-react";

interface Token {
  id: string;
  NomedoChip: string;
  "limite por dia": number;
  Telefone: number;
  cliente: string;
  Status: string;
}

const TokenManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [formData, setFormData] = useState({
    NomedoChip: "",
    limitePorDia: "",
    Telefone: "",
    cliente: "",
    Status: "Ativo",
  });

  const { data: tokens } = useQuery({
    queryKey: ["tokens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Token_Whats")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const createToken = useMutation({
    mutationFn: async (token: Omit<Token, "id">) => {
      const { error } = await supabase
        .from("Token_Whats")
        .insert([token]);
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
      NomedoChip: formData.NomedoChip,
      "limite por dia": Number(formData.limitePorDia),
      Telefone: Number(formData.Telefone),
      cliente: formData.cliente,
      Status: formData.Status,
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
      NomedoChip: token.NomedoChip,
      limitePorDia: token["limite por dia"].toString(),
      Telefone: token.Telefone.toString(),
      cliente: token.cliente,
      Status: token.Status,
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
                      <edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteToken.mutate(token.id)}
                    >
                      <trash className="h-4 w-4" />
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