
import { Route } from "react-router-dom";
import { Fragment } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import OniAgenciaHome from "@/pages/OniAgenciaHome";
import { 
  OniAgenciaControlePauta,
  OniAgenciaClientes,
  OniAgenciaServicos,
  OniAgenciaColaboradores,
  OniAgenciaRelatorios,
  OniAgenciaClientScopes
} from "@/pages/oni_agencia";
import OniAgenciaWorkload from "@/pages/oni_agencia/OniAgenciaWorkload";

export const oniAgenciaRoutes = (
  <>
    <Route path="/client-area/oniagencia" element={
      <PermissionGuard resourcePath="/client-area/oniagencia">
        <OniAgenciaHome />
      </PermissionGuard>
    } />
    <Route path="/client-area/oniagencia/controle-pauta" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/controle-pauta">
        <OniAgenciaControlePauta />
      </PermissionGuard>
    } />
    <Route path="/client-area/oniagencia/cargacolab" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/cargacolab">
        <OniAgenciaWorkload />
      </PermissionGuard>
    } />
    <Route path="/client-area/oniagencia/clientes" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/clientes">
        <OniAgenciaClientes />
      </PermissionGuard>
    } />
    <Route path="/client-area/oniagencia/servicos" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/servicos">
        <OniAgenciaServicos />
      </PermissionGuard>
    } />
    <Route path="/client-area/oniagencia/colaboradores" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/colaboradores">
        <OniAgenciaColaboradores />
      </PermissionGuard>
    } />
    <Route path="/client-area/oniagencia/relatorios" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/relatorios">
        <OniAgenciaRelatorios />
      </PermissionGuard>
    } />
    <Route path="/client-area/oniagencia/escopos" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/escopos">
        <OniAgenciaClientScopes />
      </PermissionGuard>
    } />
  </>
);
