import { Database, Json, PublicFunctions, PublicEnums } from './base';
import { PublicTables } from './public';
import { SiteOniTables } from './site-oni';

export type { Database, Json, PublicFunctions, PublicEnums, PublicTables, SiteOniTables };

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];