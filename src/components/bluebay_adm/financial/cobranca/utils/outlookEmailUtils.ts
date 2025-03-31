
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
 * Abre o Outlook Web com um e-mail pré-preenchido
 * Usando uma abordagem direta que funciona melhor com Outlook Web
 * 
 * @param params Parâmetros do e-mail
 * @returns Promise que resolve quando o e-mail é aberto
 */
export const sendOutlookEmail = async (params: OutlookEmailParams): Promise<void> => {
  const { subject, body, to = "", cc = "", bcc = "", clientName = "" } = params;
  
  // Log da tentativa de envio para debug
  console.log(`Iniciando tentativa de envio de e-mail para ${clientName}`);
  
  try {
    // Formatar o corpo do e-mail para texto plano e substituir quebras de linha HTML por \n
    const plainTextBody = body.replace(/<br\s*\/?>/gi, "\n");
    
    // Construir a URL do Outlook Web com formato correto
    const outlookUrl = "https://outlook.office.com/mail/deeplink/compose";
    
    // Codificar parâmetros corretamente para evitar problemas de formatação
    const urlParams = new URLSearchParams();
    if (to) urlParams.append("to", to);
    urlParams.append("subject", subject);
    urlParams.append("body", plainTextBody);
    if (cc) urlParams.append("cc", cc);
    if (bcc) urlParams.append("bcc", bcc);
    
    // Construir a URL final
    const finalUrl = `${outlookUrl}?${urlParams.toString()}`;
    
    // Log para debug
    console.log(`Abrindo e-mail de cobrança para cliente: ${clientName}`);
    console.log(`URL Outlook: ${finalUrl.substring(0, 100)}...`);
    
    // Abrir o Outlook Web em uma nova aba com método que preserva formatação
    window.open(finalUrl, "_blank");
    
    return Promise.resolve();
  } catch (error) {
    console.error("Erro ao abrir o Outlook Web:", error);
    return Promise.reject(new Error("Não foi possível abrir o Outlook Web"));
  }
};

/**
 * Versão alternativa que usa o protocolo mailto como fallback
 * 
 * @param params Parâmetros do e-mail
 * @returns Promise que resolve quando o e-mail é aberto
 */
export const sendMailtoEmail = async (params: OutlookEmailParams): Promise<void> => {
  const { subject, body, to = "", cc = "", bcc = "" } = params;
  
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
    
    // Usar o método de abertura direto
    window.location.href = mailtoUrl;
    
    return Promise.resolve();
  } catch (error) {
    console.error("Erro ao abrir o cliente de e-mail:", error);
    return Promise.reject(new Error("Não foi possível abrir o cliente de e-mail"));
  }
};

/**
 * Cria um botão direto de envio por e-mail que pode ser utilizado em qualquer local
 * 
 * @param email Email de destino
 * @param subject Assunto do e-mail
 * @param body Corpo do e-mail
 * @returns Função que abre o e-mail ao ser executada
 */
export const createDirectEmailButton = (to: string, subject: string, body: string) => {
  return () => {
    const url = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
  };
};
