
/**
 * Função para formatar o telefone no padrão XX XXXXX-XXXX
 */
export const formatPhoneNumber = (value: string) => {
  // Remove tudo que não for dígito
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a formatação
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
  } else {
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};
