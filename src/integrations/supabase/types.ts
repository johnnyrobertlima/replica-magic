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
          title?: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      BLUEBAY_ESTOQUE: {
        Row: {
          COMPRADO: number | null
          DISPONIVEL: number | null
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
      BLUEBAY_ITEM: {
        Row: {
          CODIGOAUX: string | null
          DESCRICAO: string | null
          FILIAL: number
          GRU_CODIGO: string | null
          GRU_DESCRICAO: string | null
          ITEM_CODIGO: string
          MATRIZ: number
        }
        Insert: {
          CODIGOAUX?: string | null
          DESCRICAO?: string | null
          FILIAL: number
          GRU_CODIGO?: string | null
          GRU_DESCRICAO?: string | null
          ITEM_CODIGO: string
          MATRIZ: number
        }
        Update: {
          CODIGOAUX?: string | null
          DESCRICAO?: string | null
          FILIAL?: number
          GRU_CODIGO?: string | null
          GRU_DESCRICAO?: string | null
          ITEM_CODIGO?: string
          MATRIZ?: number
        }
        Relationships: []
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
          NUMDOCUMENTO: number | null
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
          NUMDOCUMENTO?: number | null
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
          NUMDOCUMENTO?: number | null
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
          read: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string | null
          message: string
          name: string
          read?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string | null
          message?: string
          name?: string
          read?: boolean | null
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
    }
    Views: {
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
    }
    Functions: {
      add_user_to_group: {
        Args: {
          p_user_id: string
          p_group_id: string
        }
        Returns: undefined
      }
      calcular_valor_faturar_com_estoque: {
        Args: Record<PropertyKey, never>
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
      check_admin_permission: {
        Args: {
          check_user_id: string
        }
        Returns: boolean
      }
      check_is_admin: {
        Args: {
          user_id: string
        }
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
      get_pedidos_agrupados: {
        Args: {
          data_inicial: string
          data_final: string
        }
        Returns: {
          pes_codigo: number
          quantidade_pedidos: number
          quantidade_itens_com_saldo: number
          valor_do_saldo: number
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
      get_user_group_homepage: {
        Args: {
          user_id_param: string
        }
        Returns: string
      }
      remove_user_from_group: {
        Args: {
          p_assignment_id: string
        }
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
