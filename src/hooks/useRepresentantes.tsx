
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Representante, UserRepresentante, UserRepresentanteWithDetails } from "@/types/representante";
import { User } from "@/pages/admin/users/types";

export const useRepresentantes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRepresentante, setSelectedRepresentante] = useState<number | null>(null);

  // Fetch all representatives from the view
  const { data: representantes, isLoading: isLoadingRepresentantes } = useQuery({
    queryKey: ["representantes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_representantes")
        .select("*")
        .order("nome_representante");

      if (error) {
        toast({
          title: "Erro ao buscar representantes",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Representante[];
    },
  });

  // Fetch all users from the system
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, email");

      if (error) {
        toast({
          title: "Erro ao buscar usuários",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as User[];
    },
  });

  // Fetch existing user-representante links with details
  const { data: userRepresentantes, isLoading: isLoadingLinks } = useQuery({
    queryKey: ["userRepresentantes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_representantes")
        .select("*");

      if (error) {
        toast({
          title: "Erro ao buscar vínculos",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Enhance with user and representante details
      const enhancedData: UserRepresentanteWithDetails[] = await Promise.all(
        data.map(async (link) => {
          // Get user email
          const { data: userData } = await supabase
            .from("user_profiles")
            .select("email")
            .eq("id", link.user_id)
            .single();

          // Get representante name
          const { data: repData } = await supabase
            .from("vw_representantes")
            .select("nome_representante")
            .eq("codigo_representante", link.codigo_representante)
            .single();

          return {
            ...link,
            user_email: userData?.email,
            nome_representante: repData?.nome_representante,
          };
        })
      );

      return enhancedData;
    },
  });

  // Add a new user-representante link
  const addUserRepresentante = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !selectedRepresentante) {
        throw new Error("Usuário e Representante devem ser selecionados");
      }

      const { data, error } = await supabase
        .from("user_representantes")
        .insert({
          user_id: selectedUser,
          codigo_representante: selectedRepresentante,
        })
        .select();

      if (error) {
        throw error;
      }

      return data[0] as UserRepresentante;
    },
    onSuccess: () => {
      toast({
        title: "Vínculo criado com sucesso",
        description: "O usuário foi vinculado ao representante.",
      });
      queryClient.invalidateQueries({ queryKey: ["userRepresentantes"] });
      setSelectedUser("");
      setSelectedRepresentante(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar vínculo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a user-representante link
  const deleteUserRepresentante = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_representantes")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Vínculo removido com sucesso",
        description: "O vínculo entre usuário e representante foi removido.",
      });
      queryClient.invalidateQueries({ queryKey: ["userRepresentantes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover vínculo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    representantes,
    users,
    userRepresentantes,
    isLoading: isLoadingRepresentantes || isLoadingUsers || isLoadingLinks,
    selectedUser,
    setSelectedUser,
    selectedRepresentante,
    setSelectedRepresentante,
    addUserRepresentante,
    deleteUserRepresentante,
  };
};
