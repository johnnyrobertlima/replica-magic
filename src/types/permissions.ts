
export type PermissionType = 'read' | 'write' | 'admin';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserGroup {
  id: string;
  user_id: string;
  group_id: string;
  created_at: string;
}

export interface GroupPermission {
  id: string;
  group_id: string;
  resource_path: string;
  permission_type: PermissionType;
  created_at: string;
  updated_at: string;
}
