
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { ClientScopeList } from "@/components/oni_agencia/client-scope/ClientScopeList";
import { Briefcase } from "lucide-react";

const OniAgenciaClientScopes = () => {
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-4 max-w-full">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Escopo por Cliente</h1>
        </div>
        
        <div className="bg-white rounded-md shadow-sm p-6">
          <ClientScopeList />
        </div>
      </div>
    </main>
  );
};

export default OniAgenciaClientScopes;
