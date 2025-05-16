
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { getStorageUrl } from "@/utils/imageUtils";

export const useFavicon = () => {
  const { data: favicon } = useQuery({
    queryKey: ["favicon"],
    queryFn: async () => {
      // Try to find favicon.ico or favicon.png in the icons folder
      const { data: icons, error } = await supabase
        .storage
        .from("oni-media")
        .list("icons", {
          search: "favicon"
        });
      
      if (error) {
        console.error("Error fetching favicon:", error);
        return null;
      }
      
      // Look for favicon.ico first, then favicon.png
      const faviconIco = icons?.find(icon => icon.name === "favicon.ico");
      const faviconPng = icons?.find(icon => icon.name === "favicon.png");
      
      // Return the first matching favicon or null if not found
      return faviconIco || faviconPng || null;
    },
  });

  useEffect(() => {
    if (favicon) {
      const faviconPath = `icons/${favicon.name}`;
      const faviconUrl = getStorageUrl(faviconPath);
      
      // Find the existing favicon link element or create a new one
      let link = document.getElementById("favicon") as HTMLLinkElement;
      
      if (link) {
        // Update the existing favicon link
        link.href = faviconUrl;
      } else {
        console.warn("Favicon element with id 'favicon' not found");
      }
      
      console.log("Setting favicon to:", faviconUrl);
    }
  }, [favicon]);

  return favicon;
};
