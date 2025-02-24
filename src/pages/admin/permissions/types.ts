
export interface Group {
  id: string;
  name: string;
}

export interface Permission {
  id: string;
  group_id: string;
  resource_path: string;
  permission_type: 'read' | 'write' | 'admin';
  created_at: string;
  updated_at: string;
  group_name?: string; // Adicionando o nome do grupo
}

export interface PermissionFormData {
  resource_path: string;
  permission_type: 'read' | 'write' | 'admin';
}
