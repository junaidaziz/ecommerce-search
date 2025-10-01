import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ChatProvider, ChatContext } from '@contexts/ChatContext';
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react');

// Mock EventSource
global.EventSource = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  onmessage: null,
  onerror: null,
})) as any;

const mockedUseSession = useSession as jest.Mock;

const TestComponent = () => {
  const context = React.useContext(ChatContext);
  return <div data-testid="chat-context">{context.isOpen ? 'open' : 'closed'}</div>;
};

describe('ChatContext', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not connect to SSE when user is not authenticated', () => {
    mockedUseSession.mockReturnValue({ 
      data: null, 
      status: 'unauthenticated' 
    });

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // EventSource should not be instantiated
    expect(EventSource).not.toHaveBeenCalled();
  });

  it('does not connect to SSE while loading', () => {
    mockedUseSession.mockReturnValue({ 
      data: null, 
      status: 'loading' 
    });

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // EventSource should not be instantiated
    expect(EventSource).not.toHaveBeenCalled();
  });

  it('connects to SSE when user is authenticated', async () => {
    mockedUseSession.mockReturnValue({ 
      data: { user: { email: 'test@example.com' } }, 
      status: 'authenticated' 
    });

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // EventSource should be instantiated
    await waitFor(() => {
      expect(EventSource).toHaveBeenCalledWith('/api/chat/stream');
    });
  });
});
