
export interface Group {
  id: string;
  name: string;
  description?: string;
  homepage?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  group_id: string;
  resource_path: string;
  permission_type: 'read' | 'write' | 'admin';
  created_at: string;
  updated_at: string;
  group_name?: string; // Adding the group name for display
}

export interface PermissionFormData {
  resource_path: string;
  permission_type: 'read' | 'write' | 'admin';
}
