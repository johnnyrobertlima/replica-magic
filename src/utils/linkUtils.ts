
/**
 * Converts URLs in text to clickable HTML links with target="_blank" for safe external navigation
 * @param text The text content that may contain URLs
 * @returns Text with URLs converted to HTML links
 */
export const linkifyText = (text: string): string => {
  if (!text) return "";
  
  // This regex pattern matches URLs starting with http:// or https://
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  
  // Replace URLs with HTML links
  return text.replace(urlPattern, (url) => {
    // Clean the URL if it ends with punctuation
    let cleanUrl = url;
    if (['.', ',', ':', ';', ')', ']', '}'].includes(cleanUrl.slice(-1))) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${cleanUrl}</a>`;
  });
};

/**
 * Checks if the given text contains any URLs
 * @param text Text to check for URLs
 * @returns Boolean indicating if the text contains URLs
 */
export const containsUrls = (text: string): boolean => {
  if (!text) return false;
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return urlPattern.test(text);
};
