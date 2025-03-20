
import React from "react";
import { ActionButtons } from "@/components/admin/ActionButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRepresentantes } from "@/hooks/useRepresentantes";

const Representantes = () => {
  const {
    representantes,
    users,
    userRepresentantes,
    isLoading,
    selectedUser,
    setSelectedUser,
    selectedRepresentante,
    setSelectedRepresentante,
    addUserRepresentante,
    deleteUserRepresentante,
  } = useRepresentantes();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center p-8">
        <div className="animate-pulse text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Gerenciamento de Representantes</h1>

      <Card>
        <CardHeader>
          <CardTitle>Vincular Usuário a Representante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuário</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
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

            <div className="space-y-2">
              <Label htmlFor="representante">Representante</Label>
              <Select 
                value={selectedRepresentante?.toString() || ""} 
                onValueChange={(value) => setSelectedRepresentante(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um representante" />
                </SelectTrigger>
                <SelectContent>
                  {representantes?.map((rep) => (
                    <SelectItem 
                      key={rep.codigo_representante} 
                      value={rep.codigo_representante.toString()}
                    >
                      {rep.nome_representante}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={() => addUserRepresentante.mutate()}
            disabled={!selectedUser || !selectedRepresentante || addUserRepresentante.isPending}
          >
            {addUserRepresentante.isPending ? "Salvando..." : "Vincular Usuário ao Representante"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vínculos Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {userRepresentantes && userRepresentantes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Representante</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRepresentantes.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>{link.user_email}</TableCell>
                    <TableCell>{link.nome_representante}</TableCell>
                    <TableCell>
                      <ActionButtons
                        showEdit={false}
                        onDelete={() => deleteUserRepresentante.mutate(link.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">
              Nenhum vínculo encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Representantes;
