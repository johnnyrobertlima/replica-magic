
export const validateImage = (file: File) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/x-icon', 'image/ico', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WEBP, ICO, PDF, DOCX ou XLSX.');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.');
  }

  return true;
};

export const getStorageUrl = (path: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Remove qualquer barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Check which bucket the path belongs to
  let bucketName = 'oni-media'; // Default bucket
  
  // If path contains user id and protocol number format or if it's a direct explicit path to request_attachments
  if (cleanPath.includes('/BK-') || cleanPath.startsWith('request_attachments/')) {
    bucketName = 'request_attachments';
  }
  
  // Verifica se o path já contém o nome do bucket
  const bucketPath = cleanPath.startsWith(`${bucketName}/`) ? cleanPath : `${bucketName}/${cleanPath}`;
  
  return `https://mwvrxtvlqkttylfzzxas.supabase.co/storage/v1/object/public/${bucketPath}`;
};
