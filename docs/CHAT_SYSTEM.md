# Custom Chat System

This is a comprehensive real-time chat system with file/image upload capabilities.

## Features

### ✅ Real-Time Messaging
- Server-Sent Events (SSE) for instant message delivery
- Messages appear without page refresh
- Automatic reconnection on connection loss
- Heartbeat to keep connection alive

### ✅ Typing Indicator
- Shows when support is typing
- Animated dots indicator
- Automatic detection based on input

### ✅ File & Image Upload
- Support for images (JPEG, PNG, GIF, WebP)
- Support for documents (PDF, TXT, DOCX)
- Upload to AWS S3 with signed URLs
- Visual progress indicator during upload
- Preview for images before sending
- File size limit: 5MB

### ✅ Chat UI Components
- **ChatWindow**: Main container with floating button
- **MessageList**: Scrollable message history
- **MessageBubble**: Distinct styles for user vs support messages
- **ChatInput**: Text input with file upload button

### ✅ Persistence
- Messages stored in database (PostgreSQL via Prisma)
- Chat sessions linked to user accounts
- History loads when reopening chat
- Support for guest users (session-based)

### ✅ Theme Support
- Full light/dark mode support
- Uses DaisyUI base classes for automatic theme adaptation
- Consistent styling across themes

### ✅ Mobile Responsiveness
- Responsive widths (w-72 on mobile, w-80 on sm, w-96 on md+)
- Touch-friendly buttons and inputs
- Floating chat button on all screen sizes
- Proper z-index for overlay

## Database Schema

Two new models were added to support the chat system:

### ChatSession
```prisma
model ChatSession {
  id        Int      @id @default(autoincrement())
  uuid      String   @unique @default(uuid())
  userId    Int?
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user         User?         @relation(fields: [userId], references: [id])
  chatMessages ChatMessage[]
}
```

### ChatMessage
```prisma
model ChatMessage {
  id          Int      @id @default(autoincrement())
  sessionId   Int
  sender      String   @default("user")
  messageType String   @default("text")
  content     String?
  fileUrl     String?
  fileName    String?
  createdAt   DateTime @default(now())
  seen        Boolean  @default(false)

  session ChatSession @relation(fields: [sessionId], references: [id])

  @@index([sessionId])
}
```

## API Endpoints

### GET /api/chat/history
Retrieves chat history for the current user's session.

**Response:**
```json
{
  "sessionId": 123,
  "messages": [
    {
      "id": 1,
      "sender": "user",
      "messageType": "text",
      "content": "Hello!",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### POST /api/chat/send
Sends a new chat message.

**Request Body:**
```json
{
  "content": "Hello!",
  "messageType": "text",
  "fileUrl": "https://...",
  "fileName": "image.jpg"
}
```

### POST /api/chat/upload
Uploads a file or image to S3.

**Request:** multipart/form-data with `file` field

**Response:**
```json
{
  "url": "https://bucket.s3.region.amazonaws.com/path/to/file"
}
```

### GET /api/chat/stream
Server-Sent Events endpoint for real-time message delivery.

## Component Usage

### Basic Usage

The ChatWindow component is automatically included in the app layout through the ChatProvider context.

```tsx
import { ChatProvider } from '@contexts/ChatContext';

function App({ children }) {
  return (
    <ChatProvider>
      {children}
      <ChatWindow />
    </ChatProvider>
  );
}
```

### Programmatic Control

You can open the chat programmatically with context:

```tsx
import { useContext } from 'react';
import { ChatContext } from '@contexts/ChatContext';

function MyComponent() {
  const { openChat } = useContext(ChatContext);

  const handleContactSupport = () => {
    openChat({
      orderId: '12345',
      customerName: 'John Doe'
    });
  };

  return (
    <button onClick={handleContactSupport}>
      Contact Support
    </button>
  );
}
```

## Styling

All components use theme-aware classes:

- `base-100`, `base-200`, `base-300`: Background colors that adapt to theme
- `base-content`: Text color that adapts to theme
- `primary`: Primary brand color
- `danger`: Error/delete color

## Future Enhancements

Potential improvements for the chat system:

1. **WebSocket Support**: Replace SSE with WebSocket for bidirectional communication
2. **Admin Panel**: Support staff interface to manage chats
3. **Chat Assignment**: Assign chats to specific support agents
4. **Rich Text**: Support for formatted text, emojis, etc.
5. **Read Receipts**: Show when messages have been seen
6. **Audio Messages**: Support for voice notes
7. **Chat History Export**: Export chat transcripts
8. **Multi-language Support**: i18n for chat interface
9. **Push Notifications**: Browser notifications for new messages
10. **Chat Analytics**: Track response times, satisfaction, etc.

## Migration

To apply the database schema changes:

```bash
npx prisma migrate dev --name add_chat_system
```

## Environment Variables

The chat system uses existing S3 configuration:

```env
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Testing

To test the chat system:

1. Open the application in a browser
2. Click the floating chat button in the bottom-right corner
3. Type a message and press Enter or click Send
4. Try uploading an image by clicking the paperclip icon
5. Verify that support responds automatically
6. Close and reopen the chat to verify history loads
7. Test in both light and dark modes

## Support

For issues or questions about the chat system, please open an issue in the repository.
