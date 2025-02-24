
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Group, UserGroup, GroupPermission, PermissionType } from "@/types/permissions";

export function useGroups() {
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*');
      
      if (error) throw error;
      return data as Group[];
    },
  });

  const createGroup = useMutation({
    mutationFn: async (group: Partial<Group>) => {
      const { data, error } = await supabase
        .from('groups')
        .insert(group)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Grupo criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating group:', error);
      toast.error('Erro ao criar grupo');
    },
  });

  return {
    groups,
    isLoading,
    createGroup,
  };
}

export function useUserGroups(userId?: string) {
  const queryClient = useQueryClient();

  const { data: userGroups, isLoading } = useQuery({
    queryKey: ['user-groups', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_groups')
        .select('*, groups(*)')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const addUserToGroup = useMutation({
    mutationFn: async ({ userId, groupId }: { userId: string; groupId: string }) => {
      const { data, error } = await supabase
        .from('user_groups')
        .insert({ user_id: userId, group_id: groupId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-groups'] });
      toast.success('Usuário adicionado ao grupo');
    },
    onError: (error) => {
      console.error('Error adding user to group:', error);
      toast.error('Erro ao adicionar usuário ao grupo');
    },
  });

  return {
    userGroups,
    isLoading,
    addUserToGroup,
  };
}

export function useGroupPermissions(groupId?: string) {
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ['group-permissions', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_permissions')
        .select('*')
        .eq('group_id', groupId);
      
      if (error) throw error;
      return data as GroupPermission[];
    },
    enabled: !!groupId,
  });

  const updatePermission = useMutation({
    mutationFn: async (permission: Partial<GroupPermission>) => {
      const { data, error } = await supabase
        .from('group_permissions')
        .upsert(permission)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-permissions'] });
      toast.success('Permissão atualizada com sucesso');
    },
    onError: (error) => {
      console.error('Error updating permission:', error);
      toast.error('Erro ao atualizar permissão');
    },
  });

  return {
    permissions,
    isLoading,
    updatePermission,
  };
}
