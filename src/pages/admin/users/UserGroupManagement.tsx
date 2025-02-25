
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { GroupSelect } from "./components/GroupSelect";
import { UserSelect } from "./components/UserSelect";
import { UsersTable } from "./components/UsersTable";
import { useGroups } from "./hooks/useGroups";
import { useUsers } from "./hooks/useUsers";
import { useGroupUsers } from "./hooks/useGroupUsers";

export const UserGroupManagement = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { data: groups, isLoading: isLoadingGroups } = useGroups();
  const { data: users } = useUsers();
  const { data: groupUsers, isLoading: isLoadingGroupUsers, refetch: refetchGroupUsers } = useGroupUsers(selectedGroupId);

  const handleAddUserToGroup = async () => {
    if (!selectedGroupId || !selectedUserId) {
      toast.error("Selecione um grupo e um usuário");
      return;
    }

    try {
      // Verificar se o usuário já está no grupo
      const { data: existingAssignment } = await supabase
        .from("user_groups_with_profiles")
        .select("id")
        .eq("group_id", selectedGroupId)
        .eq("user_id", selectedUserId)
        .single();

      if (existingAssignment) {
        toast.error("Este usuário já está no grupo");
        return;
      }

      // Inserir usando uma inserção direta na tabela
      const { error } = await supabase
        .from("user_groups")
        .insert([{ 
          group_id: selectedGroupId, 
          user_id: selectedUserId 
        }]);

      if (error) {
        console.error("Error adding user to group:", error);
        toast.error("Erro ao adicionar usuário ao grupo");
        return;
      }

      toast.success("Usuário adicionado ao grupo com sucesso");
      refetchGroupUsers();
      setSelectedUserId("");
    } catch (error) {
      console.error("Error in handleAddUserToGroup:", error);
      toast.error("Erro ao adicionar usuário ao grupo");
    }
  };

  const handleRemoveUserFromGroup = async (assignmentId: string) => {
    if (!window.confirm("Tem certeza que deseja remover este usuário do grupo?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_groups")
        .delete()
        .eq("id", assignmentId);

      if (error) {
        console.error("Error removing user from group:", error);
        toast.error("Erro ao remover usuário do grupo");
        return;
      }

      toast.success("Usuário removido do grupo com sucesso");
      refetchGroupUsers();
    } catch (error) {
      console.error("Error in handleRemoveUserFromGroup:", error);
      toast.error("Erro ao remover usuário do grupo");
    }
  };

  if (isLoadingGroups) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários dos Grupos</h1>
      </div>

      <div className="grid gap-6">
        <GroupSelect
          groups={groups}
          value={selectedGroupId}
          onChange={setSelectedGroupId}
        />

        {selectedGroupId && (
          <>
            <UserSelect
              users={users}
              value={selectedUserId}
              onChange={setSelectedUserId}
              onAdd={handleAddUserToGroup}
            />

            <UsersTable
              users={groupUsers}
              isLoading={isLoadingGroupUsers}
              onRemove={handleRemoveUserFromGroup}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserGroupManagement;
