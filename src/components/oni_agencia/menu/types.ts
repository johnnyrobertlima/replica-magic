
import { ReactNode } from "react";

export interface MenuItemType {
  title: string;
  href: string;
  icon?: ReactNode;
  name?: string;
  path?: string;
}
