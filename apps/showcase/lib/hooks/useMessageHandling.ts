import { useState, useCallback, useEffect } from 'react';
import { FormDataType, InteractiveContent, Metadata } from '~/lib/enhanced-chat/types/superfeed';
import { createMessage, fetchMessageCount } from '~/lib/utils/createMessageUtil';
import { DEFAULT_METADATA } from '~/lib/enhanced-chat/types/superfeed';
import { fetchFeedItems } from '../utils/feedData';

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
  handleCreateItem: (messageToCreate?: FormDataType) => Promise<void>;
  handleEditMessage: (message: FormDataType) => void;
}

export const useMessageHandling = ({ username, formData, handleFormDataChange }: UseMessageHandlingProps): UseMessageHandlingReturn => {
  const [messageCount, setMessageCount] = useState<number>(0);
  const [messages, setMessages] = useState<FormDataType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleCreateItem = useCallback(async (messageToCreate?: FormDataType) => {
    try {
      if (!username) {
        throw new Error('No username found');
      }

      setIsSubmitting(true);
      setError(null);

      const messageData = messageToCreate || formData;

      // Log the form data before submission
      console.log('Creating message with data:', {
        type: messageData.type,
        content: messageData.content,
        interactive_content: messageData.interactive_content,
        media: messageData.media
      });

      const data = await createMessage(messageData, username);
      if (data) {
        // Fetch updated message count
        const count = await fetchMessageCount(username);
        setMessageCount(count);

        // Fetch updated messages
        const updatedMessages = await fetchFeedItems(username);
        setMessages(updatedMessages);

        // Only reset form if we're not bulk creating
        if (!messageToCreate) {
          // Reset form but preserve interactive content type
          handleFormDataChange({
            type: messageData.type || 'all',
            content: '',
            media: [],
            metadata: DEFAULT_METADATA,
            interactive_content: messageData.interactive_content ? {
              [messageData.type as keyof InteractiveContent]: messageData.interactive_content[messageData.type as keyof InteractiveContent]
            } : undefined
          } as FormDataType);
        }
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
    handleFormDataChange(message);
  }, [handleFormDataChange]);

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
          const messagesList = await fetchFeedItems(username);
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