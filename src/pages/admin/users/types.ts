
export interface User {
  id: string;
  email: string;
}

export interface UserGroupAssignment {
  id: string;
  user_id: string;
  group_id: string;
  user_email?: string;
}
