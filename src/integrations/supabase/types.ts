import type { Database as PublicDatabase } from "./types/public";
import type { OniSiteSchema } from "./types/oni-site";

export interface Database extends PublicDatabase {
  oni_site: OniSiteSchema;
}

export type { OniSiteSchema };
export type { PublicSchema } from "./types/public";