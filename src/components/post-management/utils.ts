
export const getChannelIcon = (channel: string) => {
  switch (channel?.toLowerCase()) {
    case 'facebook':
      return '📘';
    case 'instagram':
      return '📸';
    case 'ad':
      return '📢';
    default:
      return '📱';
  }
};
