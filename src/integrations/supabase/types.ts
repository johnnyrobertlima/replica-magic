export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ADs: {
        Row: {
          account_id: string | null
          action_values_json: Json | null
          actions_json: Json | null
          ad_id: string | null
          ad_name: string | null
          adset_id: string | null
          adset_name: string | null
          campaign_id: string | null
          campaign_name: string | null
          clicks: number | null
          conversion_values_json: Json | null
          cpc: number | null
          cpp: number | null
          ctr: number | null
          date_start: string | null
          date_stop: string | null
          frequency: number | null
          impressions: number | null
          inline_link_clicks: number | null
          inline_post_engagement: number | null
          objective: string | null
          optimization_goal: string | null
          reach: number | null
          spend: number | null
          unique_actions_json: Json | null
        }
        Insert: {
          account_id?: string | null
          action_values_json?: Json | null
          actions_json?: Json | null
          ad_id?: string | null
          ad_name?: string | null
          adset_id?: string | null
          adset_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          clicks?: number | null
          conversion_values_json?: Json | null
          cpc?: number | null
          cpp?: number | null
          ctr?: number | null
          date_start?: string | null
          date_stop?: string | null
          frequency?: number | null
          impressions?: number | null
          inline_link_clicks?: number | null
          inline_post_engagement?: number | null
          objective?: string | null
          optimization_goal?: string | null
          reach?: number | null
          spend?: number | null
          unique_actions_json?: Json | null
        }
        Update: {
          account_id?: string | null
          action_values_json?: Json | null
          actions_json?: Json | null
          ad_id?: string | null
          ad_name?: string | null
          adset_id?: string | null
          adset_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          clicks?: number | null
          conversion_values_json?: Json | null
          cpc?: number | null
          cpp?: number | null
          ctr?: number | null
          date_start?: string | null
          date_stop?: string | null
          frequency?: number | null
          impressions?: number | null
          inline_link_clicks?: number | null
          inline_post_engagement?: number | null
          objective?: string | null
          optimization_goal?: string | null
          reach?: number | null
          spend?: number | null
          unique_actions_json?: Json | null
        }
        Relationships: []
      }
      approved_orders: {
        Row: {
          action: string | null
          approved_at: string | null
          cliente_data: Json
          id: string
          separacao_id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          approved_at?: string | null
          cliente_data: Json
          id?: string
          separacao_id: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          approved_at?: string | null
          cliente_data?: Json
          id?: string
          separacao_id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          page_location: string | null
          title: string
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          page_location?: string | null
          title: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          page_location?: string | null
          title?: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      bk_requests: {
        Row: {
          attachment_url: string | null
          created_at: string
          department: string
          description: string
          id: string
          protocol: string
          response: string | null
          status: string
          title: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          department: string
          description: string
          id?: string
          protocol: string
          response?: string | null
          status?: string
          title: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          department?: string
          description?: string
          id?: string
          protocol?: string
          response?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      bluebay_empresa: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      BLUEBAY_ESTOQUE: {
        Row: {
          COMPRADO: number | null
          DISPONIVEL: number | null
          ENTROU: number | null
          FILIAL: number
          FISICO: number | null
          ITEM_CODIGO: string
          LIMITE: number | null
          LOCAL: number
          MATRIZ: number
          RESERVADO: number | null
          SUBLOCAL: string
        }
        Insert: {
          COMPRADO?: number | null
          DISPONIVEL?: number | null
          ENTROU?: number | null
          FILIAL: number
          FISICO?: number | null
          ITEM_CODIGO: string
          LIMITE?: number | null
          LOCAL: number
          MATRIZ: number
          RESERVADO?: number | null
          SUBLOCAL: string
        }
        Update: {
          COMPRADO?: number | null
          DISPONIVEL?: number | null
          ENTROU?: number | null
          FILIAL?: number
          FISICO?: number | null
          ITEM_CODIGO?: string
          LIMITE?: number | null
          LOCAL?: number
          MATRIZ?: number
          RESERVADO?: number | null
          SUBLOCAL?: string
        }
        Relationships: []
      }
      BLUEBAY_FATURAMENTO: {
        Row: {
          DATA_EMISSAO: string | null
          FILIAL: number
          ID_EF_DOCFISCAL: number
          ID_EF_DOCFISCAL_ITEM: number
          ITEM_CODIGO: string | null
          MATRIZ: number
          MPED_NUMORDEM: number | null
          NOTA: string | null
          PED_ANOBASE: number | null
          PED_NUMPEDIDO: string | null
          PES_CODIGO: number | null
          QUANTIDADE: number | null
          STATUS: string | null
          TIPO: string | null
          TRANSACAO: number | null
          VALOR_DESCONTO: number | null
          VALOR_NOTA: number | null
          VALOR_UNITARIO: number | null
        }
        Insert: {
          DATA_EMISSAO?: string | null
          FILIAL: number
          ID_EF_DOCFISCAL: number
          ID_EF_DOCFISCAL_ITEM: number
          ITEM_CODIGO?: string | null
          MATRIZ: number
          MPED_NUMORDEM?: number | null
          NOTA?: string | null
          PED_ANOBASE?: number | null
          PED_NUMPEDIDO?: string | null
          PES_CODIGO?: number | null
          QUANTIDADE?: number | null
          STATUS?: string | null
          TIPO?: string | null
          TRANSACAO?: number | null
          VALOR_DESCONTO?: number | null
          VALOR_NOTA?: number | null
          VALOR_UNITARIO?: number | null
        }
        Update: {
          DATA_EMISSAO?: string | null
          FILIAL?: number
          ID_EF_DOCFISCAL?: number
          ID_EF_DOCFISCAL_ITEM?: number
          ITEM_CODIGO?: string | null
          MATRIZ?: number
          MPED_NUMORDEM?: number | null
          NOTA?: string | null
          PED_ANOBASE?: number | null
          PED_NUMPEDIDO?: string | null
          PES_CODIGO?: number | null
          QUANTIDADE?: number | null
          STATUS?: string | null
          TIPO?: string | null
          TRANSACAO?: number | null
          VALOR_DESCONTO?: number | null
          VALOR_NOTA?: number | null
          VALOR_UNITARIO?: number | null
        }
        Relationships: []
      }
      bluebay_grupo_item: {
        Row: {
          ativo: boolean
          created_at: string
          empresa_id: string | null
          gru_codigo: string
          gru_descricao: string
          id: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string | null
          gru_codigo: string
          gru_descricao: string
          id?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string | null
          gru_codigo?: string
          gru_descricao?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bluebay_grupo_item_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "bluebay_empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bluebay_grupo_item_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "bluebay_grupo_item_view"
            referencedColumns: ["empresa_id"]
          },
        ]
      }
      BLUEBAY_ITEM: {
        Row: {
          ativo: boolean | null
          CODIGOAUX: string | null
          DATACADASTRO: string | null
          DESCRICAO: string | null
          empresa: string | null
          estacao: string | null
          faixa_etaria: string | null
          FILIAL: number
          genero: string | null
          GRU_CODIGO: string | null
          GRU_DESCRICAO: string | null
          id_marca: string | null
          id_subcategoria: string | null
          ITEM_CODIGO: string
          MATRIZ: number
          ncm: string | null
        }
        Insert: {
          ativo?: boolean | null
          CODIGOAUX?: string | null
          DATACADASTRO?: string | null
          DESCRICAO?: string | null
          empresa?: string | null
          estacao?: string | null
          faixa_etaria?: string | null
          FILIAL: number
          genero?: string | null
          GRU_CODIGO?: string | null
          GRU_DESCRICAO?: string | null
          id_marca?: string | null
          id_subcategoria?: string | null
          ITEM_CODIGO: string
          MATRIZ: number
          ncm?: string | null
        }
        Update: {
          ativo?: boolean | null
          CODIGOAUX?: string | null
          DATACADASTRO?: string | null
          DESCRICAO?: string | null
          empresa?: string | null
          estacao?: string | null
          faixa_etaria?: string | null
          FILIAL?: number
          genero?: string | null
          GRU_CODIGO?: string | null
          GRU_DESCRICAO?: string | null
          id_marca?: string | null
          id_subcategoria?: string | null
          ITEM_CODIGO?: string
          MATRIZ?: number
          ncm?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_marca"
            columns: ["id_marca"]
            isOneToOne: false
            referencedRelation: "Marca"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subcategoria"
            columns: ["id_subcategoria"]
            isOneToOne: false
            referencedRelation: "SubCategoria"
            referencedColumns: ["id"]
          },
        ]
      }
      BLUEBAY_ITEM_VARIACAO: {
        Row: {
          created_at: string | null
          ean: string | null
          filial: number
          id: string
          id_cor: string | null
          id_tamanho: string | null
          item_codigo: string
          matriz: number
          quantidade: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ean?: string | null
          filial: number
          id?: string
          id_cor?: string | null
          id_tamanho?: string | null
          item_codigo: string
          matriz: number
          quantidade?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ean?: string | null
          filial?: number
          id?: string
          id_cor?: string | null
          id_tamanho?: string | null
          item_codigo?: string
          matriz?: number
          quantidade?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "BLUEBAY_ITEM_VARIACAO_id_cor_fkey"
            columns: ["id_cor"]
            isOneToOne: false
            referencedRelation: "Cor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BLUEBAY_ITEM_VARIACAO_id_tamanho_fkey"
            columns: ["id_tamanho"]
            isOneToOne: false
            referencedRelation: "Tamanho"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BLUEBAY_ITEM_VARIACAO_item_codigo_matriz_filial_fkey"
            columns: ["item_codigo", "matriz", "filial"]
            isOneToOne: false
            referencedRelation: "BLUEBAY_ITEM"
            referencedColumns: ["ITEM_CODIGO", "MATRIZ", "FILIAL"]
          },
        ]
      }
      BLUEBAY_PEDIDO: {
        Row: {
          CENTROCUSTO: string | null
          DATA_PEDIDO: string | null
          FILIAL: number
          ITEM_CODIGO: string | null
          MATRIZ: number
          MPED_NUMORDEM: number
          PED_ANOBASE: number
          PED_NUMPEDIDO: string
          PEDIDO: string | null
          PEDIDO_CLIENTE: string | null
          PEDIDO_OUTRO: string | null
          PES_CODIGO: number | null
          QTDE_ENTREGUE: number | null
          QTDE_PEDIDA: number | null
          QTDE_SALDO: number | null
          REPRESENTANTE: number | null
          STATUS: string | null
          TOTAL_PRODUTO: number | null
          VALOR_UNITARIO: number | null
        }
        Insert: {
          CENTROCUSTO?: string | null
          DATA_PEDIDO?: string | null
          FILIAL: number
          ITEM_CODIGO?: string | null
          MATRIZ: number
          MPED_NUMORDEM: number
          PED_ANOBASE: number
          PED_NUMPEDIDO: string
          PEDIDO?: string | null
          PEDIDO_CLIENTE?: string | null
          PEDIDO_OUTRO?: string | null
          PES_CODIGO?: number | null
          QTDE_ENTREGUE?: number | null
          QTDE_PEDIDA?: number | null
          QTDE_SALDO?: number | null
          REPRESENTANTE?: number | null
          STATUS?: string | null
          TOTAL_PRODUTO?: number | null
          VALOR_UNITARIO?: number | null
        }
        Update: {
          CENTROCUSTO?: string | null
          DATA_PEDIDO?: string | null
          FILIAL?: number
          ITEM_CODIGO?: string | null
          MATRIZ?: number
          MPED_NUMORDEM?: number
          PED_ANOBASE?: number
          PED_NUMPEDIDO?: string
          PEDIDO?: string | null
          PEDIDO_CLIENTE?: string | null
          PEDIDO_OUTRO?: string | null
          PES_CODIGO?: number | null
          QTDE_ENTREGUE?: number | null
          QTDE_PEDIDA?: number | null
          QTDE_SALDO?: number | null
          REPRESENTANTE?: number | null
          STATUS?: string | null
          TOTAL_PRODUTO?: number | null
          VALOR_UNITARIO?: number | null
        }
        Relationships: []
      }
      BLUEBAY_PEDIDO_ORG: {
        Row: {
          CENTROCUSTO: string | null
          DATA_PEDIDO: string | null
          FILIAL: number
          ITEM_CODIGO: string | null
          MATRIZ: number
          MPED_NUMORDEM: number
          PED_ANOBASE: string
          PED_NUMPEDIDO: string
          PEDIDO: string | null
          PEDIDO_CLIENTE: string | null
          PEDIDO_OUTRO: string | null
          PES_CODIGO: number | null
          QTDE_ENTREGUE: number | null
          QTDE_PEDIDA: number | null
          QTDE_SALDO: number | null
          REPRESENTANTE: number | null
          STATUS: string | null
          TOTAL_PRODUTO: number | null
          VALOR_UNITARIO: number | null
        }
        Insert: {
          CENTROCUSTO?: string | null
          DATA_PEDIDO?: string | null
          FILIAL: number
          ITEM_CODIGO?: string | null
          MATRIZ: number
          MPED_NUMORDEM: number
          PED_ANOBASE: string
          PED_NUMPEDIDO: string
          PEDIDO?: string | null
          PEDIDO_CLIENTE?: string | null
          PEDIDO_OUTRO?: string | null
          PES_CODIGO?: number | null
          QTDE_ENTREGUE?: number | null
          QTDE_PEDIDA?: number | null
          QTDE_SALDO?: number | null
          REPRESENTANTE?: number | null
          STATUS?: string | null
          TOTAL_PRODUTO?: number | null
          VALOR_UNITARIO?: number | null
        }
        Update: {
          CENTROCUSTO?: string | null
          DATA_PEDIDO?: string | null
          FILIAL?: number
          ITEM_CODIGO?: string | null
          MATRIZ?: number
          MPED_NUMORDEM?: number
          PED_ANOBASE?: string
          PED_NUMPEDIDO?: string
          PEDIDO?: string | null
          PEDIDO_CLIENTE?: string | null
          PEDIDO_OUTRO?: string | null
          PES_CODIGO?: number | null
          QTDE_ENTREGUE?: number | null
          QTDE_PEDIDA?: number | null
          QTDE_SALDO?: number | null
          REPRESENTANTE?: number | null
          STATUS?: string | null
          TOTAL_PRODUTO?: number | null
          VALOR_UNITARIO?: number | null
        }
        Relationships: []
      }
      BLUEBAY_PESSOA: {
        Row: {
          APELIDO: string | null
          BAIRRO: string | null
          CATEGORIA: string | null
          CEP: string | null
          CIDADE: string | null
          CNPJCPF: string | null
          COMPLEMENTO: string | null
          DATACADASTRO: string | null
          EMAIL: string | null
          ENDERECO: string | null
          fator_correcao: number | null
          INSCRICAO_ESTADUAL: string | null
          NOME_CATEGORIA: string | null
          NUMERO: string | null
          PES_CODIGO: number
          RAZAOSOCIAL: string | null
          TELEFONE: string | null
          UF: string | null
          volume_saudavel_faturamento: number | null
        }
        Insert: {
          APELIDO?: string | null
          BAIRRO?: string | null
          CATEGORIA?: string | null
          CEP?: string | null
          CIDADE?: string | null
          CNPJCPF?: string | null
          COMPLEMENTO?: string | null
          DATACADASTRO?: string | null
          EMAIL?: string | null
          ENDERECO?: string | null
          fator_correcao?: number | null
          INSCRICAO_ESTADUAL?: string | null
          NOME_CATEGORIA?: string | null
          NUMERO?: string | null
          PES_CODIGO: number
          RAZAOSOCIAL?: string | null
          TELEFONE?: string | null
          UF?: string | null
          volume_saudavel_faturamento?: number | null
        }
        Update: {
          APELIDO?: string | null
          BAIRRO?: string | null
          CATEGORIA?: string | null
          CEP?: string | null
          CIDADE?: string | null
          CNPJCPF?: string | null
          COMPLEMENTO?: string | null
          DATACADASTRO?: string | null
          EMAIL?: string | null
          ENDERECO?: string | null
          fator_correcao?: number | null
          INSCRICAO_ESTADUAL?: string | null
          NOME_CATEGORIA?: string | null
          NUMERO?: string | null
          PES_CODIGO?: number
          RAZAOSOCIAL?: string | null
          TELEFONE?: string | null
          UF?: string | null
          volume_saudavel_faturamento?: number | null
        }
        Relationships: []
      }
      BLUEBAY_REPRESENTANTE: {
        Row: {
          PES_CODIGO: number
        }
        Insert: {
          PES_CODIGO: number
        }
        Update: {
          PES_CODIGO?: number
        }
        Relationships: []
      }
      BLUEBAY_TITULO: {
        Row: {
          ANOBASE: number
          DTEMISSAO: string | null
          DTPAGTO: string | null
          DTVENCIMENTO: string | null
          DTVENCTO: string | null
          FILIAL: number
          MATRIZ: number
          NUMDOCUMENTO: string | null
          NUMLCTO: number
          NUMNOTA: number | null
          PES_CODIGO: string | null
          STATUS: string | null
          TIPO: string
          VLRABATIMENTO: number | null
          VLRDESCONTO: number | null
          VLRSALDO: number | null
          VLRTITULO: number | null
        }
        Insert: {
          ANOBASE: number
          DTEMISSAO?: string | null
          DTPAGTO?: string | null
          DTVENCIMENTO?: string | null
          DTVENCTO?: string | null
          FILIAL: number
          MATRIZ: number
          NUMDOCUMENTO?: string | null
          NUMLCTO: number
          NUMNOTA?: number | null
          PES_CODIGO?: string | null
          STATUS?: string | null
          TIPO: string
          VLRABATIMENTO?: number | null
          VLRDESCONTO?: number | null
          VLRSALDO?: number | null
          VLRTITULO?: number | null
        }
        Update: {
          ANOBASE?: number
          DTEMISSAO?: string | null
          DTPAGTO?: string | null
          DTVENCIMENTO?: string | null
          DTVENCTO?: string | null
          FILIAL?: number
          MATRIZ?: number
          NUMDOCUMENTO?: string | null
          NUMLCTO?: number
          NUMNOTA?: number | null
          PES_CODIGO?: string | null
          STATUS?: string | null
          TIPO?: string
          VLRABATIMENTO?: number | null
          VLRDESCONTO?: number | null
          VLRSALDO?: number | null
          VLRTITULO?: number | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          image_url: string | null
          mailing_id: string | null
          message: string
          name: string
          Status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          mailing_id?: string | null
          message: string
          name: string
          Status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          mailing_id?: string | null
          message?: string
          name?: string
          Status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "Clientes_Whats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_mailing_id_fkey"
            columns: ["mailing_id"]
            isOneToOne: false
            referencedRelation: "mailing"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Clientes_Whats: {
        Row: {
          created_at: string | null
          enviar_domingo: boolean | null
          enviar_sabado: boolean | null
          horario_final: string
          horario_inicial: string
          id: string
          nome: string
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          enviar_domingo?: boolean | null
          enviar_sabado?: boolean | null
          horario_final: string
          horario_inicial: string
          id?: string
          nome: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          enviar_domingo?: boolean | null
          enviar_sabado?: boolean | null
          horario_final?: string
          horario_inicial?: string
          id?: string
          nome?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string | null
          message: string
          name: string
          phone: string | null
          read: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string | null
          message: string
          name: string
          phone?: string | null
          read?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string | null
          message?: string
          name?: string
          phone?: string | null
          read?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      Cor: {
        Row: {
          codigo_hex: string | null
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          codigo_hex?: string | null
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          codigo_hex?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Disparos: {
        Row: {
          cliente: string | null
          Data: string | null
          id: string
          Mailing: string | null
          msg: string | null
          nome: string | null
          status: string | null
          Token: string | null
        }
        Insert: {
          cliente?: string | null
          Data?: string | null
          id: string
          Mailing?: string | null
          msg?: string | null
          nome?: string | null
          status?: string | null
          Token?: string | null
        }
        Update: {
          cliente?: string | null
          Data?: string | null
          id?: string
          Mailing?: string | null
          msg?: string | null
          nome?: string | null
          status?: string | null
          Token?: string | null
        }
        Relationships: []
      }
      editorial_lines: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      feirinha_novo_cliente: {
        Row: {
          corredor: string
          created_at: string
          data_inauguracao: string
          id: string
          nome_lojista: string
          numero_banca: string
          observacao: string | null
          solicitante: string
          telefone_proprietario: string
        }
        Insert: {
          corredor: string
          created_at?: string
          data_inauguracao: string
          id?: string
          nome_lojista: string
          numero_banca: string
          observacao?: string | null
          solicitante: string
          telefone_proprietario: string
        }
        Update: {
          corredor?: string
          created_at?: string
          data_inauguracao?: string
          id?: string
          nome_lojista?: string
          numero_banca?: string
          observacao?: string | null
          solicitante?: string
          telefone_proprietario?: string
        }
        Relationships: []
      }
      group_client_access: {
        Row: {
          all_clients: boolean
          client_id: string | null
          created_at: string
          group_id: string
          id: string
          updated_at: string
        }
        Insert: {
          all_clients?: boolean
          client_id?: string | null
          created_at?: string
          group_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          all_clients?: boolean
          client_id?: string | null
          created_at?: string
          group_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_client_access_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_client_access_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_permissions: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          permission_type: Database["public"]["Enums"]["permission_type"]
          resource_path: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          permission_type: Database["public"]["Enums"]["permission_type"]
          resource_path: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          permission_type?: Database["public"]["Enums"]["permission_type"]
          resource_path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          description: string | null
          homepage: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          homepage?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          homepage?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      insights_social: {
        Row: {
          account_id: string | null
          actor_id: string | null
          ad_id: string | null
          body: string | null
          Campanha: string | null
          canal: string | null
          Cliente: string | null
          cliques: number | null
          comments: number | null
          cpc: number | null
          cpm: number | null
          created_time: string | null
          creative_id: string | null
          Custo_por_Mensagens: number | null
          Data: string | null
          effective_status: string | null
          follows: number | null
          Frequência: number | null
          Gasto: number | null
          id: string | null
          Impressões: number | null
          instagram_permalink_url: string | null
          instagram_user_id: string | null
          likes: number | null
          linked_post_id: string | null
          media_type: string | null
          mensagens: number | null
          message: string | null
          name: string | null
          object_type: string | null
          permalink_url: string | null
          post_clicks: number | null
          post_id: string
          post_impressions_organic: number | null
          post_impressions_paid: number | null
          post_video_views: number | null
          post_video_views_organic: number | null
          post_video_views_paid: number | null
          profile_visits: number | null
          reach: number | null
          reelid: string | null
          reelId: string | null
          saved: number | null
          shares: number | null
          timestamp: string | null
          total_comments: number | null
          total_interactions: number | null
          updated_time: string | null
          views: number | null
        }
        Insert: {
          account_id?: string | null
          actor_id?: string | null
          ad_id?: string | null
          body?: string | null
          Campanha?: string | null
          canal?: string | null
          Cliente?: string | null
          cliques?: number | null
          comments?: number | null
          cpc?: number | null
          cpm?: number | null
          created_time?: string | null
          creative_id?: string | null
          Custo_por_Mensagens?: number | null
          Data?: string | null
          effective_status?: string | null
          follows?: number | null
          Frequência?: number | null
          Gasto?: number | null
          id?: string | null
          Impressões?: number | null
          instagram_permalink_url?: string | null
          instagram_user_id?: string | null
          likes?: number | null
          linked_post_id?: string | null
          media_type?: string | null
          mensagens?: number | null
          message?: string | null
          name?: string | null
          object_type?: string | null
          permalink_url?: string | null
          post_clicks?: number | null
          post_id: string
          post_impressions_organic?: number | null
          post_impressions_paid?: number | null
          post_video_views?: number | null
          post_video_views_organic?: number | null
          post_video_views_paid?: number | null
          profile_visits?: number | null
          reach?: number | null
          reelid?: string | null
          reelId?: string | null
          saved?: number | null
          shares?: number | null
          timestamp?: string | null
          total_comments?: number | null
          total_interactions?: number | null
          updated_time?: string | null
          views?: number | null
        }
        Update: {
          account_id?: string | null
          actor_id?: string | null
          ad_id?: string | null
          body?: string | null
          Campanha?: string | null
          canal?: string | null
          Cliente?: string | null
          cliques?: number | null
          comments?: number | null
          cpc?: number | null
          cpm?: number | null
          created_time?: string | null
          creative_id?: string | null
          Custo_por_Mensagens?: number | null
          Data?: string | null
          effective_status?: string | null
          follows?: number | null
          Frequência?: number | null
          Gasto?: number | null
          id?: string | null
          Impressões?: number | null
          instagram_permalink_url?: string | null
          instagram_user_id?: string | null
          likes?: number | null
          linked_post_id?: string | null
          media_type?: string | null
          mensagens?: number | null
          message?: string | null
          name?: string | null
          object_type?: string | null
          permalink_url?: string | null
          post_clicks?: number | null
          post_id?: string
          post_impressions_organic?: number | null
          post_impressions_paid?: number | null
          post_video_views?: number | null
          post_video_views_organic?: number | null
          post_video_views_paid?: number | null
          profile_visits?: number | null
          reach?: number | null
          reelid?: string | null
          reelId?: string | null
          saved?: number | null
          shares?: number | null
          timestamp?: string | null
          total_comments?: number | null
          total_interactions?: number | null
          updated_time?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_social_linked_post_id_fkey"
            columns: ["linked_post_id"]
            isOneToOne: false
            referencedRelation: "insights_social"
            referencedColumns: ["id"]
          },
        ]
      }
      logos: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: boolean | null
          name: string
          type: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name: string
          type?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string
          type?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      mailing: {
        Row: {
          cidade: string
          created_at: string | null
          id: string
          nome: string
          nome_mailing: string
          telefone: string
        }
        Insert: {
          cidade: string
          created_at?: string | null
          id: string
          nome: string
          nome_mailing: string
          telefone: string
        }
        Update: {
          cidade?: string
          created_at?: string | null
          id?: string
          nome?: string
          nome_mailing?: string
          telefone?: string
        }
        Relationships: []
      }
      mailing_contacts: {
        Row: {
          Cont_erro: number | null
          created_at: string | null
          email: string | null
          id: string
          mailing_id: string | null
          nome: string
          Status: string | null
          telefone: string
        }
        Insert: {
          Cont_erro?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          mailing_id?: string | null
          nome: string
          Status?: string | null
          telefone: string
        }
        Update: {
          Cont_erro?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          mailing_id?: string | null
          nome?: string
          Status?: string | null
          telefone?: string
        }
        Relationships: [
          {
            foreignKeyName: "mailing_contacts_mailing_id_fkey"
            columns: ["mailing_id"]
            isOneToOne: false
            referencedRelation: "mailing"
            referencedColumns: ["id"]
          },
        ]
      }
      maior_valor: {
        Row: {
          atualizado_em: string | null
          id: number
          valor: number
        }
        Insert: {
          atualizado_em?: string | null
          id?: number
          valor: number
        }
        Update: {
          atualizado_em?: string | null
          id?: number
          valor?: number
        }
        Relationships: []
      }
      Marca: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      oni_agencia_client_scopes: {
        Row: {
          client_id: string
          created_at: string
          id: string
          quantity: number
          service_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          quantity?: number
          service_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          quantity?: number
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_client_scopes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_client_scopes_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_clients: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      oni_agencia_collaborators: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      oni_agencia_content_schedules: {
        Row: {
          client_id: string
          collaborator_id: string | null
          created_at: string
          creators: string[] | null
          description: string | null
          editorial_line_id: string | null
          execution_phase: string | null
          id: string
          product_id: string | null
          scheduled_date: string
          service_id: string
          status_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          collaborator_id?: string | null
          created_at?: string
          creators?: string[] | null
          description?: string | null
          editorial_line_id?: string | null
          execution_phase?: string | null
          id?: string
          product_id?: string | null
          scheduled_date: string
          service_id: string
          status_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          collaborator_id?: string | null
          created_at?: string
          creators?: string[] | null
          description?: string | null
          editorial_line_id?: string | null
          execution_phase?: string | null
          id?: string
          product_id?: string | null
          scheduled_date?: string
          service_id?: string
          status_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_content_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_editorial_line_id_fkey"
            columns: ["editorial_line_id"]
            isOneToOne: false
            referencedRelation: "editorial_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_schedule_history: {
        Row: {
          changed_by: string | null
          created_at: string
          field_name: string
          id: string
          new_value: string
          old_value: string | null
          schedule_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          field_name: string
          id?: string
          new_value: string
          old_value?: string | null
          schedule_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string
          old_value?: string | null
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_schedule_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_schedule_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_schedules_with_captures"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_services: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          color: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      oni_agencia_status: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          next_status_id: string | null
          previous_status_id: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          next_status_id?: string | null
          previous_status_id?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          next_status_id?: string | null
          previous_status_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_status_next_status_id_fkey"
            columns: ["next_status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_status_previous_status_id_fkey"
            columns: ["previous_status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      oniagencia_capturas: {
        Row: {
          capture_date: string | null
          capture_end_date: string | null
          content_schedule_id: string
          created_at: string
          id: string
          is_all_day: boolean | null
          location: string | null
          updated_at: string
        }
        Insert: {
          capture_date?: string | null
          capture_end_date?: string | null
          content_schedule_id: string
          created_at?: string
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          updated_at?: string
        }
        Update: {
          capture_date?: string | null
          capture_end_date?: string | null
          content_schedule_id?: string
          created_at?: string
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oniagencia_capturas_content_schedule_id_fkey"
            columns: ["content_schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oniagencia_capturas_content_schedule_id_fkey"
            columns: ["content_schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_content_schedules_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oniagencia_capturas_content_schedule_id_fkey"
            columns: ["content_schedule_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_schedules_with_captures"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      Seguidores_Clientes: {
        Row: {
          cliente: string
          data: string
          seguidores: number
        }
        Insert: {
          cliente: string
          data: string
          seguidores: number
        }
        Update: {
          cliente?: string
          data?: string
          seguidores?: number
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          created_at: string | null
          description: string | null
          favicon_url: string | null
          id: string | null
          keywords: string | null
          og_image: string | null
          page_path: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          favicon_url?: string | null
          id?: string | null
          keywords?: string | null
          og_image?: string | null
          page_path: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          favicon_url?: string | null
          id?: string | null
          keywords?: string | null
          og_image?: string | null
          page_path?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      separacao_itens: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          item_codigo: string
          pedido: string
          quantidade_pedida: number
          separacao_id: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          item_codigo: string
          pedido: string
          quantidade_pedida: number
          separacao_id: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          item_codigo?: string
          pedido?: string
          quantidade_pedida?: number
          separacao_id?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "separacao_itens_separacao_id_fkey"
            columns: ["separacao_id"]
            isOneToOne: false
            referencedRelation: "separacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      separacoes: {
        Row: {
          cliente_codigo: number
          cliente_nome: string
          created_at: string
          id: string
          quantidade_itens: number
          status: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          cliente_codigo: number
          cliente_nome: string
          created_at?: string
          id?: string
          quantidade_itens?: number
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Update: {
          cliente_codigo?: number
          cliente_nome?: string
          created_at?: string
          id?: string
          quantidade_itens?: number
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string
          detailed_description: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          sub_services: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description: string
          detailed_description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          sub_services?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string
          detailed_description?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          sub_services?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      social_media: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          platform: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          platform: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          platform?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      sub_themes: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      SubCategoria: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Tamanho: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      themes: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      Token_Whats: {
        Row: {
          cliente: string | null
          contador: number | null
          id: string
          "limite por dia": number | null
          NomedoChip: string | null
          Status: string | null
          Telefone: number | null
          Ultima_utilizacao: string | null
        }
        Insert: {
          cliente?: string | null
          contador?: number | null
          id: string
          "limite por dia"?: number | null
          NomedoChip?: string | null
          Status?: string | null
          Telefone?: number | null
          Ultima_utilizacao?: string | null
        }
        Update: {
          cliente?: string | null
          contador?: number | null
          id?: string
          "limite por dia"?: number | null
          NomedoChip?: string | null
          Status?: string | null
          Telefone?: number | null
          Ultima_utilizacao?: string | null
        }
        Relationships: []
      }
      user_groups: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      user_representantes: {
        Row: {
          codigo_representante: number
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          codigo_representante: number
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          codigo_representante?: number
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      agendamentos_filtrados: {
        Row: {
          agendamento: string | null
          colaborador_nome: string | null
          data: string | null
          linha_editorial: string | null
          servico: string | null
          status: string | null
        }
        Relationships: []
      }
      bluebay_grupo_item_view: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          empresa_id: string | null
          empresa_nome: string | null
          gru_codigo: string | null
          gru_descricao: string | null
          id: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      bluebay_view_faturamento_resumo: {
        Row: {
          ITEM_CODIGO: string | null
          media_valor_unitario: number | null
          total_quantidade: number | null
        }
        Relationships: []
      }
      mv_faturamento_resumido: {
        Row: {
          CENTROCUSTO: string | null
          DATA_EMISSAO: string | null
          DATA_PEDIDO: string | null
          NOTA: string | null
          PED_ANOBASE: number | null
          PED_NUMPEDIDO: string | null
          PES_CODIGO: number | null
          REPRESENTANTE: number | null
        }
        Relationships: []
      }
      mv_titulos_centro_custo_bk: {
        Row: {
          ANOBASE: number | null
          DTEMISSAO: string | null
          DTPAGTO: string | null
          DTVENCIMENTO: string | null
          DTVENCTO: string | null
          FILIAL: number | null
          MATRIZ: number | null
          NUMDOCUMENTO: string | null
          NUMLCTO: number | null
          NUMNOTA: number | null
          PES_CODIGO: string | null
          STATUS: string | null
          TIPO: string | null
          VLRABATIMENTO: number | null
          VLRDESCONTO: number | null
          VLRSALDO: number | null
          VLRTITULO: number | null
        }
        Relationships: []
      }
      oni_agencia_content_schedules_view: {
        Row: {
          client_id: string | null
          client_name: string | null
          collaborator_id: string | null
          collaborator_name: string | null
          creators: string[] | null
          description: string | null
          editorial_line_color: string | null
          editorial_line_id: string | null
          editorial_line_name: string | null
          editorial_line_symbol: string | null
          execution_phase: string | null
          id: string | null
          product_color: string | null
          product_id: string | null
          product_name: string | null
          product_symbol: string | null
          scheduled_date: string | null
          service_category: string | null
          service_color: string | null
          service_id: string | null
          service_name: string | null
          status_color: string | null
          status_id: string | null
          status_name: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_content_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_editorial_line_id_fkey"
            columns: ["editorial_line_id"]
            isOneToOne: false
            referencedRelation: "editorial_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      oni_agencia_schedules_with_captures: {
        Row: {
          capture_date: string | null
          capture_end_date: string | null
          capture_id: string | null
          client_id: string | null
          collaborator_id: string | null
          created_at: string | null
          creators: string[] | null
          description: string | null
          editorial_line_id: string | null
          execution_phase: string | null
          id: string | null
          is_all_day: boolean | null
          location: string | null
          product_id: string | null
          scheduled_date: string | null
          service_id: string | null
          status_id: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oni_agencia_content_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_editorial_line_id_fkey"
            columns: ["editorial_line_id"]
            isOneToOne: false
            referencedRelation: "editorial_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oni_agencia_content_schedules_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "oni_agencia_status"
            referencedColumns: ["id"]
          },
        ]
      }
      user_groups_with_profiles: {
        Row: {
          group_id: string | null
          id: string | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_requests_view: {
        Row: {
          attachment_url: string | null
          created_at: string | null
          department: string | null
          description: string | null
          id: string | null
          protocol: string | null
          response: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string | null
          protocol?: string | null
          response?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string | null
          protocol?: string | null
          response?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vw_representantes: {
        Row: {
          codigo_representante: number | null
          nome_representante: string | null
        }
        Relationships: []
      }
      VW_RESUMO_GERAL: {
        Row: {
          CENTROCUSTO: string | null
          NOTA: string | null
          PED_ANOBASE: number | null
          PED_NUMPEDIDO: string | null
          PES_CODIGO: number | null
          REPRESENTANTE: number | null
        }
        Relationships: []
      }
      vw_titulos_vencidos_cliente: {
        Row: {
          PES_CODIGO: string | null
          quantidade_titulos: number | null
          total_vencido: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_request: {
        Args: {
          protocol: string
          title: string
          department: string
          description: string
          status: string
          user_id: string
          user_email: string
          attachment_url?: string
        }
        Returns: {
          attachment_url: string | null
          created_at: string
          department: string
          description: string
          id: string
          protocol: string
          response: string | null
          status: string
          title: string
          updated_at: string
          user_email: string
          user_id: string
        }[]
      }
      add_user_to_group: {
        Args: { p_user_id: string; p_group_id: string }
        Returns: undefined
      }
      calcular_valor_faturar_com_estoque: {
        Args: Record<PropertyKey, never>
        Returns: {
          valor_total_faturavel: number
        }[]
      }
      calcular_valor_faturar_com_estoque_por_centrocusto: {
        Args: { centro_custo: string }
        Returns: {
          valor_total_faturavel: number
        }[]
      }
      calcular_valor_total_jab: {
        Args: Record<PropertyKey, never>
        Returns: {
          valor_total_saldo: number
        }[]
      }
      calcular_valor_total_por_centrocusto: {
        Args: { centro_custo: string }
        Returns: {
          valor_total_saldo: number
        }[]
      }
      calcular_valor_vencido: {
        Args: { cliente_codigo: string }
        Returns: {
          total_vlr_saldo: number
        }[]
      }
      check_admin_permission: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      check_is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_user_in_group: {
        Args: { user_id: string; group_name: string }
        Returns: boolean
      }
      check_user_permission: {
        Args: {
          user_id: string
          resource_path: string
          required_permission: Database["public"]["Enums"]["permission_type"]
        }
        Returns: boolean
      }
      check_user_permission_for_groups: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_all_groups: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          description: string | null
          homepage: string | null
          id: string
          name: string
          updated_at: string | null
        }[]
      }
      get_bk_faturamento: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          DATA_EMISSAO: string | null
          FILIAL: number
          ID_EF_DOCFISCAL: number
          ID_EF_DOCFISCAL_ITEM: number
          ITEM_CODIGO: string | null
          MATRIZ: number
          MPED_NUMORDEM: number | null
          NOTA: string | null
          PED_ANOBASE: number | null
          PED_NUMPEDIDO: string | null
          PES_CODIGO: number | null
          QUANTIDADE: number | null
          STATUS: string | null
          TIPO: string | null
          TRANSACAO: number | null
          VALOR_DESCONTO: number | null
          VALOR_NOTA: number | null
          VALOR_UNITARIO: number | null
        }[]
      }
      get_bluebay_faturamento: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          DATA_EMISSAO: string | null
          FILIAL: number
          ID_EF_DOCFISCAL: number
          ID_EF_DOCFISCAL_ITEM: number
          ITEM_CODIGO: string | null
          MATRIZ: number
          MPED_NUMORDEM: number | null
          NOTA: string | null
          PED_ANOBASE: number | null
          PED_NUMPEDIDO: string | null
          PES_CODIGO: number | null
          QUANTIDADE: number | null
          STATUS: string | null
          TIPO: string | null
          TRANSACAO: number | null
          VALOR_DESCONTO: number | null
          VALOR_NOTA: number | null
          VALOR_UNITARIO: number | null
        }[]
      }
      get_estoque_para_itens: {
        Args: { item_codigos: string[] }
        Returns: {
          item_codigo: string
          fisico: number
        }[]
      }
      get_filtered_schedules_by_collaborator: {
        Args: { collab_id: string }
        Returns: {
          colaborador_nome: string
          agendamento: string
          data: string
          servico: string
          linha_editorial: string
          status: string
        }[]
      }
      get_itens_por_cliente: {
        Args: {
          data_inicial: string
          data_final: string
          cliente_codigo: number
        }
        Returns: {
          item_codigo: string
          descricao: string
          qtde_pedida: number
          qtde_entregue: number
          qtde_saldo: number
          valor_unitario: number
          pedido: string
          representante: number
        }[]
      }
      get_paginated_schedules: {
        Args: {
          p_client_id?: string
          p_month?: number
          p_year?: number
          p_collaborator_id?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          client_id: string | null
          client_name: string | null
          collaborator_id: string | null
          collaborator_name: string | null
          creators: string[] | null
          description: string | null
          editorial_line_color: string | null
          editorial_line_id: string | null
          editorial_line_name: string | null
          editorial_line_symbol: string | null
          execution_phase: string | null
          id: string | null
          product_color: string | null
          product_id: string | null
          product_name: string | null
          product_symbol: string | null
          scheduled_date: string | null
          service_category: string | null
          service_color: string | null
          service_id: string | null
          service_name: string | null
          status_color: string | null
          status_id: string | null
          status_name: string | null
          title: string | null
        }[]
      }
      get_pedidos_agrupados: {
        Args: { data_inicial: string; data_final: string }
        Returns: {
          pes_codigo: number
          quantidade_pedidos: number
          quantidade_itens_com_saldo: number
          valor_do_saldo: number
        }[]
      }
      get_pedidos_por_cliente: {
        Args: { data_inicial: string; data_final: string }
        Returns: {
          pes_codigo: number
          cliente_nome: string
          representante_codigo: number
          representante_nome: string
          total_valor_pedido: number
          total_valor_faturado: number
          total_valor_saldo: number
          total_quantidade_saldo: number
          volume_saudavel_faturamento: number
          total_pedidos_distintos: number
        }[]
      }
      get_pedidos_unicos: {
        Args: {
          data_inicial: string
          data_final: string
          offset_val: number
          limit_val: number
        }
        Returns: {
          ped_numpedido: string
          total_count: number
        }[]
      }
      get_pedidos_unicos_by_centrocusto: {
        Args: {
          data_inicial: string
          data_final: string
          offset_val: number
          limit_val: number
          centrocusto: string
        }
        Returns: {
          ped_numpedido: string
          total_count: number
        }[]
      }
      get_stock_sales_analytics: {
        Args:
          | {
              p_start_date: string
              p_end_date: string
              p_new_product_date: string
            }
          | {
              p_start_date: string
              p_end_date: string
              p_new_product_date: string
              p_limit?: number
              p_offset?: number
            }
        Returns: {
          item_codigo: string
          descricao: string
          gru_descricao: string
          datacadastro: string
          fisico: number
          disponivel: number
          reservado: number
          entrou: number
          limite: number
          qtd_vendida: number
          valor_total_vendido: number
          data_ultima_venda: string
          giro_estoque: number
          percentual_estoque_vendido: number
          dias_cobertura: number
          produto_novo: boolean
          ranking: number
        }[]
      }
      get_user_group_homepage: {
        Args: { user_id_param: string }
        Returns: string
      }
      refresh_mv_titulos_centro_custo_bk: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      remove_user_from_group: {
        Args: { p_assignment_id: string }
        Returns: undefined
      }
      user_has_client_access: {
        Args: { user_id: string; client_id: string }
        Returns: boolean
      }
    }
    Enums: {
      permission_type: "read" | "write" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      permission_type: ["read", "write", "admin"],
    },
  },
} as const
