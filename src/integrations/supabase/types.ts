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
          LOCAL: number | null
          MATRIZ: number
          RESERVADO: number | null
        }
        Insert: {
          COMPRADO?: number | null
          DISPONIVEL?: number | null
          FILIAL: number
          FISICO?: number | null
          ITEM_CODIGO: string
          LIMITE?: number | null
          LOCAL?: number | null
          MATRIZ: number
          RESERVADO?: number | null
        }
        Update: {
          COMPRADO?: number | null
          DISPONIVEL?: number | null
          FILIAL?: number
          FISICO?: number | null
          ITEM_CODIGO?: string
          LIMITE?: number | null
          LOCAL?: number | null
          MATRIZ?: number
          RESERVADO?: number | null
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
          MPED_NUMORDEM: number | null
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
        }
        Insert: {
          CENTROCUSTO?: string | null
          DATA_PEDIDO?: string | null
          FILIAL: number
          ITEM_CODIGO?: string | null
          MATRIZ: number
          MPED_NUMORDEM?: number | null
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
        }
        Update: {
          CENTROCUSTO?: string | null
          DATA_PEDIDO?: string | null
          FILIAL?: number
          ITEM_CODIGO?: string | null
          MATRIZ?: number
          MPED_NUMORDEM?: number | null
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
      insights_social: {
        Row: {
          Canal: string
          clicks: number | null
          Cliente: string
          created_time: string | null
          creative_id: string | null
          date_start: string | null
          date_stop: string | null
          effective_object_story_id: string | null
          follows: number | null
          id: string | null
          ig_reels_avg_watch_time: number | null
          ig_reels_video_view_total_time: number | null
          impressions: number | null
          likes: number | null
          media_url: string | null
          message: string | null
          permalink: string | null
          permalink_url: string | null
          post_clicks: number | null
          post_id: string
          post_impressions: number | null
          post_impressions_organic: number | null
          post_impressions_paid: number | null
          post_reactions_like_total: number | null
          post_video_views: number | null
          post_video_views_organic: number | null
          post_video_views_paid: number | null
          profile_visits: number | null
          reach: number | null
          saved: number | null
          shares: number | null
          spend: number | null
          status_type: string | null
          total_comments: number | null
          total_interactions: number | null
          views: number | null
        }
        Insert: {
          Canal: string
          clicks?: number | null
          Cliente: string
          created_time?: string | null
          creative_id?: string | null
          date_start?: string | null
          date_stop?: string | null
          effective_object_story_id?: string | null
          follows?: number | null
          id?: string | null
          ig_reels_avg_watch_time?: number | null
          ig_reels_video_view_total_time?: number | null
          impressions?: number | null
          likes?: number | null
          media_url?: string | null
          message?: string | null
          permalink?: string | null
          permalink_url?: string | null
          post_clicks?: number | null
          post_id: string
          post_impressions?: number | null
          post_impressions_organic?: number | null
          post_impressions_paid?: number | null
          post_reactions_like_total?: number | null
          post_video_views?: number | null
          post_video_views_organic?: number | null
          post_video_views_paid?: number | null
          profile_visits?: number | null
          reach?: number | null
          saved?: number | null
          shares?: number | null
          spend?: number | null
          status_type?: string | null
          total_comments?: number | null
          total_interactions?: number | null
          views?: number | null
        }
        Update: {
          Canal?: string
          clicks?: number | null
          Cliente?: string
          created_time?: string | null
          creative_id?: string | null
          date_start?: string | null
          date_stop?: string | null
          effective_object_story_id?: string | null
          follows?: number | null
          id?: string | null
          ig_reels_avg_watch_time?: number | null
          ig_reels_video_view_total_time?: number | null
          impressions?: number | null
          likes?: number | null
          media_url?: string | null
          message?: string | null
          permalink?: string | null
          permalink_url?: string | null
          post_clicks?: number | null
          post_id?: string
          post_impressions?: number | null
          post_impressions_organic?: number | null
          post_impressions_paid?: number | null
          post_reactions_like_total?: number | null
          post_video_views?: number | null
          post_video_views_organic?: number | null
          post_video_views_paid?: number | null
          profile_visits?: number | null
          reach?: number | null
          saved?: number | null
          shares?: number | null
          spend?: number | null
          status_type?: string | null
          total_comments?: number | null
          total_interactions?: number | null
          views?: number | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
