
import { useState } from "react";
import { 
  Users, 
  FileSpreadsheet, 
  CheckSquare, 
  UserPlus,
  CalendarDays,
  BookText,
  Briefcase
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
            title="Controle de Pauta"
            description="Gerencie todas as pautas, status e atribuições de trabalho."
            icon={CalendarDays}
            iconColor="bg-blue-100 text-blue-600"
            path="/client-area/oniagencia/controle-pauta"
          />
          
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
            title="Relatórios"
            description="Acesse relatórios e métricas de desempenho da agência."
            icon={CheckSquare}
            iconColor="bg-red-100 text-red-600"
            path="/client-area/oniagencia/relatorios"
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
