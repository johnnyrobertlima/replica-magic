export interface Client {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  is_active: boolean;
}