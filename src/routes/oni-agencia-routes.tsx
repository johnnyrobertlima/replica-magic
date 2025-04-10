
import { Route } from "react-router-dom";
import { Fragment } from "react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import OniAgenciaHome from "@/pages/OniAgenciaHome";
import OniAgenciaControlePauta from "@/pages/oni_agencia/OniAgenciaControlePauta";
import OniAgenciaClientes from "@/pages/oni_agencia/OniAgenciaClientes";
import OniAgenciaServicos from "@/pages/oni_agencia/OniAgenciaServicos";
import OniAgenciaColaboradores from "@/pages/oni_agencia/OniAgenciaColaboradores";
import OniAgenciaRelatorios from "@/pages/oni_agencia/OniAgenciaRelatorios";

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
  </>
);
