
import OniAgenciaHome from "@/pages/OniAgenciaHome";
import { 
  OniAgenciaControlePauta, 
  OniAgenciaClientes, 
  OniAgenciaServicos, 
  OniAgenciaColaboradores,
  OniAgenciaRelatorios
} from "@/pages/oni_agencia";

export const oniAgenciaRoutes = [
  {
    path: "/client-area/oniagencia",
    element: <OniAgenciaHome />,
  },
  {
    path: "/client-area/oniagencia/controle-pauta",
    element: <OniAgenciaControlePauta />,
  },
  {
    path: "/client-area/oniagencia/clientes",
    element: <OniAgenciaClientes />,
  },
  {
    path: "/client-area/oniagencia/servicos",
    element: <OniAgenciaServicos />,
  },
  {
    path: "/client-area/oniagencia/colaboradores",
    element: <OniAgenciaColaboradores />,
  },
  {
    path: "/client-area/oniagencia/relatorios",
    element: <OniAgenciaRelatorios />,
  },
] as const;
