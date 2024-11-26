export type Banner = {
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

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SocialMediaType = 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';

export type SocialMedia = {
  id: string;
  type: SocialMediaType;
  url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};