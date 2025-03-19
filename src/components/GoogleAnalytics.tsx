
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    try {
      // Only load the script once
      if (!document.getElementById("google-analytics-script")) {
        const script1 = document.createElement("script");
        script1.async = true;
        script1.id = "google-analytics-script";
        script1.src = "https://www.googletagmanager.com/gtag/js?id=G-9X4YP40YBJ";
        document.head.appendChild(script1);

        const script2 = document.createElement("script");
        script2.id = "google-analytics-config";
        script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9X4YP40YBJ', {
            send_page_view: false
          });
        `;
        document.head.appendChild(script2);
      }
    } catch (error) {
      console.error("Error initializing Google Analytics:", error);
    }

    return () => {
      // Don't remove scripts on unmount to prevent reinitializing
    };
  }, []);

  useEffect(() => {
    try {
      // Make sure gtag is available before using it
      if (window.gtag) {
        window.gtag("event", "page_view", {
          page_path: location.pathname,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    } catch (error) {
      console.error("Error sending page view to Google Analytics:", error);
    }
  }, [location]);

  return null;
};
