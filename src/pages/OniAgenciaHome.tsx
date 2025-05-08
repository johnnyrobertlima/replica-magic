
import { useState } from "react";
import { 
  Users, 
  FileSpreadsheet, 
  CheckSquare, 
  UserPlus,
  CalendarDays,
  BookText,
  Briefcase,
  BarChart2,
  Smartphone,
  Settings,
  Camera
} from "lucide-react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { ServiceCard } from "@/components/oni_agencia/ServiceCard";

const OniAgenciaHome = () => {
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Oni Agência</h1>
          <p className="text-muted-foreground mt-2">
            Portal de Gestão - Acesse os módulos disponíveis abaixo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServiceCard
            title="Visualização em Campo"
            description="Visualize agendamentos em dispositivos móveis para trabalho em campo."
            icon={Smartphone}
            iconColor="bg-indigo-100 text-indigo-600"
            path="/client-area/oniagencia/controle-pauta/visualizacaoemcampo"
          />

          <ServiceCard
            title="Controle de Pauta"
            description="Gerencie todas as pautas, status e atribuições de trabalho."
            icon={CalendarDays}
            iconColor="bg-blue-100 text-blue-600"
            path="/client-area/oniagencia/controle-pauta"
          />

          <ServiceCard
            title="Agenda de Capturas"
            description="Visualize e organize agendamentos com base nas datas de captura."
            icon={Camera}
            iconColor="bg-green-100 text-green-600"
            path="/client-area/oniagencia/capturas"
          />

          <ServiceCard
            title="Relatórios"
            description="Acesse relatórios e métricas de desempenho da agência."
            icon={CheckSquare}
            iconColor="bg-red-100 text-red-600"
            path="/client-area/oniagencia/relatorios"
          />
          
          <ServiceCard
            title="Carga de Trabalho"
            description="Análise de distribuição de tarefas por colaborador."
            icon={BarChart2}
            iconColor="bg-purple-100 text-purple-600"
            path="/client-area/oniagencia/cargacolab"
          />
          
          {/* Admin section header */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-6 mb-2">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-primary">Administração</h2>
            </div>
            <div className="h-0.5 bg-gray-200 mt-2"></div>
          </div>
          
          <ServiceCard
            title="Clientes Oni Agência"
            description="Cadastro e gestão de clientes da Oni Agência."
            icon={Users}
            iconColor="bg-purple-100 text-purple-600"
            path="/client-area/oniagencia/clientes"
          />
          
          <ServiceCard
            title="Cadastro de Serviços"
            description="Gerencie os serviços oferecidos pela agência."
            icon={FileSpreadsheet}
            iconColor="bg-green-100 text-green-600"
            path="/client-area/oniagencia/servicos"
          />
          
          <ServiceCard
            title="Cadastro de Colaboradores"
            description="Gerencie a equipe de colaboradores da agência."
            icon={UserPlus}
            iconColor="bg-amber-100 text-amber-600"
            path="/client-area/oniagencia/colaboradores"
          />
          
          <ServiceCard
            title="Escopo por Cliente"
            description="Cadastre e gerencie escopos de serviços por cliente."
            icon={Briefcase}
            iconColor="bg-cyan-100 text-cyan-600"
            path="/client-area/oniagencia/escopos"
          />
          
          <ServiceCard
            title="Gerenciamento de Conteúdo"
            description="Administre temas, sub-temas, linhas editoriais e produtos."
            icon={BookText}
            iconColor="bg-indigo-100 text-indigo-600"
            path="/admin/sub-themes"
          />
        </div>
      </div>
    </main>
  );
};

export default OniAgenciaHome;
