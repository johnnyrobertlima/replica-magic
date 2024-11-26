import type { OniSiteSchema } from "./types/oni-site";
import type { PublicSchema } from "./types/public";

export type Database = {
  public: PublicSchema;
  oni_site: OniSiteSchema;
};

export type { PublicSchema, OniSiteSchema };