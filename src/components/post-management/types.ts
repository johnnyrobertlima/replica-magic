
export interface Post {
  id: string;
  created_time: string;
  post_impressions_organic: number;
  post_impressions_paid: number;
  views: number;
  canal: string;
  message: string;
  permalink_url: string;
  linked_post_id: string | null;
}
