
export interface Banner {
  id: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string;
  youtube_url: string | null;
  is_active: boolean;
  duration: number;
}
