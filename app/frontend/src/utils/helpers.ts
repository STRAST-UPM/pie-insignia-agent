/**
 * Generates a unique ID
 */
export const generateId = (): string => Math.random().toString(36).substring(2, 11);

/**
 * Formats a date to a readable string
 */
export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
