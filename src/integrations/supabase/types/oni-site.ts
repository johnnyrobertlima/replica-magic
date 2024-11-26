export type OniSiteSchema = {
  Tables: {
    banners: {
      Row: {
        id: string;
        title: string;
        description: string | null;
        button_text: string | null;
        button_url: string | null;
        media_type: 'image' | 'youtube';
        media_url: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        title: string;
        description?: string | null;
        button_text?: string | null;
        button_url?: string | null;
        media_type: 'image' | 'youtube';
        media_url: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        title?: string;
        description?: string | null;
        button_text?: string | null;
        button_url?: string | null;
        media_type?: 'image' | 'youtube';
        media_url?: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    };
    services: {
      Row: {
        id: string;
        title: string;
        description: string;
        icon: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        title: string;
        description: string;
        icon: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        title?: string;
        description?: string;
        icon?: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    };
    clients: {
      Row: {
        id: string;
        name: string;
        logo_url: string;
        website_url: string | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        name: string;
        logo_url: string;
        website_url?: string | null;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        name?: string;
        logo_url?: string;
        website_url?: string | null;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    };
    contact_submissions: {
      Row: {
        id: string;
        name: string;
        email: string;
        message: string;
        created_at: string;
      };
      Insert: {
        id?: string;
        name: string;
        email: string;
        message: string;
        created_at?: string;
      };
      Update: {
        id?: string;
        name?: string;
        email?: string;
        message?: string;
        created_at?: string;
      };
    };
    social_media: {
      Row: {
        id: string;
        type: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';
        url: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        type: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';
        url: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        type?: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';
        url?: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    };
  };
  Views: {
    [_ in never]: never;
  };
  Functions: {
    [_ in never]: never;
  };
  Enums: {
    [_ in never]: never;
  };
  CompositeTypes: {
    [_ in never]: never;
  };
};