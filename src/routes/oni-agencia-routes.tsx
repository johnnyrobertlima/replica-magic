
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
import FeirinhaDaConcordiaAgenda from "@/pages/oni_agencia/FeirinhaDaConcordiaAgenda";
import PromobrasAgenda from "@/pages/oni_agencia/PromobrasAgenda";
import PorDentroDaFeirinhaAgenda from "@/pages/oni_agencia/PorDentroDaFeirinhaAgenda";
import ClienteVabHome from "@/pages/oni_agencia/ClienteVabHome";
import VisualizacaoEmCampo from "@/pages/oni_agencia/VisualizacaoEmCampo";

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
    <Route path="/client-area/oniagencia/controle-pauta/visualizacaoemcampo" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/controle-pauta">
        <VisualizacaoEmCampo />
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
    <Route path="/client-area/oniagencia/controle-pauta/feirinhadaconcordia" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/controle-pauta/feirinhadaconcordia">
        <FeirinhaDaConcordiaAgenda />
      </PermissionGuard>
    } />
    <Route path="/client-area/oniagencia/controle-pauta/promobras" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/controle-pauta/promobras">
        <PromobrasAgenda />
      </PermissionGuard>
    } />
    <Route path="/client-area/oniagencia/controle-pauta/pordentrodafeirinha" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/controle-pauta/pordentrodafeirinha">
        <PorDentroDaFeirinhaAgenda />
      </PermissionGuard>
    } />
    <Route path="/client-area/oniagencia/cliente_vab" element={
      <PermissionGuard resourcePath="/client-area/oniagencia/cliente_vab">
        <ClienteVabHome />
      </PermissionGuard>
    } />
  </>
);
