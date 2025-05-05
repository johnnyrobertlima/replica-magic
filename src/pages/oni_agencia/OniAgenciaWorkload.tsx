
import { useState } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { WorkloadDashboard } from "@/components/oni_agencia/workload/WorkloadDashboard";

const OniAgenciaWorkload = () => {
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Carga de Trabalho</h1>
          <p className="text-muted-foreground mt-2">
            Análise de distribuição de tarefas por colaborador e histórico de status
          </p>
        </div>
        <WorkloadDashboard />
      </div>
    </main>
  );
};

export default OniAgenciaWorkload;
