
export interface SubTheme {
  id: string;
  name: string;
  symbol?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Theme {
  id: string;
  name: string;
  symbol?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EditorialLine {
  id: string;
  name: string;
  symbol?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  symbol?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Status {
  id: string;
  name: string;
  color?: string;
  previous_status_id?: string | null;
  next_status_id?: string | null;
  created_at?: string;
  updated_at?: string;
}
