
export interface Group {
  id: string;
  name: string;
  description: string | null;
  homepage: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupFormData {
  name: string;
  description: string;
  homepage: string;
}
