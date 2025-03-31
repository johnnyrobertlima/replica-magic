
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
    // Construir a URL do Outlook Web com formato correto
    const outlookUrl = "https://outlook.office.com/mail/deeplink/compose";
    
    // Preservar a formatação do corpo com quebras de linha
    // Não aplicamos nenhuma codificação aqui, apenas convertemos <br> HTML para \n se existirem
    const plainTextBody = body.replace(/<br\s*\/?>/gi, "\n");
    
    // Construir a URL com parâmetros corretamente encodados
    // Importante: Aplicamos encodeURIComponent apenas na construção da URL final
    const url = `${outlookUrl}?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
    
    // Adicionar cc e bcc se fornecidos
    const finalUrl = cc ? `${url}&cc=${encodeURIComponent(cc)}` : url;
    const urlWithBcc = bcc ? `${finalUrl}&bcc=${encodeURIComponent(bcc)}` : finalUrl;
    
    // Log para debug
    console.log(`Abrindo e-mail de cobrança para cliente: ${clientName}`);
    console.log(`URL Outlook: ${urlWithBcc.substring(0, 100)}...`);
    
    // Abrir o Outlook Web em uma nova aba
    window.open(urlWithBcc, "_blank");
    
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
    const plainTextBody = body.replace(/<br\s*\/?>/gi, "\n");
    
    // Construir a URL mailto com encodings corretos
    let mailtoUrl = "mailto:?";
    
    if (to) mailtoUrl += `to=${encodeURIComponent(to)}&`;
    mailtoUrl += `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainTextBody)}`;
    if (cc) mailtoUrl += `&cc=${encodeURIComponent(cc)}`;
    if (bcc) mailtoUrl += `&bcc=${encodeURIComponent(bcc)}`;
    
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
    // Preserve texto original e apenas encode para a URL no final
    const outlookUrl = "https://outlook.office.com/mail/deeplink/compose";
    const url = `${outlookUrl}?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
  };
};
