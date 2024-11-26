import { PublicEnums } from './base';

export interface PublicTables {
  event_items: {
    Row: {
      id: string;
      event_id: string | null;
      item_id: string | null;
      requested_quantity: number;
      provided_quantity: number | null;
      returned_quantity: number | null;
      box_number: string | null;
      needs_maintenance: boolean | null;
      created_at: string;
      updated_at: string;
    };
    Insert: Partial<Omit<PublicTables['event_items']['Row'], 'id' | 'created_at' | 'updated_at'>>;
    Update: Partial<PublicTables['event_items']['Insert']>;
    Relationships: [
      {
        foreignKeyName: "event_items_event_id_fkey";
        columns: ["event_id"];
        isOneToOne: false;
        referencedRelation: "events";
        referencedColumns: ["id"];
      },
      {
        foreignKeyName: "event_items_item_id_fkey";
        columns: ["item_id"];
        isOneToOne: false;
        referencedRelation: "items";
        referencedColumns: ["id"];
      }
    ];
  };
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
    Insert: Omit<PublicTables['banners']['Row'], 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<PublicTables['banners']['Insert']>;
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
    Insert: Omit<PublicTables['services']['Row'], 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<PublicTables['services']['Insert']>;
  };
  clients: {
    Row: {
      id: string;
      name: string;
      logo_url: string;
      created_at: string;
      updated_at: string;
    };
    Insert: Omit<PublicTables['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<PublicTables['clients']['Insert']>;
  };
}
