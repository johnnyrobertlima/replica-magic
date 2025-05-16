
import { useFavicon } from "@/hooks/useFavicon";

export const FaviconUpdater = () => {
  // This component just triggers the favicon hook and doesn't render anything
  useFavicon();
  return null;
};
