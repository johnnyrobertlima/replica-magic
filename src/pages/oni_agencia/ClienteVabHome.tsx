
import { CalendarDays } from "lucide-react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { ServiceCard } from "@/components/oni_agencia/ServiceCard";

const ClienteVabHome = () => {
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Cliente VAB</h1>
          <p className="text-muted-foreground mt-2">
            Controle de pautas dos clientes VAB
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServiceCard
            title="Controle de Pauta - Feirinha da Concórdia"
            description="Gerencie as pautas da Feirinha da Concórdia."
            icon={CalendarDays}
            iconColor="bg-blue-100 text-blue-600"
            path="/client-area/oniagencia/controle-pauta/feirinhadaconcordia"
          />

          <ServiceCard
            title="Controle de Pauta - Promobras"
            description="Gerencie as pautas da Promobras."
            icon={CalendarDays}
            iconColor="bg-purple-100 text-purple-600"
            path="/client-area/oniagencia/controle-pauta/promobras"
          />

          <ServiceCard
            title="Controle de Pauta - Por Dentro da Feirinha"
            description="Gerencie as pautas do Por Dentro da Feirinha."
            icon={CalendarDays}
            iconColor="bg-green-100 text-green-600"
            path="/client-area/oniagencia/controle-pauta/pordentrodafeirinha"
          />
        </div>
      </div>
    </main>
  );
};

export default ClienteVabHome;
