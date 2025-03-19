
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

// Define departments options
export const DEPARTMENTS = [
  "Showroom", 
  "Pedidos", 
  "Contas a Pagar", 
  "Contas a Receber", 
  "BK", 
  "Cariacica", 
  "Santa Catarina", 
  "RH", 
  "Fiscal", 
  "Desenvolvimento", 
  "Diretoria", 
  "Representantes", 
  "TI"
];

export interface Request {
  id: string;
  protocol: string;
  title: string;
  department: string;
  description: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  attachment_url?: string;
  response?: string;
}
