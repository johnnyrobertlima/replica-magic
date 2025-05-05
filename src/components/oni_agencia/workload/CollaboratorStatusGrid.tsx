
import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useCollaboratorStatusChanges } from "./hooks/useCollaboratorStatusChanges";

interface StatusChange {
  collaborator_name: string;
  schedule_title: string;
  old_status: string;
  new_status: string;
  changed_at: string;
}

export function CollaboratorStatusGrid() {
  const { statusChanges, isLoading, error } = useCollaboratorStatusChanges();
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Histórico de Status dos Colaboradores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Histórico de Status dos Colaboradores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">Erro ao carregar os dados.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Histórico de Status dos Colaboradores</CardTitle>
      </CardHeader>
      <CardContent>
        {statusChanges.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Nenhum histórico de status encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Agendamento</TableHead>
                  <TableHead>Status Anterior</TableHead>
                  <TableHead>Novo Status</TableHead>
                  <TableHead>Data da Alteração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusChanges.map((change, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{change.collaborator_name}</TableCell>
                    <TableCell>{change.schedule_title}</TableCell>
                    <TableCell>{change.old_status || "—"}</TableCell>
                    <TableCell>{change.new_status}</TableCell>
                    <TableCell>{formatDate(change.changed_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
