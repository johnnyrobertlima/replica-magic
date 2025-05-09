
/**
 * Converts URLs in text to clickable links
 * @param text The text to process
 * @returns HTML string with URLs converted to <a> tags
 */
export function linkifyText(text: string): string {
  if (!text) return '';
  
  // Regular expression to identify URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Replace URLs with anchor tags
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`;
  });
}
