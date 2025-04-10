
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { CalendarDays } from "lucide-react";

const OniAgenciaControlePauta = () => {
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Controle de Pauta</h1>
        </div>
        
        <div className="bg-white rounded-md border shadow-sm p-8">
          <p className="text-muted-foreground text-center">
            Módulo de Controle de Pauta em desenvolvimento.
          </p>
        </div>
      </div>
    </main>
  );
};

export default OniAgenciaControlePauta;
