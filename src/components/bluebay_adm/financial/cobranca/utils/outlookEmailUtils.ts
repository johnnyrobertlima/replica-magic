
/**
 * Utilitário para integração com clientes de e-mail (Outlook Web, Gmail, etc.)
 * Permite abrir o cliente de e-mail com um novo e-mail pré-preenchido
 */

interface OutlookEmailParams {
  subject: string;
  body: string;
  to?: string;
  cc?: string;
  bcc?: string;
  clientName?: string;
}

/**
 * Abre um cliente de e-mail utilizando o protocolo mailto
 * Funciona com vários clientes de e-mail, incluindo Outlook Web e Gmail
 * 
 * @param params Parâmetros do e-mail
 * @returns Promise que resolve quando o e-mail é aberto
 */
export const sendOutlookEmail = async (params: OutlookEmailParams): Promise<void> => {
  const { subject, body, to = "", cc = "", bcc = "", clientName = "" } = params;
  
  // Log da tentativa de envio para debug
  console.log(`Iniciando tentativa de envio de e-mail para ${clientName}`);
  
  try {
    // Formatamos o corpo do e-mail para mailto (RFC 6068)
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body.replace(/<br\s*\/?>/gi, "\n"));
    
    // Construir os parâmetros completos
    let mailtoParams = `subject=${encodedSubject}&body=${encodedBody}`;
    if (to) mailtoParams += `&to=${encodeURIComponent(to)}`;
    if (cc) mailtoParams += `&cc=${encodeURIComponent(cc)}`;
    if (bcc) mailtoParams += `&bcc=${encodeURIComponent(bcc)}`;
    
    // Construir a URL mailto
    const mailtoUrl = `mailto:?${mailtoParams}`;
    
    // Log para debug (truncado)
    console.log(`Abrindo e-mail de cobrança para cliente: ${clientName}`);
    console.log(`URL mailto: ${mailtoUrl.substring(0, 100)}...`);
    
    // Método 1: Usar window.location.href (mais compatível com Outlook Web)
    window.location.href = mailtoUrl;
    
    // Método 2 (fallback): Se o método 1 não funcionar bem em alguns navegadores
    // Este segundo método fica comentado como alternativa futura se necessário
    /*
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.setAttribute('target', '_self');
      link.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100);
    */
    
    // Aguardar um curto período
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return Promise.resolve();
  } catch (error) {
    console.error("Erro ao abrir o cliente de e-mail:", error);
    return Promise.reject(new Error("Não foi possível abrir o cliente de e-mail"));
  }
};

/**
 * Verifica se o cliente de e-mail está disponível
 * Nota: Esta função é limitada devido a restrições de segurança do navegador
 * 
 * @returns Promise com boolean indicando se o cliente de e-mail está disponível
 */
export const isOutlookAvailable = async (): Promise<boolean> => {
  // Devido às restrições de segurança do navegador, não é possível
  // detectar com precisão se o Outlook está instalado.
  // A melhor abordagem é tentar abrir o mailto e observar o comportamento.
  
  return true; // Simplificado para sempre permitir a tentativa
};
