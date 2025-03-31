
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
 * Implementação mais confiável que o protocolo mailto
 * 
 * @param params Parâmetros do e-mail
 * @returns Promise que resolve quando o e-mail é aberto
 */
export const sendOutlookEmail = async (params: OutlookEmailParams): Promise<void> => {
  const { subject, body, to = "", cc = "", bcc = "", clientName = "" } = params;
  
  // Log da tentativa de envio para debug
  console.log(`Iniciando tentativa de envio de e-mail para ${clientName}`);
  
  try {
    // Formatar o corpo do e-mail para texto plano
    const plainTextBody = body.replace(/<br\s*\/?>/gi, "\n");
    
    // Construir a URL do Outlook Web
    let outlookUrl = "https://outlook.office.com/mail/deeplink/compose";
    
    // Adicionar parâmetros
    const urlParams = new URLSearchParams();
    if (to) urlParams.append("to", to);
    urlParams.append("subject", subject);
    urlParams.append("body", plainTextBody);
    if (cc) urlParams.append("cc", cc);
    if (bcc) urlParams.append("bcc", bcc);
    
    // Adicionar os parâmetros à URL
    outlookUrl += `?${urlParams.toString()}`;
    
    // Log para debug
    console.log(`Abrindo Outlook Web para cliente: ${clientName}`);
    console.log(`URL Outlook: ${outlookUrl.substring(0, 100)}...`);
    
    // Abrir o Outlook Web em uma nova aba
    window.open(outlookUrl, "_blank");
    
    // Se não conseguiu abrir, tentar método alternativo
    setTimeout(() => {
      if (!document.hasFocus()) {
        console.log("Abriu com sucesso em nova aba");
      } else {
        console.log("Tentando método alternativo");
        window.location.href = outlookUrl;
      }
    }, 500);
    
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
