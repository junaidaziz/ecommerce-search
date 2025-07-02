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
