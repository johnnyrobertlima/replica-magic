
// Interface definitions for batch querying
export type SupabaseTable = 
  | "ADs"
  | "approved_orders"
  | "banners"
  | "bk_requests"
  | "BLUEBAY_ESTOQUE"
  | "BLUEBAY_FATURAMENTO"
  | "BLUEBAY_ITEM"
  | "BLUEBAY_PEDIDO"
  | "BLUEBAY_PEDIDO_ORG"
  | "BLUEBAY_PESSOA"
  | "BLUEBAY_REPRESENTANTE"
  | "BLUEBAY_TITULO"
  | "campaigns"
  | "categories"
  | "clients"
  | "Clientes_Whats"
  | "contact_messages"
  | "Disparos"
  | "group_permissions"
  | "groups"
  | "insights_social"
  | "logos"
  | "mailing"
  | "mailing_contacts"
  | "maior_valor"
  | "separacoes"
  | "separacao_itens"
  | "services"
  | "Seguidores_Clientes"
  | "seo_settings"
  | "social_media"
  | "Token_Whats"
  | "user_groups"
  | "user_profiles"
  | "user_representantes"
  | "mv_faturamento_resumido"
  | "mv_titulos_centro_custo_bk"
  | "user_groups_with_profiles"
  | "user_requests_view"
  | "vw_representantes"
  | "VW_RESUMO_GERAL"
  | "vw_titulos_vencidos_cliente";

export type QueryCondition = {
  type: 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  column: string;
  value: any;
};

export interface FetchBatchesParams {
  table: SupabaseTable;
  selectFields: string;
  filters?: Record<string, any>;
  conditions?: QueryCondition[];
  batchSize?: number;
  logPrefix?: string;
  count?: boolean;
}
