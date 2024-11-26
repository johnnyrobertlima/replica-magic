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