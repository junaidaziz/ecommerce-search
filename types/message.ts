export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  orderId: number;
  messageType: 'text' | 'image' | 'file';
  content?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  createdAt: Date;
  seen: boolean;
}

// Message input for creating messages
export type MessageInput = Pick<
  Message,
  'senderId' | 'receiverId' | 'orderId' | 'messageType' | 'content' | 'fileUrl' | 'fileName'
>;

// Message update interface
export type MessageUpdate = Partial<Pick<Message, 'seen'>>;

// Message response interface
export type MessageResponse = Message;

// Message summary for lists
export type MessageSummary = Pick<
  Message,
  'id' | 'messageType' | 'content' | 'fileUrl' | 'fileName' | 'createdAt' | 'seen'
>;

// Message thread interface
export interface MessageThread {
  orderId: number;
  messages: Message[];
  participants: {
    sender: { id: number; name: string };
    receiver: { id: number; name: string };
  };
}
