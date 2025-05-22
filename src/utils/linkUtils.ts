
/**
 * Converte URLs em texto para links clicáveis
 * @param text O texto a ser processado
 * @returns String HTML com URLs convertidas para tags <a>
 */
export function linkifyText(text: string): string {
  if (!text) return '';
  
  // Expressão regular mais robusta para identificar URLs
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  
  // Substitui URLs por tags de âncora
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline break-words">${url}</a>`;
  });
}

/**
 * Formata um comentário de descrição com metadados
 * @param description O texto da descrição
 * @param author Nome do autor
 * @param date Data do comentário
 * @returns String formatada com autor, data e texto com links clicáveis
 */
export function formatDescriptionComment(
  description: string,
  author?: string,
  date?: Date
): string {
  // Formata a data se disponível, ou usa a data atual
  const formattedDate = date 
    ? new Date(date).toLocaleString('pt-BR', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('pt-BR', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  
  // Cria o cabeçalho do comentário
  const header = author 
    ? `[${author} em ${formattedDate}]:\n` 
    : `[${formattedDate}]:\n`;
  
  // Retorna o comentário formatado
  return `${header}${description || ''}`;
}

/**
 * Adiciona um novo comentário ao histórico de descrições preservando os anteriores
 * @param existingDescription Descrição existente contendo histórico
 * @param newComment Novo comentário a ser adicionado
 * @param author Nome do autor do novo comentário
 * @returns String atualizada com o histórico e o novo comentário
 */
export function appendToDescriptionHistory(
  existingDescription: string | null,
  newComment: string,
  author?: string
): string {
  // Se não houver comentário anterior ou for vazio
  if (!existingDescription || existingDescription.trim() === '') {
    return formatDescriptionComment(newComment, author, new Date());
  }
  
  // Adiciona o novo comentário preservando o histórico
  const formattedNewComment = formatDescriptionComment(newComment, author, new Date());
  return `${existingDescription.trim()}\n\n${formattedNewComment}`;
}
