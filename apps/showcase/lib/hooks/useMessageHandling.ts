import { useState, useCallback, useEffect } from 'react';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
import { fetchMessageCount, fetchMessages, createMessage } from '~/lib/utils/createMessageUtil';
import { DEFAULT_METADATA } from '~/lib/enhanced-chat/types/superfeed';

interface UseMessageHandlingProps {
  username: string;
  formData: FormDataType;
  handleFormDataChange: (updates: Partial<FormDataType>) => void;
}

interface UseMessageHandlingReturn {
  messageCount: number;
  messages: FormDataType[];
  isSubmitting: boolean;
  error: Error | null;
  handleCreateItem: () => Promise<void>;
  handleEditMessage: (message: FormDataType) => void;
}

export const useMessageHandling = ({ username, formData, handleFormDataChange }: UseMessageHandlingProps): UseMessageHandlingReturn => {
  const [messageCount, setMessageCount] = useState<number>(0);
  const [messages, setMessages] = useState<FormDataType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleCreateItem = useCallback(async () => {
    try {
      if (!username) {
        throw new Error('No username found');
      }

      setIsSubmitting(true);
      setError(null);
      const data = await createMessage(formData, username);
      if (data) {
        const count = await fetchMessageCount(username);
        setMessageCount(count);
        handleFormDataChange({
          type: 'all',
          content: '',
          media: [],
          metadata: DEFAULT_METADATA,
          interactive_content: undefined
        } as FormDataType);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create message');
      setError(error);
      console.error('Error in handleCreateItem:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, username, handleFormDataChange]);

  const handleEditMessage = useCallback((message: FormDataType) => {
    try {
      // Update form data with the selected message
      const updatedFormData: FormDataType = {
        type: message.type || 'all',
        content: message.content || '',
        message: message.message || '',
        caption: message.caption || '',
        media: message.media || [],
        metadata: {
          ...DEFAULT_METADATA,
          ...message.metadata,
          displayMode: message.metadata?.displayMode ?? 'default',
          maxHeight: message.metadata?.maxHeight ?? 300,
          visibility: message.metadata?.visibility ?? DEFAULT_METADATA.visibility,
          requireAuth: message.metadata?.requireAuth ?? false,
          allowResubmit: message.metadata?.allowResubmit ?? false,
          timestamp: message.metadata?.timestamp ?? new Date().toISOString()
        },
        interactive_content: message.interactive_content,
        channel_username: username
      };

      handleFormDataChange(updatedFormData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to edit message');
      setError(error);
      console.error('Error in handleEditMessage:', error);
    }
  }, [username, handleFormDataChange]);

  // Fetch message count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        if (username) {
          const count = await fetchMessageCount(username);
          setMessageCount(count);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch message count');
        setError(error);
        console.error('Error fetching message count:', error);
      }
    };

    fetchCount();
  }, [username]);

  // Fetch messages
  useEffect(() => {
    const fetchMessagesList = async () => {
      try {
        if (username) {
          const messagesList = await fetchMessages(username);
          setMessages(messagesList);
          setMessageCount(messagesList.length);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch messages');
        setError(error);
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessagesList();
  }, [username]);

  return {
    messageCount,
    messages,
    isSubmitting,
    error,
    handleCreateItem,
    handleEditMessage
  };
}; 