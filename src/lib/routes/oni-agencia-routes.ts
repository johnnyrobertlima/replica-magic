
import OniAgenciaHome from "@/pages/OniAgenciaHome";
import OniAgenciaControlePauta from "@/pages/oni_agencia/OniAgenciaControlePauta";
import OniAgenciaClientes from "@/pages/oni_agencia/OniAgenciaClientes";
import OniAgenciaServicos from "@/pages/oni_agencia/OniAgenciaServicos";
import OniAgenciaColaboradores from "@/pages/oni_agencia/OniAgenciaColaboradores";
import OniAgenciaRelatorios from "@/pages/oni_agencia/OniAgenciaRelatorios";
import OniAgenciaClientScopes from "@/pages/oni_agencia/OniAgenciaClientScopes";

export const oniAgenciaRoutes = [
  {
    path: "/client-area/oniagencia",
    element: OniAgenciaHome,
  },
  {
    path: "/client-area/oniagencia/controle-pauta",
    element: OniAgenciaControlePauta,
  },
  {
    path: "/client-area/oniagencia/clientes",
    element: OniAgenciaClientes,
  },
  {
    path: "/client-area/oniagencia/servicos",
    element: OniAgenciaServicos,
  },
  {
    path: "/client-area/oniagencia/colaboradores",
    element: OniAgenciaColaboradores,
  },
  {
    path: "/client-area/oniagencia/relatorios",
    element: OniAgenciaRelatorios,
  },
  {
    path: "/client-area/oniagencia/escopos",
    element: OniAgenciaClientScopes,
  },
] as const;
