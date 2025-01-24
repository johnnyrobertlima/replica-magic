export const validateImage = (file: File) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/x-icon', 'image/ico'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WEBP ou ICO.');
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
  
  // Verifica se o path já contém o nome do bucket
  const bucketPath = cleanPath.startsWith('oni-media/') ? cleanPath : `oni-media/${cleanPath}`;
  
  return `https://mwvrxtvlqkttylfzzxas.supabase.co/storage/v1/object/public/${bucketPath}`;
};