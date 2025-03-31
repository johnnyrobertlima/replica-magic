
/**
 * Utilitário para integração com o Microsoft Outlook
 * Permite abrir o Outlook com um novo e-mail pré-preenchido
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
 * Envia um e-mail utilizando o protocolo mailto para abrir o Outlook
 * 
 * @param params Parâmetros do e-mail
 * @returns Promise que resolve quando o e-mail é aberto no Outlook
 */
export const sendOutlookEmail = async (params: OutlookEmailParams): Promise<void> => {
  const { subject, body, to = "", cc = "", bcc = "", clientName = "" } = params;
  
  // Preparar os parâmetros do mailto (RFC 6068)
  const mailtoParams = new URLSearchParams();
  
  if (to) mailtoParams.append("to", to);
  if (cc) mailtoParams.append("cc", cc);
  if (bcc) mailtoParams.append("bcc", bcc);
  
  mailtoParams.append("subject", subject);
  
  // Converter quebras de linha HTML para o formato mailto
  const formattedBody = body
    .replace(/<br\s*\/?>/gi, "%0D%0A")
    .replace(/&nbsp;/g, " ");
  
  mailtoParams.append("body", formattedBody);
  
  // Construir a URL mailto
  const mailtoUrl = `mailto:?${mailtoParams.toString()}`;
  
  // Registrar interação para análise
  console.log(`Abrindo e-mail de cobrança para cliente: ${clientName}`);
  console.log(`URL mailto: ${mailtoUrl.substring(0, 100)}...`);
  
  try {
    // Abrir o cliente de e-mail padrão (Outlook)
    window.location.href = mailtoUrl;
    
    // Aguardar um curto período para garantir que o cliente de e-mail seja aberto
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return Promise.resolve();
  } catch (error) {
    console.error("Erro ao abrir o cliente de e-mail:", error);
    return Promise.reject(new Error("Não foi possível abrir o cliente de e-mail"));
  }
};

/**
 * Verifica se o Outlook está disponível no sistema
 * Nota: Esta função é limitada devido a restrições de segurança do navegador
 * 
 * @returns Promise com boolean indicando se o Outlook está disponível
 */
export const isOutlookAvailable = async (): Promise<boolean> => {
  // Devido às restrições de segurança do navegador, não é possível
  // detectar com precisão se o Outlook está instalado.
  // A melhor abordagem é tentar abrir o mailto e observar o comportamento.
  
  try {
    // Verificar se o navegador suporta o protocolo mailto
    return navigator.userAgent.includes("Windows") || 
           navigator.userAgent.includes("Macintosh");
  } catch (error) {
    console.error("Erro ao verificar disponibilidade do Outlook:", error);
    return false;
  }
};
