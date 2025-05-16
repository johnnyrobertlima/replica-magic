
export const validateImage = (file: File) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'image/x-icon', 
    'image/ico', 
    'image/svg+xml',
    'application/pdf', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WEBP, ICO, SVG, PDF, DOCX ou XLSX.');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.');
  }

  return true;
};

export const getStorageUrl = (path: string | null) => {
  if (!path) return '';
  
  // If it already has an http(s), return it as is
  if (path.startsWith('http')) return path;
  
  // Remove any leading slash if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Check which bucket the path belongs to
  let bucketName = 'oni-media'; // Default bucket
  
  // If path contains user id and protocol number format or if it's a direct explicit path to request_attachments
  if (cleanPath.includes('/BK-') || cleanPath.startsWith('request_attachments/')) {
    bucketName = 'request_attachments';
  }
  
  // Check if path is from the services directory
  if (cleanPath.includes('services/') || cleanPath.startsWith('services/')) {
    bucketName = 'oni-media';
  }
  
  // Check if path is from the icons directory
  if (cleanPath.includes('icons/') || cleanPath.startsWith('icons/')) {
    bucketName = 'oni-media';
  }
  
  // Verify if the path already contains the bucket name
  const bucketPath = cleanPath.startsWith(`${bucketName}/`) ? cleanPath : `${bucketName}/${cleanPath}`;
  
  console.log('Creating storage URL for path:', path);
  console.log('Final bucket path:', bucketPath);
  
  // Return the full Supabase storage URL
  return `https://mwvrxtvlqkttylfzzxas.supabase.co/storage/v1/object/public/${bucketPath}`;
};
