
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import type { Group } from "../groups/types";
import type { User, UserGroupAssignment } from "./types";

export const UserGroupManagement = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Group[];
    },
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      return data.users.map(user => ({
        id: user.id,
        email: user.email,
      })) as User[];
    },
  });

  const { data: groupUsers, isLoading: isLoadingGroupUsers, refetch: refetchGroupUsers } = useQuery({
    queryKey: ["group-users", selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      const { data, error } = await supabase
        .from("user_groups")
        .select(`
          *,
          auth.users!inner (
            email
          )
        `)
        .eq("group_id", selectedGroupId);
      
      if (error) throw error;
      
      return data.map(assignment => ({
        ...assignment,
        user_email: assignment.users.email,
      })) as UserGroupAssignment[];
    },
    enabled: !!selectedGroupId,
  });

  const handleAddUserToGroup = async () => {
    if (!selectedGroupId || !selectedUserId) {
      toast.error("Selecione um grupo e um usuário");
      return;
    }

    const { error } = await supabase
      .from("user_groups")
      .insert([{ group_id: selectedGroupId, user_id: selectedUserId }]);

    if (error) {
      if (error.code === '23505') {
        toast.error("Este usuário já está no grupo");
      } else {
        toast.error("Erro ao adicionar usuário ao grupo");
      }
      return;
    }

    toast.success("Usuário adicionado ao grupo com sucesso");
    refetchGroupUsers();
    setSelectedUserId("");
  };

  const handleRemoveUserFromGroup = async (assignmentId: string) => {
    if (!window.confirm("Tem certeza que deseja remover este usuário do grupo?")) {
      return;
    }

    const { error } = await supabase
      .from("user_groups")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      toast.error("Erro ao remover usuário do grupo");
      return;
    }

    toast.success("Usuário removido do grupo com sucesso");
    refetchGroupUsers();
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="group">Selecione um grupo</Label>
          <Select
            value={selectedGroupId}
            onValueChange={(value) => setSelectedGroupId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {groups?.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedGroupId && (
          <>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="user">Adicionar usuário ao grupo</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={(value) => setSelectedUserId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddUserToGroup}
                disabled={!selectedUserId}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email do Usuário</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingGroupUsers ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : groupUsers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Nenhum usuário encontrado neste grupo
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupUsers?.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>{assignment.user_email}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveUserFromGroup(assignment.id)}
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserGroupManagement;
