
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
 * Funciona com versões desktop e web do Outlook
 * 
 * @param params Parâmetros do e-mail
 * @returns Promise que resolve quando o e-mail é aberto no Outlook
 */
export const sendOutlookEmail = async (params: OutlookEmailParams): Promise<void> => {
  const { subject, body, to = "", cc = "", bcc = "", clientName = "" } = params;
  
  // Log da tentativa de envio para debug
  console.log(`Iniciando tentativa de envio de e-mail para ${clientName}`);
  
  try {
    // Para o Outlook Web, vamos tentar abrir em uma nova aba
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
    
    // Registrar a URL para debug (truncada para evitar log muito grande)
    console.log(`Abrindo e-mail de cobrança para cliente: ${clientName}`);
    console.log(`URL mailto: ${mailtoUrl.substring(0, 100)}...`);
    
    // Tentar abrir no cliente de e-mail padrão (Outlook Web ou Desktop)
    // Usando window.open para garantir que abra em uma nova aba/janela
    const mailWindow = window.open(mailtoUrl, '_blank');
    
    // Se não conseguir abrir, tente o método tradicional
    if (!mailWindow) {
      console.log("Método window.open falhou, tentando location.href");
      window.location.href = mailtoUrl;
    }
    
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
  
  return true; // Simplificado para sempre permitir a tentativa
};
