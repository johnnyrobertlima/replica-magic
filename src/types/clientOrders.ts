
import type { DateRange } from "react-day-picker";
import type { SearchType } from "./searchTypes";

export interface ClientOrdersState {
  date: DateRange | undefined;
  searchDate: DateRange | undefined;
  searchQuery: string;
  searchType: SearchType;
  isSearching: boolean;
  expandedClients: Set<string>;
  showZeroBalance: boolean;
  showOnlyWithStock: boolean;
  selectedItems: string[];
  selectedItemsDetails: Record<string, any>;
  isSending: boolean;
}
