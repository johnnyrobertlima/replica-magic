
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
        // Add try-catch to handle potential cross-origin errors
        try {
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
              send_page_view: false,
              cookie_domain: 'none',
              cookie_flags: 'SameSite=None;Secure'
            });
          `;
          document.head.appendChild(script2);
        } catch (innerError) {
          console.warn("Failed to initialize Google Analytics scripts:", innerError);
        }
      }
    } catch (error) {
      console.warn("Error initializing Google Analytics:", error);
    }

    return () => {
      // Don't remove scripts on unmount to prevent reinitializing
    };
  }, []);

  useEffect(() => {
    try {
      // Make sure gtag is available before using it and wrap in try-catch
      if (window.gtag) {
        try {
          window.gtag("event", "page_view", {
            page_path: location.pathname,
            page_title: document.title,
          });
        } catch (innerError) {
          console.warn("Failed to send page view to Google Analytics:", innerError);
        }
      }
    } catch (error) {
      console.warn("Error sending page view to Google Analytics:", error);
    }
  }, [location]);

  return null;
};
