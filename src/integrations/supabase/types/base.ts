export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      event_items: {
        Row: {
          box_number: string | null
          created_at: string
          event_id: string | null
          id: string
          item_id: string | null
          needs_maintenance: boolean | null
          provided_quantity: number | null
          requested_quantity: number
          returned_quantity: number | null
          updated_at: string
        }
        Insert: {
          box_number?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          item_id?: string | null
          needs_maintenance?: boolean | null
          provided_quantity?: number | null
          requested_quantity?: number
          returned_quantity?: number | null
          updated_at?: string
        }
        Update: {
          box_number?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          item_id?: string | null
          needs_maintenance?: boolean | null
          provided_quantity?: number | null
          requested_quantity?: number
          returned_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string
          children_count: number
          city: string
          created_at: string
          edition_number: number
          event_date: string
          id: string
          id_sympla: string | null
          leader_id: string | null
          postal_code: string
          statistics: Json | null
          status: string | null
          team_id: string | null
          type: string
          updated_at: string
          volunteer_count: number
        }
        Insert: {
          address: string
          children_count: number
          city: string
          created_at?: string
          edition_number?: number
          event_date?: string
          id?: string
          id_sympla?: string | null
          leader_id?: string | null
          postal_code: string
          statistics?: Json | null
          status?: string | null
          team_id?: string | null
          type?: string
          updated_at?: string
          volunteer_count: number
        }
        Update: {
          address?: string
          children_count?: number
          city?: string
          created_at?: string
          edition_number?: number
          event_date?: string
          id?: string
          id_sympla?: string | null
          leader_id?: string | null
          postal_code?: string
          statistics?: Json | null
          status?: string | null
          team_id?: string | null
          type?: string
          updated_at?: string
          volunteer_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          asset_type: string
          category: Database["public"]["Enums"]["user_category"]
          created_at: string
          created_by: string | null
          current_stock: number | null
          description: string | null
          id: string
          last_purchase_value: number | null
          name: string
          patrimony_code: string | null
          photo_url: string | null
          teams: string[]
          updated_at: string
        }
        Insert: {
          asset_type?: string
          category: Database["public"]["Enums"]["user_category"]
          created_at?: string
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          last_purchase_value?: number | null
          name: string
          patrimony_code?: string | null
          photo_url?: string | null
          teams?: string[]
          updated_at?: string
        }
        Update: {
          asset_type?: string
          category?: Database["public"]["Enums"]["user_category"]
          created_at?: string
          created_by?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          last_purchase_value?: number | null
          name?: string
          patrimony_code?: string | null
          photo_url?: string | null
          teams?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_list_items: {
        Row: {
          box_number: number | null
          created_at: string
          id: string
          item_id: string
          packing_list_id: string
          provided_quantity: number | null
          requested_quantity: number
          updated_at: string
        }
        Insert: {
          box_number?: number | null
          created_at?: string
          id?: string
          item_id: string
          packing_list_id: string
          provided_quantity?: number | null
          requested_quantity: number
          updated_at?: string
        }
        Update: {
          box_number?: number | null
          created_at?: string
          id?: string
          item_id?: string
          packing_list_id?: string
          provided_quantity?: number | null
          requested_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packing_list_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_list_items_packing_list_id_fkey"
            columns: ["packing_list_id"]
            isOneToOne: false
            referencedRelation: "packing_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_lists: {
        Row: {
          created_at: string
          created_by: string
          event_id: string
          id: string
          status: Database["public"]["Enums"]["packing_list_status"] | null
          team_category: Database["public"]["Enums"]["user_category"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          event_id: string
          id?: string
          status?: Database["public"]["Enums"]["packing_list_status"] | null
          team_category: Database["public"]["Enums"]["user_category"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          event_id?: string
          id?: string
          status?: Database["public"]["Enums"]["packing_list_status"] | null
          team_category?: Database["public"]["Enums"]["user_category"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packing_lists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_lists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      page_permissions: {
        Row: {
          can_create: boolean | null
          can_edit: boolean | null
          can_read: boolean | null
          created_at: string
          id: string
          page_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          can_create?: boolean | null
          can_edit?: boolean | null
          can_read?: boolean | null
          created_at?: string
          id?: string
          page_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          can_create?: boolean | null
          can_edit?: boolean | null
          can_read?: boolean | null
          created_at?: string
          id?: string
          page_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"]
          category: Database["public"]["Enums"]["user_category"] | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"]
          category?: Database["public"]["Enums"]["user_category"] | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"]
          category?: Database["public"]["Enums"]["user_category"] | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string
          id: string
          item_id: string
          movement_type: string
          purchase_value: number | null
          quantity: number
          reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          item_id: string
          movement_type: string
          purchase_value?: number | null
          quantity: number
          reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          item_id?: string
          movement_type?: string
          purchase_value?: number | null
          quantity?: number
          reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      team_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["team_category_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["team_category_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["team_category_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          profile_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          region: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          region: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string
          event_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description: string
          event_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string
          event_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_activities_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
  site_oni: {
    Tables: {
      banners: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          video_url: string | null;
          button_text: string | null;
          button_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['site_oni']['Tables']['banners']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['site_oni']['Tables']['banners']['Insert']>;
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['site_oni']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['site_oni']['Tables']['services']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          name: string;
          logo_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['site_oni']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['site_oni']['Tables']['clients']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
