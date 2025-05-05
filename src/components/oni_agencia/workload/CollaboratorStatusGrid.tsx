import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useCollaboratorStatusChanges } from "./hooks/useCollaboratorStatusChanges";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusChange {
  collaborator_name: string;
  schedule_title: string;
  old_status: string;
  new_status: string;
  changed_at: string;
  scheduled_date: string;
  schedule_id: string;
  previous_collaborator_name: string | null;
  client_name: string;
  field_type: 'status' | 'collaborator';
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
          <CardTitle>Histórico de Alterações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Agendamento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data do Agendamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Para</TableHead>
                  <TableHead>Data da Alteração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Histórico de Alterações</CardTitle>
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
        <CardTitle>Histórico de Alterações</CardTitle>
      </CardHeader>
      <CardContent>
        {statusChanges.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Nenhum histórico de alterações encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Agendamento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data do Agendamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Para</TableHead>
                  <TableHead>Data da Alteração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusChanges.map((change, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{change.collaborator_name}</TableCell>
                    <TableCell>{change.schedule_title}</TableCell>
                    <TableCell>{change.client_name}</TableCell>
                    <TableCell>
                      {change.scheduled_date ? (
                        <Link 
                          to={`/client-area/oniagencia/controle-pauta?scheduleId=${change.schedule_id}`}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {formatDate(change.scheduled_date)}
                        </Link>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {change.field_type === 'status' ? 'Status' : 'Colaborador'}
                    </TableCell>
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
