
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
    
    // Usar o método de abertura que funciona em mais navegadores
    // Tentamos diferentes métodos em sequência
    
    // Método 1: Usar link programático com _blank
    const mailLink = document.createElement('a');
    mailLink.href = mailtoUrl;
    mailLink.target = '_blank'; // Tentar abrir em nova aba (pode ser bloqueado)
    mailLink.rel = 'noopener noreferrer';
    mailLink.style.display = 'none';
    document.body.appendChild(mailLink);
    mailLink.click();
    document.body.removeChild(mailLink);
    
    // Aguardar um curto período para ver se o cliente foi aberto
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Método 2: Tentar window.open como alternativa
    window.open(mailtoUrl, '_self');
    
    // Método 3 (último recurso): window.location.href (funciona melhor em alguns casos)
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 100);
    
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
