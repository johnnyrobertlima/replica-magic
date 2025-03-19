
// Request status with corresponding badge colors
export const REQUEST_STATUS = {
  "Aberto": "default",
  "Em Análise": "secondary",
  "Em Andamento": "secondary",
  "Respondido": "outline",
  "Concluído": "default",
  "Cancelado": "destructive"
} as const;

// Define type for request status
export type RequestStatus = keyof typeof REQUEST_STATUS;

export interface Request {
  id: string;
  protocol: string;
  title: string;
  department: string;
  description: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_email: string;
  attachment_url?: string;
  response?: string;
}
