import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
import { FEED_CONSTANTS } from '~/lib/enhanced-chat/constants/feed';
import { User } from '@supabase/supabase-js';
import { supabase } from '~/lib/supabase';

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

interface UseValidationProps {
  formData: FormDataType;
  user: User | null;
}

export function useValidation({ formData, user }: UseValidationProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateFormData = useCallback(async () => {
    try {
      setIsValidating(true);
      setValidationErrors([]);
      const errors: string[] = [];

      // Basic validations
      if (!formData.content.trim() && !formData.media.length) {
        errors.push('Please add some content or media');
      }

      // Check for existing response if it's a quiz or poll
      if (formData.type === 'quiz' || formData.type === 'poll') {
        const { data: existingResponse, error: responseError } = await supabase
          .from('superfeed_responses')
          .select('id')
          .match({
            feed_item_id: formData.id,
            user_id: user?.id
          })
          .maybeSingle();

        if (responseError) {
          console.error('Error checking for existing response:', responseError);
          errors.push('Failed to validate response');
        }

        if (existingResponse) {
          errors.push('You have already submitted a response for this item');
        }
      }

      // Media validations - only for non-interactive types
      if (!['poll', 'quiz', 'survey'].includes(formData.type)) {
        const mediaItems = formData.media.filter(m => m.url.trim());
        if (mediaItems.length > FEED_CONSTANTS.MAX_MEDIA_COUNT) {
          errors.push(`Maximum ${FEED_CONSTANTS.MAX_MEDIA_COUNT} media items allowed`);
        }

        // Validate each media URL
        for (const media of mediaItems) {
          if (!isValidUrl(media.url)) {
            errors.push('Please enter valid media URLs');
            break;
          }
        }
      }

      // Poll validations
      if (formData.type === 'poll') {
        if (!formData.poll.question.trim()) {
          errors.push('Please enter a poll question');
        }
        const validOptions = formData.poll.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          errors.push('Please add at least 2 poll options');
        }
      }

      // Quiz validations
      if (formData.type === 'quiz') {
        if (!formData.quiz.title.trim()) {
          errors.push('Please enter a quiz title');
        }
        if (!formData.quiz.questions.length) {
          errors.push('Please add at least one question');
        }
        for (const q of formData.quiz.questions) {
          if (!q.text.trim()) {
            errors.push('Please fill in all question texts');
            break;
          }
          const validOptions = q.options.filter(opt => opt.trim());
          if (validOptions.length < 2) {
            errors.push('Each question must have at least 2 options');
            break;
          }
          if (!q.timeLimit || q.timeLimit < FEED_CONSTANTS.MIN_QUIZ_TIME_LIMIT || q.timeLimit > FEED_CONSTANTS.MAX_QUIZ_TIME_LIMIT) {
            errors.push(`Time limit must be between ${FEED_CONSTANTS.MIN_QUIZ_TIME_LIMIT} and ${FEED_CONSTANTS.MAX_QUIZ_TIME_LIMIT} seconds`);
            break;
          }
          if (!q.points || q.points < FEED_CONSTANTS.MIN_QUIZ_POINTS || q.points > FEED_CONSTANTS.MAX_QUIZ_POINTS) {
            errors.push(`Points must be between ${FEED_CONSTANTS.MIN_QUIZ_POINTS} and ${FEED_CONSTANTS.MAX_QUIZ_POINTS}`);
            break;
          }
        }
      }

      // Survey validations
      if (formData.type === 'survey') {
        if (!formData.survey.title.trim()) {
          errors.push('Please enter a survey title');
        }
        if (!formData.survey.questions.length) {
          errors.push('Please add at least one question');
        }
        for (const q of formData.survey.questions) {
          if (!q.text.trim()) {
            errors.push('Please fill in all question texts');
            break;
          }
          if (q.type !== 'text' && (!q.options.length || !q.options[0].trim())) {
            errors.push('Please add options for multiple choice questions');
            break;
          }
        }
      }

      setValidationErrors(errors);

      if (errors.length > 0) {
        Alert.alert('Validation Error', errors[0]);
        return false;
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Validation Error', error.message);
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [formData, user?.id]);

  return {
    isValidating,
    validationErrors,
    validateFormData,
  };
} 