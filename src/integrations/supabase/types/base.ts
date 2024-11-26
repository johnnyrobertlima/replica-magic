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