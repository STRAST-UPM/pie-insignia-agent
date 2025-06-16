export type MessageType = 'user' | 'assistant';

export interface Attachment {
  name: string;
  url: string; // This will be a temporary object URL for frontend display
  type: string;
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  attachments?: Attachment[]; // Replaces imageUrl
}
