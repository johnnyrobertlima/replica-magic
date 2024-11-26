import { PublicTables } from './public';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: PublicTables;
    Views: {};
    Functions: PublicFunctions;
    Enums: PublicEnums;
    CompositeTypes: {};
  };
  site_oni: {
    Tables: SiteOniTables;
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export interface PublicFunctions {
  set_events_status_to_open: {
    Args: Record<PropertyKey, never>;
    Returns: undefined;
  };
}

export interface PublicEnums {
  access_level: "full" | "team_only";
  packing_list_status:
    | "draft"
    | "in_review"
    | "sent_to_event"
    | "conferencia_lider"
    | "na_edicao"
    | "fim_edicao"
    | "recebida"
    | "conferido_pelo_lider"
    | "finalizado";
  team_category_status: "active" | "inactive";
  user_category:
    | "all"
    | "kitchen"
    | "recreation"
    | "support"
    | "photography"
    | "sorriso_de_amor"
    | "fabrica_de_sonhos"
    | "interaction"
    | "store";
  user_role:
    | "admin"
    | "event_leader"
    | "organizer"
    | "coordinator"
    | "hq_team"
    | "consultant";
}

export interface SiteOniTables {
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
    Insert: Omit<SiteOniTables['banners']['Row'], 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<SiteOniTables['banners']['Insert']>;
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
    Insert: Omit<SiteOniTables['services']['Row'], 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<SiteOniTables['services']['Insert']>;
  };
  clients: {
    Row: {
      id: string;
      name: string;
      logo_url: string;
      created_at: string;
      updated_at: string;
    };
    Insert: Omit<SiteOniTables['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<SiteOniTables['clients']['Insert']>;
  };
}