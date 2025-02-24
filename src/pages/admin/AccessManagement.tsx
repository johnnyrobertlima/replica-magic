
import { useState } from "react";
import { useGroups, useUserGroups, useGroupPermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PermissionType } from "@/types/permissions";

export default function AccessManagement() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>();
  const { groups, isLoading: isLoadingGroups, createGroup } = useGroups();
  const { permissions, updatePermission } = useGroupPermissions(selectedGroupId);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  const handleCreateGroup = async () => {
    if (!newGroupName) return;
    await createGroup.mutateAsync({
      name: newGroupName,
      description: newGroupDescription,
    });
    setNewGroupName("");
    setNewGroupDescription("");
  };

  const handleUpdatePermission = async (resourcePath: string, permissionType: PermissionType) => {
    if (!selectedGroupId) return;
    await updatePermission.mutateAsync({
      group_id: selectedGroupId,
      resource_path: resourcePath,
      permission_type: permissionType,
    });
  };

  if (isLoadingGroups) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Acessos</h1>

      <div className="grid gap-6">
        {/* Criar Novo Grupo */}
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Grupo</CardTitle>
            <CardDescription>
              Crie um novo grupo de usuários com permissões específicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Nome do Grupo</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Ex: Administradores"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupDescription">Descrição</Label>
              <Input
                id="groupDescription"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Descreva o propósito do grupo"
              />
            </div>
            <Button onClick={handleCreateGroup}>Criar Grupo</Button>
          </CardContent>
        </Card>

        {/* Gerenciar Permissões */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Permissões</CardTitle>
            <CardDescription>
              Defina as permissões para cada grupo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupSelect">Selecione um Grupo</Label>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Permissões</h3>
                {permissions?.map((permission) => (
                  <div key={permission.id} className="flex items-center gap-4">
                    <span className="flex-1">{permission.resource_path}</span>
                    <Select
                      value={permission.permission_type}
                      onValueChange={(value: PermissionType) =>
                        handleUpdatePermission(permission.resource_path, value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Leitura</SelectItem>
                        <SelectItem value="write">Escrita</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
