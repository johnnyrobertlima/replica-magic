
export function linkifyText(text: string | null): string {
  if (!text) return "";
  
  // Regex para encontrar URLs no texto
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Substitui URLs por links clicáveis
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>');
}
