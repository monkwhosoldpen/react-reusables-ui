import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { FormDataType, InteractiveContent, PollData, QuizData, SurveyData } from '~/lib/enhanced-chat/types/superfeed';
import { useInteractiveContent } from '~/lib/enhanced-chat/hooks/useInteractiveContent';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from '~/lib/core/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/core/providers/theme/DesignSystemProvider';
import { calculateMaxHeight } from '~/lib/enhanced-chat/utils/heightCalculations';

interface FeedItemProps {
  data: FormDataType;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function FeedItem({ data, showHeader = true, showFooter = true }: FeedItemProps) {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isCollapsed, setIsCollapsed] = useState(data.metadata?.isCollapsible ?? true);
  const maxHeight = calculateMaxHeight(data);
  
  const {
    isLoading: interactiveLoading,
    error,
    userResponse,
    submitResponse,
    isAuthenticated,
  } = useInteractiveContent(data);
  
  const [selectedPollOptions, setSelectedPollOptions] = React.useState<number[]>([]);
  const [quizAnswers, setQuizAnswers] = React.useState<Record<number, number>>({});
  const [surveyAnswers, setSurveyAnswers] = React.useState<Record<number, number>>({});
  const [showResults, setShowResults] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  useEffect(() => {
    setIsCollapsed(data.metadata?.isCollapsible ?? true);
  }, [data.metadata?.isCollapsible]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleAuthRequired = React.useCallback(() => {
    // Implementation would depend on authentication flow
  }, []);

  const handlePollSubmit = async () => {
    if (!isAuthenticated && data.metadata?.requireAuth) {
      handleAuthRequired();
      return;
    }
    
    try {
      setIsSubmitting(true);
      await submitResponse({ 
        type: 'poll',
        options: selectedPollOptions 
      });
      setShowResults(true);
    } catch (err) {
      console.error('Error submitting poll:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!isAuthenticated && data.metadata?.requireAuth) {
      handleAuthRequired();
      return;
    }
    
    try {
      setIsSubmitting(true);
      const quiz = data.interactive_content?.quiz;
      
      if (quiz) {
        const score = quiz.questions.reduce((acc, q, index) => {
          return acc + (quizAnswers[index] === q.correct_option ? 1 : 0);
        }, 0);
        
        await submitResponse({ 
          type: 'quiz',
          answers: quizAnswers, 
          score 
        });
        setShowResults(true);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSurveySubmit = async () => {
    if (!isAuthenticated && data.metadata?.requireAuth) {
      handleAuthRequired();
      return;
    }
    
    try {
      setIsSubmitting(true);
      await submitResponse({ 
        type: 'survey',
        answers: surveyAnswers 
      });
      setShowResults(true);
    } catch (err) {
      console.error('Error submitting survey:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSurveyResponse = (questionIndex: number, optionIndex: number) => {
    setSurveyAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // Less than a minute
      if (diff < 60000) {
        return 'just now';
      }
      
      // Less than an hour
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m`;
      }
      
      // Less than a day
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h`;
      }
      
      // Less than a week
      if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d`;
      }
      
      // Format as date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const handleNextSlide = () => {
    if (data.media && currentSlide < data.media.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const renderPoll = (poll: PollData) => {
    if (!poll.question || !poll.options || poll.options.length === 0) {
      return null;
    }
    
    return (
      <View className="mt-4 w-full">
        <Text className="text-base font-bold mb-4 text-foreground">{poll.question}</Text>
        
        {poll.description && (
          <Text className="text-base text-muted-foreground mb-4">{poll.description}</Text>
        )}
        
        {error && (
          <Text className="text-destructive text-sm mt-4">{error.message}</Text>
        )}
        
        <View className="mt-2 space-y-2">
          {poll.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedPollOptions.includes(index) ? 'default' : 'secondary'}
              onPress={() => !showResults && setSelectedPollOptions([index])}
              disabled={isSubmitting || (showResults && !isAuthenticated)}
            >
              <Text className="flex-1 text-base">{option}</Text>
              
              {showResults && (
                <View className="flex-row items-center space-x-2">
                  <Text className="text-muted-foreground">
                    {Math.floor(Math.random() * 100)}%
                  </Text>
                  
                  <View className="h-1 bg-primary rounded" style={{ width: `${Math.floor(Math.random() * 100)}%` }} />
                </View>
              )}
            </Button>
          ))}
        </View>
        
        {!showResults && (
          <Button 
            variant="default" 
            onPress={handlePollSubmit} 
            disabled={isSubmitting || selectedPollOptions.length === 0}
          >
            <Text>Vote</Text>
          </Button>
        )}
        
        {showResults && (
          <View className="mt-4 items-center">
            <Text className="text-sm text-muted-foreground">
              {data.stats?.responses || 0} votes
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderQuiz = (quiz: QuizData) => {
    if (!quiz.title && (!quiz.questions || quiz.questions.length === 0)) {
      return null;
    }
    
    return (
      <View className="mt-4 w-full">
        {quiz.title && <Text className="text-base font-bold mb-4 text-foreground">{quiz.title}</Text>}
        
        {quiz.description && (
          <Text className="text-base text-muted-foreground mb-4">{quiz.description}</Text>
        )}
        
        {error && (
          <Text className="text-destructive text-sm mt-4">{error.message}</Text>
        )}
        
        {quiz.questions?.map((question, qIndex) => {
          if (!question.text || !question.options || question.options.length === 0) {
            return null;
          }
          
          return (
            <View key={qIndex} className="mb-6">
              <Text className="text-base mb-4">{question.text}</Text>
              
              <View className="space-y-2">
                {question.options.map((option, oIndex) => {
                  if (!option) return null;
                  
                  return (
                    <Button
                      key={oIndex}
                      variant={(quizAnswers[qIndex] ?? -1) === oIndex ? 'default' : 'secondary'}
                      onPress={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                      disabled={isSubmitting || (showResults && !isAuthenticated)}
                    >
                      <Text className="flex-1 text-base">{option}</Text>
                      
                      {showResults && (
                        <Text className="text-muted-foreground">
                          {oIndex === question.correct_option ? '✅' : '❌'}
                        </Text>
                      )}
                    </Button>
                  );
                })}
              </View>
            </View>
          );
        })}
        
        {!showResults && (
          <Button 
            variant="default" 
            onPress={handleQuizSubmit} 
            disabled={isSubmitting || Object.keys(quizAnswers).length !== quiz.questions?.length}
          >
            <Text>Submit Answers</Text>
          </Button>
        )}
      </View>
    );
  };

  const renderSurvey = (survey: SurveyData) => {
    if (!survey.title || !survey.questions || survey.questions.length === 0) {
      return null;
    }
    
    return (
      <View className="mt-4 w-full">
        <Text className="text-xl font-semibold mb-4 w-full flex-wrap px-4">{survey.title}</Text>
        
        {survey.description && (
          <Text className="text-base text-muted-foreground mb-4">{survey.description}</Text>
        )}
        
        {error && (
          <Text className="text-destructive text-sm mt-4">{error.message}</Text>
        )}
        
        {survey.questions.map((question, qIndex) => (
          <View key={qIndex} className="mb-4 p-6 bg-background rounded-sm">
            <Text className="text-base mb-4">{question.text}</Text>
            
            <View className="space-y-2">
              {question.options.map((option, oIndex) => (
                <Button
                  key={oIndex}
                  variant={surveyAnswers[qIndex] === oIndex ? 'default' : 'secondary'}
                  onPress={() => handleSurveyResponse(qIndex, oIndex)}
                  disabled={isSubmitting || (showResults && !isAuthenticated)}
                >
                  <Text className="text-base">{option}</Text>
                </Button>
              ))}
            </View>
          </View>
        ))}
        
        {!showResults && (
          <Button 
            variant="default" 
            onPress={handleSurveySubmit} 
            disabled={isSubmitting || Object.keys(surveyAnswers).length !== survey.questions.length}
          >
            <Text>Submit Survey</Text>
          </Button>
        )}
        
        {showResults && (
          <View className="mt-4 items-center">
            <Text className="text-base text-primary font-semibold">Thank you for your feedback!</Text>
          </View>
        )}
      </View>
    );
  };

  const renderInteractiveContent = () => {
    if (!data.interactive_content) {
      return null;
    }
    
    const { poll, quiz, survey } = data.interactive_content;
    
    if (survey) {
      return renderSurvey(survey);
    }
    
    if (poll) {
      return renderPoll(poll);
    }
    
    if (quiz) {
      return renderQuiz(quiz);
    }
    
    return null;
  };

  const renderMediaItems = () => {
    if (!data.media || data.media.length === 0) return null;
    
    if (data.metadata?.mediaLayout === 'carousel') {
      return (
        <View className="flex-row gap-4 mt-4 px-6">
          <View className="relative w-full">
            <View className="w-full aspect-video">
              <Image
                source={{ uri: data.media[currentSlide].type === 'video' ? data.media[currentSlide].thumbnail : data.media[currentSlide].url }}
                className="w-full h-full rounded-md"
                resizeMode="cover"
              />
              
              {data.media[currentSlide].caption && (
                <Text className="absolute bottom-0 left-0 right-0 bg-black/70 text-background p-4 text-sm">
                  {data.media[currentSlide].type === 'video' ? '🎥 ' : ''}{data.media[currentSlide].caption}
                </Text>
              )}
            </View>
            
            {data.media.length > 1 && (
              <View className="flex-row justify-center items-center space-x-2 mt-4">
                {data.media.map((_, index) => (
                  <View
                    key={index}
                    className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-primary' : 'bg-muted'}`}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      );
    }
    
    const getMediaItemClass = (index: number) => {
      const baseClass = isDesktop ? 'min-w-[250px]' : 'min-w-[150px]';
      
      if (data.metadata?.mediaLayout === 'fullwidth') {
        return `w-full aspect-video ${baseClass}`;
      } else if (data.metadata?.mediaLayout === 'grid') {
        return `w-[48%] aspect-square ${baseClass}`;
      } else if (data.metadata?.mediaLayout === 'list') {
        return `w-full aspect-video mb-4 ${baseClass}`;
      } else if (data.metadata?.mediaLayout === 'collage' || data.metadata?.mediaLayout === 'masonry') {
        return `w-[48%] aspect-square ${baseClass}`;
      } else {
        // Default layout based on media count
        if (data.media.length === 1) {
          return `w-full aspect-video ${baseClass}`;
        } else if (data.media.length === 2) {
          return `w-[48%] aspect-square ${baseClass}`;
        } else if (data.media.length === 3) {
          return index === 0 ? `w-full aspect-video mb-4 ${baseClass}` : `w-[48%] aspect-square ${baseClass}`;
        } else if (data.media.length === 4) {
          return index < 3 ? `w-[48%] aspect-square ${baseClass}` : `w-full aspect-[2/1] ${baseClass}`;
        }
      }
      return `w-full aspect-square ${baseClass}`;
    };
    
    return (
      <View className="flex-row flex-wrap gap-4 mt-4 px-6">
        {data.media.map((item, index) => (
          <View 
            key={index} 
            className={`relative overflow-hidden rounded-md bg-background ${getMediaItemClass(index)} ${isCollapsed ? `max-h-[${maxHeight}px]` : ''}`}
          >
            <Image
              source={{ uri: item.type === 'video' ? item.thumbnail : item.url }}
              className="w-full h-full"
              resizeMode="cover"
            />
            
            {item.caption && (
              <Text className="absolute bottom-0 left-0 right-0 bg-black/70 text-background p-4 text-sm">
                {item.type === 'video' ? '🎥 ' : ''}{item.caption}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    return (
      <View className={`relative w-full ${isCollapsed ? 'overflow-hidden' : ''}`}>
        {data.content && (
          <View className="px-6">
            <Text className="text-base text-foreground">{data.content}</Text>
          </View>
        )}
        
        {data.media && data.media.length > 0 && renderMediaItems()}
        {renderInteractiveContent()}
      </View>
    );
  };

  return (
    <View className={`bg-card rounded-2xl border border-border overflow-hidden w-full self-stretch shadow-sm mb-2 ${isDesktop ? 'max-w-[800px] mx-auto' : ''}`}>
      {showHeader && (
        <View className={`flex-row justify-between items-start ${isDesktop ? 'px-6 py-4' : 'px-3 py-1'} flex-wrap`}>
          <View className="flex-1 flex-row items-center justify-between min-w-[200px]">
            <Text 
              className={`${isDesktop ? 'text-base' : 'text-sm'} font-semibold text-foreground`}
              numberOfLines={1}
            >
              {data.channel_username}
            </Text>
            
            <Text className={`${isDesktop ? 'text-sm' : 'text-[11px]'} text-muted-foreground`}>
              {formatTimestamp(data.metadata?.timestamp || '')}
            </Text>
          </View>
        </View>
      )}
      
      <View 
        className={`relative w-full ${isCollapsed ? 'h-[60px] overflow-hidden' : ''}`}
      >
        <View className="w-full">
          {data.content && (
            <View className={`${isDesktop ? 'px-6 py-2' : 'px-3 py-1'}`}>
              <Text 
                className={`${isDesktop ? 'text-base' : 'text-sm'} text-foreground`}
                numberOfLines={isCollapsed ? 2 : undefined}
              >
                {data.content}
              </Text>
              <View className="flex-row justify-end mt-1">
                <Text className="text-[10px] text-primary">✓</Text>
              </View>
            </View>
          )}
          
          {data.media && data.media.length > 0 && !isCollapsed && (
            <View className={`${isDesktop ? 'px-6' : 'px-3'}`}>
              {renderMediaItems()}
            </View>
          )}
          
          {data.interactive_content && !isCollapsed && (
            <View className={`${isDesktop ? 'px-6' : 'px-3'}`}>
              {renderInteractiveContent()}
            </View>
          )}
        </View>
        
        {isCollapsed && data.metadata?.isCollapsible && (
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0)',
              `${colorScheme.colors.background}99`,
              colorScheme.colors.background
            ]}
            className="absolute bottom-0 left-0 right-0 h-[30px] justify-end pb-2 z-10"
            pointerEvents="box-none"
          >
            <View className="flex-row justify-end px-3 w-full">
              <Button
                variant="ghost"
                onPress={toggleCollapse}
              >
                <Text className="text-sm text-foreground font-bold">Show more</Text>
              </Button>
            </View>
          </LinearGradient>
        )}

        {!isCollapsed && data.metadata?.isCollapsible && (
          <View className="flex-row justify-end px-3 py-2">
            <Button
              variant="ghost"
              onPress={toggleCollapse}
            >
              <Text className="text-sm text-foreground font-medium">Show less</Text>
            </Button>
          </View>
        )}
      </View>
      
      {showFooter && (
        <View className={`w-full ${isDesktop ? 'px-6 py-4' : 'px-2 py-1'}`}>
          <View className="flex-row items-center justify-end max-w-full flex-wrap gap-2">
            <Pressable className={`flex-row items-center gap-1 py-1 px-2 rounded-full ${isDesktop ? 'min-w-[60px]' : 'min-w-[40px]'}`}>
              <Text className={`${isDesktop ? 'text-base' : 'text-sm'} text-foreground opacity-80`}>💬</Text>
              <Text className={`${isDesktop ? 'text-sm' : 'text-xs'} text-foreground opacity-80`}>{data.stats?.responses || 0}</Text>
            </Pressable>
            
            <Pressable className={`flex-row items-center gap-1 py-1 px-2 rounded-full ${isDesktop ? 'min-w-[60px]' : 'min-w-[40px]'}`}>
              <Text className={`${isDesktop ? 'text-base' : 'text-sm'} text-foreground opacity-80`}>🔁</Text>
              <Text className={`${isDesktop ? 'text-sm' : 'text-xs'} text-foreground opacity-80`}>{data.stats?.shares || 0}</Text>
            </Pressable>
            
            <Pressable className={`flex-row items-center gap-1 py-1 px-2 rounded-full ${isDesktop ? 'min-w-[60px]' : 'min-w-[40px]'}`}>
              <Text className={`${isDesktop ? 'text-base' : 'text-sm'} text-foreground opacity-80`}>♡</Text>
              <Text className={`${isDesktop ? 'text-sm' : 'text-xs'} text-foreground opacity-80`}>{data.stats?.likes || 0}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});