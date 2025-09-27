export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  }
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  }
  if (diffInHours < 168) {
    // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`;
  }
  return date.toLocaleDateString();
};
