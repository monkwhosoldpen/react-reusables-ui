import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { FormDataType, PollData, QuizData, SurveyData } from '~/lib/enhanced-chat/types/superfeed';
import { useInteractiveContent } from '~/lib/hooks/useInteractiveContent';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';

interface FeedItemProps {
  data: FormDataType;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function FeedItem({ data, showHeader = true, showFooter = true }: FeedItemProps) {
  const { colorScheme, themeName } = useColorScheme();
  const { design } = useDesign();

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
  const [isCollapsed, setIsCollapsed] = React.useState(data.metadata?.isCollapsible ?? true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Update collapsed state when metadata changes
  React.useEffect(() => {
    setIsCollapsed(data.metadata?.isCollapsible ?? true);
  }, [data.metadata?.isCollapsible]);

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const handleAuthRequired = React.useCallback(() => {
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
      <View style={styles.interactiveContent}>
        <Text style={styles.quizTitle}>{poll.question}</Text>
        {error && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}
        <View style={styles.optionsContainer}>
          {poll.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedPollOptions.includes(index) ? 'default' : 'secondary'}
              onPress={() => !showResults && setSelectedPollOptions([index])}
              style={styles.optionButton}
              disabled={isSubmitting || (showResults && !isAuthenticated)}
            >
              <View style={styles.pollOptionContent}>
                <Text style={styles.optionButtonText}>{option}</Text>
                {showResults && (
                  <View style={styles.pollResults}>
                    <Text style={styles.pollPercentage}>
                      {Math.floor(Math.random() * 100)}%
                    </Text>
                    <View style={[
                      styles.pollOptionProgress,
                      { width: `${Math.floor(Math.random() * 100)}%` }
                    ]} />
                  </View>
                )}
              </View>
            </Button>
          ))}
        </View>
        {!showResults && (
          <Button 
            variant="default" 
            onPress={handlePollSubmit} 
            style={styles.submitButton}
            disabled={isSubmitting || selectedPollOptions.length === 0}
          >
            <Text>Vote</Text>
          </Button>
        )}
        {showResults && (
          <View style={styles.pollFooter}>
            <Text style={styles.pollVoteCount}>
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
      <View style={styles.interactiveContent}>
        {quiz.title && <Text style={styles.quizTitle}>{quiz.title}</Text>}
        {error && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}
        {quiz.questions?.map((question, qIndex) => {
          if (!question.text || !question.options || question.options.length === 0) {
            return null;
          }

          return (
            <View key={qIndex} style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.text}</Text>
              <View style={styles.optionsContainer}>
                {question.options.map((option, oIndex) => {
                  if (!option) return null;
                  
                  return (
                    <Button
                      key={oIndex}
                      variant={(quizAnswers[qIndex] ?? -1) === oIndex ? 'default' : 'secondary'}
                      onPress={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                      style={styles.optionButton}
                      disabled={isSubmitting || (showResults && !isAuthenticated)}
                    >
                      <View style={styles.pollOptionContent}>
                        <Text style={styles.optionButtonText}>{option}</Text>
                        {showResults && (
                          <Text style={styles.resultText}>
                            {oIndex === question.correct_option ? '✅' : '❌'}
                          </Text>
                        )}
                      </View>
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
            style={styles.submitButton}
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
      <View style={styles.interactiveContent}>
        <Text style={styles.surveyTitle}>{survey.title}</Text>
        {error && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}
        {survey.questions.map((question, qIndex) => (
          <View key={qIndex} style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.text}</Text>
            <View style={styles.optionsContainer}>
              {question.options.map((option, oIndex) => (
                <Button
                  key={oIndex}
                  variant={surveyAnswers[qIndex] === oIndex ? 'default' : 'secondary'}
                  onPress={() => setSurveyAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                  style={styles.optionButton}
                  disabled={isSubmitting || (showResults && !isAuthenticated)}
                >
                  <Text style={styles.optionButtonText}>{option}</Text>
                </Button>
              ))}
            </View>
          </View>
        ))}
        {!showResults && (
          <Button 
            variant="default" 
            onPress={handleSurveySubmit} 
            style={styles.submitButton}
            disabled={isSubmitting || Object.keys(surveyAnswers).length !== survey.questions.length}
          >
            <Text>Submit Survey</Text>
          </Button>
        )}
        {showResults && (
          <View style={styles.surveyFooter}>
            <Text style={styles.thankYouText}>Thank you for your feedback!</Text>
          </View>
        )}
      </View>
    );
  };

  const renderInteractiveContent = () => {
    if (!data.interactive_content) return null;

    const { poll, quiz, survey } = data.interactive_content;

    return (
      <View style={styles.interactiveFeaturesContainer}>
        {poll && renderPoll(poll)}
        {quiz && renderQuiz(quiz)}
        {survey && renderSurvey(survey)}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colorScheme.colors.card,
      borderRadius: Number(design.radius.lg),
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
      margin: Number(design.spacing.padding.card),
      overflow: 'hidden',
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: Number(design.spacing.padding.card),
      paddingVertical: Number(design.spacing.padding.item),
      flexWrap: 'wrap',
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      gap: Number(design.spacing.padding.item),
      minWidth: 200,
    },
    avatar: {
      width: Number(design.spacing.avatarSize),
      height: Number(design.spacing.avatarSize),
      borderRadius: Number(design.radius.full) / 2,
      backgroundColor: colorScheme.colors.notification,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    headerText: {
      flex: 1,
      minWidth: 150,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: Number(design.spacing.padding.item),
    },
    username: {
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '700',
      color: colorScheme.colors.text,
      flexShrink: 1,
    },
    verifiedBadge: {
      fontSize: Number(design.spacing.fontSize.sm),
      color: colorScheme.colors.primary,
    },
    timestamp: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: Number(design.opacity.medium),
      flexShrink: 1,
    },
    moreButton: {
      padding: Number(design.spacing.padding.item),
      marginTop: -Number(design.spacing.padding.item),
      marginRight: -Number(design.spacing.padding.item),
    },
    moreButtonText: {
      fontSize: Number(design.spacing.fontSize.xl),
      color: colorScheme.colors.text,
      opacity: Number(design.opacity.medium),
      letterSpacing: -1,
      marginTop: -Number(design.spacing.padding.item),
    },
    content: {
      position: 'relative',
      width: '100%',
    },
    contentWrapper: {
      padding: Number(design.spacing.padding.card),
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
    },
    interactiveFeaturesContainer: {
      gap: Number(design.spacing.padding.card),
      padding: Number(design.spacing.padding.card),
      paddingTop: 0,
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    },
    interactiveContent: {
      marginTop: Number(design.spacing.margin.item),
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    },
    collapsible: {
      overflow: 'hidden'
    },
    contentText: {
      fontSize: Number(design.spacing.fontSize.base),
      lineHeight: Number(design.spacing.lineHeight.normal),
      color: colorScheme.colors.text,
    },
    mediaContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Number(design.spacing.padding.item),
      marginTop: Number(design.spacing.margin.item),
      width: '100%',
    },
    mediaItem: {
      borderRadius: Number(design.radius.md),
      overflow: 'hidden',
      backgroundColor: colorScheme.colors.background,
      position: 'relative',
      width: '100%' as const,
      aspectRatio: 1,
    },
    mediaImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    mediaCaption: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: colorScheme.colors.background,
      padding: Number(design.spacing.padding.item),
      fontSize: Number(design.spacing.fontSize.sm),
    },
    singleMediaItem: {
      width: '100%' as const,
      aspectRatio: 16/9,
    },
    doubleMediaItem: {
      width: '48%' as const,
      aspectRatio: 1,
      minWidth: 150,
    },
    tripleMediaItem: {
      width: '100%' as const,
      aspectRatio: 16/9,
    },
    tripleMainItem: {
      width: '100%' as const,
      aspectRatio: 16/9,
      marginBottom: Number(design.spacing.margin.item),
    },
    tripleSecondaryItem: {
      width: '48%' as const,
      aspectRatio: 1,
      minWidth: 150,
    },
    quadMediaItem: {
      width: '48%' as const,
      aspectRatio: 1,
      minWidth: 150,
    },
    lastQuadItem: {
      width: '100%' as const,
      aspectRatio: 2,
    },
    gridMediaItem: {
      width: '48%' as const,
      aspectRatio: 1,
      minWidth: 150,
    },
    carouselContainer: {
      flexDirection: 'row',
      overflow: 'hidden',
      marginTop: Number(design.spacing.margin.item),
      position: 'relative',
      width: '100%',
    },
    carouselItem: {
      width: '100%' as const,
      aspectRatio: 16/9,
      marginRight: Number(design.spacing.padding.item),
    },
    carouselControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Number(design.spacing.margin.item),
      gap: Number(design.spacing.padding.item),
      flexWrap: 'wrap',
    },
    carouselDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ccc',
    },
    carouselDotActive: {
      backgroundColor: '#007AFF',
    },
    listMediaItem: {
      width: '100%' as const,
      aspectRatio: 16/9,
      marginBottom: Number(design.spacing.margin.item),
    },
    collageMediaItem: {
      width: '48%' as const,
      aspectRatio: 1,
      minWidth: 150,
    },
    masonryMediaItem: {
      width: '48%' as const,
      aspectRatio: 1,
      minWidth: 150,
    },
    fullwidthMediaItem: {
      width: '100%' as const,
      aspectRatio: 16/9,
    },
    footer: {
      paddingHorizontal: Number(design.spacing.padding.card),
      paddingVertical: Number(design.spacing.padding.item),
      borderTopWidth: 1,
      borderTopColor: colorScheme.colors.border,
      width: '100%',
    },
    metrics: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '100%',
      flexWrap: 'wrap',
      gap: Number(design.spacing.padding.item),
    },
    metricItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Number(design.spacing.padding.item),
      paddingVertical: Number(design.spacing.padding.item),
      paddingHorizontal: Number(design.spacing.padding.item),
      borderRadius: Number(design.radius.full),
      minWidth: 60,
    },
    metricIcon: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: Number(design.opacity.medium),
    },
    metricNumber: {
      fontSize: Number(design.spacing.fontSize.sm),
      color: colorScheme.colors.text,
      opacity: Number(design.opacity.medium),
      minWidth: 16,
    },
    shareButton: {
      marginLeft: 'auto',
    },
    errorText: {
      color: colorScheme.colors.primary,
      fontSize: Number(design.spacing.fontSize.sm),
      marginTop: Number(design.spacing.margin.item),
    },
    authRequiredText: {
      color: colorScheme.colors.text,
      opacity: Number(design.opacity.medium),
      fontSize: Number(design.spacing.fontSize.sm),
      marginTop: Number(design.spacing.margin.item),
      textAlign: 'center',
    },
    pollQuestion: {
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: 'bold',
      marginBottom: Number(design.spacing.margin.item),
      color: colorScheme.colors.text,
    },
    optionsContainer: {
      marginTop: 8,
      gap: 8,
    },
    pollOptionContent: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pollResults: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pollPercentage: {
      fontSize: 14,
      color: '#666',
    },
    pollOptionProgress: {
      height: 4,
      backgroundColor: '#007AFF',
      borderRadius: 2,
    },
    pollVoteCount: {
      fontSize: Number(design.spacing.fontSize.sm),
      color: colorScheme.colors.text,
      opacity: Number(design.opacity.medium),
    },
    quizTitle: {
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: 'bold',
      marginBottom: Number(design.spacing.margin.item),
      color: colorScheme.colors.text,
    },
    surveyTitle: {
      fontSize: Number(design.spacing.fontSize.xl),
      fontWeight: '600',
      marginBottom: Number(design.spacing.margin.item),
      width: '100%',
      flexWrap: 'wrap',
      paddingHorizontal: Number(design.spacing.padding.item)
    },
    questionContainer: {
      marginBottom: Number(design.spacing.margin.item),
      padding: Number(design.spacing.padding.card),
      backgroundColor: colorScheme.colors.background,
      borderRadius: Number(design.radius.sm),
    },
    questionText: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      marginBottom: Number(design.spacing.margin.item),
    },
    optionButton: {
      marginBottom: Number(design.spacing.margin.item),
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colorScheme.colors.background,
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
      borderRadius: Number(design.radius.sm),
      paddingVertical: Number(design.spacing.padding.item),
      paddingHorizontal: Number(design.spacing.padding.card),
      minHeight: 44,
    },
    optionButtonText: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      flex: 1,
    },
    submitButton: {
      backgroundColor: colorScheme.colors.primary,
      borderRadius: Number(design.radius.full),
      paddingVertical: Number(design.spacing.padding.item),
      marginTop: Number(design.spacing.margin.item),
      width: '100%',
      maxWidth: '100%',
      minHeight: 44
    },
    resultText: {
      marginLeft: Number(design.spacing.margin.item),
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: Number(design.opacity.medium),
    },
    thankYouText: {
      textAlign: 'center',
      marginTop: Number(design.spacing.margin.item),
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.primary,
      fontWeight: '600',
    },
    collapsed: {
      overflow: 'hidden',
    },
    contentOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 120,
      justifyContent: 'flex-end',
      paddingBottom: Number(design.spacing.padding.item),
      zIndex: 2,
    },
    collapseButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: Number(design.spacing.padding.card),
      width: '100%',
    },
    overlayCollapseButton: {
      backgroundColor: colorScheme.colors.background,
      paddingVertical: Number(design.spacing.padding.item),
      paddingHorizontal: Number(design.spacing.padding.item),
      borderRadius: Number(design.radius.full),
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
      zIndex: 2,
      elevation: Number(design.elevation.sm),
    },
    overlayCollapseButtonText: {
      fontSize: Number(design.spacing.fontSize.sm),
      color: colorScheme.colors.text,
      fontWeight: '700',
    },
    showLessContainer: {
      paddingVertical: Number(design.spacing.padding.item),
      borderTopWidth: 1,
      borderTopColor: colorScheme.colors.border,
    },
    showLessButton: {
      paddingVertical: Number(design.spacing.padding.item),
      paddingHorizontal: Number(design.spacing.padding.item),
      borderRadius: Number(design.radius.full),
      backgroundColor: colorScheme.colors.notification,
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
    },
    showLessButtonText: {
      fontSize: Number(design.spacing.fontSize.sm),
      color: colorScheme.colors.text,
      fontWeight: '500',
    },
    markdownContainer: {
      overflow: 'hidden',
      width: '100%',
    },
    pollFooter: {
      marginTop: Number(design.spacing.margin.item),
      alignItems: 'center',
    },
    surveyFooter: {
      marginTop: Number(design.spacing.margin.item),
      alignItems: 'center',
    },
    pollContainer: {
      marginTop: Number(design.spacing.margin.item),
      padding: Number(design.spacing.padding.item),
      backgroundColor: colorScheme.colors.notification,
      borderRadius: Number(design.radius.md),
      width: '100%',
    },
  });

  const markdownStyles = StyleSheet.create({
    body: {
      color: colorScheme.colors.text,
      fontSize: Number(design.spacing.fontSize.base),
      lineHeight: Number(design.spacing.lineHeight.normal),
    },
    heading1: {
      fontSize: Number(design.spacing.fontSize['3xl']),
      fontWeight: 'bold',
      marginVertical: Number(design.spacing.margin.item),
      color: colorScheme.colors.text,
    },
    heading2: {
      fontSize: Number(design.spacing.fontSize.xl),
      fontWeight: 'bold',
      marginVertical: Number(design.spacing.margin.item),
      color: colorScheme.colors.text,
    },
    heading3: {
      fontSize: Number(design.spacing.fontSize.lg),
      fontWeight: 'bold',
      marginVertical: Number(design.spacing.margin.item),
      color: colorScheme.colors.text,
    },
    link: {
      color: colorScheme.colors.primary,
      textDecorationLine: 'underline',
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    listItemNumber: {
      fontWeight: 'bold',
      marginRight: Number(design.spacing.margin.item),
    },
    listItemBullet: {
      fontWeight: 'bold',
      marginRight: Number(design.spacing.margin.item),
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colorScheme.colors.border,
      paddingLeft: Number(design.spacing.padding.item),
      marginVertical: Number(design.spacing.margin.item),
    },
    code_inline: {
      backgroundColor: colorScheme.colors.notification,
      paddingHorizontal: Number(design.spacing.padding.item),
      paddingVertical: Number(design.spacing.padding.item),
      borderRadius: Number(design.radius.sm),
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: colorScheme.colors.notification,
      padding: Number(design.spacing.padding.item),
      borderRadius: Number(design.radius.md),
      marginVertical: Number(design.spacing.margin.item),
      fontFamily: 'monospace',
    },
    hr: {
      backgroundColor: colorScheme.colors.border,
      height: 1,
      marginVertical: Number(design.spacing.margin.item),
    },
  });

  const renderMediaItems = () => {
    if (!data.media || data.media.length === 0) return null;

    if (data.metadata?.mediaLayout === 'carousel') {
      return (
        <>
          <View style={styles.carouselContainer}>
            <View style={styles.carouselItem}>
              <Image
                source={{ uri: data.media[currentSlide].type === 'video' ? data.media[currentSlide].thumbnail : data.media[currentSlide].url }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
              {data.media[currentSlide].caption && (
                <Text style={styles.mediaCaption}>
                  {data.media[currentSlide].type === 'video' ? '🎥 ' : ''}{data.media[currentSlide].caption}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.carouselControls}>
            <Button
              variant="ghost"
              onPress={handlePrevSlide}
              disabled={currentSlide === 0}
            >
              <Text>Previous</Text>
            </Button>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {data.media.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.carouselDot,
                    currentSlide === index && styles.carouselDotActive
                  ]}
                />
              ))}
            </View>
            <Button
              variant="ghost"
              onPress={handleNextSlide}
              disabled={currentSlide === data.media.length - 1}
            >
              <Text>Next</Text>
            </Button>
          </View>
        </>
      );
    }

    const getMediaItemStyle = (index: number) => {
      if (data.metadata?.mediaLayout === 'fullwidth') {
        return styles.fullwidthMediaItem;
      } else if (data.metadata?.mediaLayout === 'grid') {
        return styles.gridMediaItem;
      } else if (data.metadata?.mediaLayout === 'list') {
        return styles.listMediaItem;
      } else if (data.metadata?.mediaLayout === 'collage') {
        return styles.collageMediaItem;
      } else if (data.metadata?.mediaLayout === 'masonry') {
        return styles.masonryMediaItem;
      } else {
        // Default layout based on media count
        if (data.media.length === 1) {
          return styles.singleMediaItem;
        } else if (data.media.length === 2) {
          return styles.doubleMediaItem;
        } else if (data.media.length === 3) {
          return index === 0 ? styles.tripleMainItem : styles.tripleSecondaryItem;
        } else if (data.media.length === 4) {
          return index < 3 ? styles.quadMediaItem : styles.lastQuadItem;
        }
      }
      return styles.mediaItem;
    };

    return (
      <View style={[styles.mediaContainer]}>
        {data.media.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.mediaItem,
              getMediaItemStyle(index)
            ]}
          >
            <Image
              source={{ uri: item.type === 'video' ? item.thumbnail : item.url }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
            {item.caption && (
              <Text style={styles.mediaCaption}>
                {item.type === 'video' ? '🎥 ' : ''}{item.caption}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.colors.card }]}>
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Image 
                source={{ 
                  uri: data.channel_username === 'elonmusk' 
                    ? 'https://placehold.co/400x400/1DA1F2/ffffff/png?text=X'
                    : 'https://placehold.co/400x400/666666/ffffff/png?text=U'
                }} 
                style={styles.avatarImage}
              />
            </View>
            <View style={styles.headerText}>
              <View style={styles.nameContainer}>
                <Text style={styles.username}>{data.channel_username}</Text>
                <Text style={styles.verifiedBadge}>✓</Text>
                <Text style={styles.timestamp}>· {formatTimestamp(data.metadata?.timestamp || '')}</Text>
              </View>
            </View>
          </View>
          <Button
            variant="ghost"
            onPress={() => {}}
            style={styles.moreButton}
          >
            <Text style={styles.moreButtonText}>•••</Text>
          </Button>
        </View>
      )}

      <View style={[
        styles.content,
        isCollapsed && styles.collapsed
      ]}>
        <View style={styles.contentWrapper}>
          {/* Content Text */}
          {data.content && (
            <View style={[
              styles.markdownContainer,
              isCollapsed && { maxHeight: 72 }
            ]}>
              <Markdown style={markdownStyles}>
                {data.content}
              </Markdown>
            </View>
          )}

          {/* Media Items */}
          {data.media && data.media.length > 0 && renderMediaItems()}

          {/* Interactive Content */}
          {!isCollapsed && renderInteractiveContent()}

          {isCollapsed && data.metadata?.isCollapsible && (
            <LinearGradient
              colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 1)']}
              style={styles.contentOverlay}
              pointerEvents="box-none"
            >
              <View style={styles.collapseButtonContainer}>
                <Button
                  variant="ghost"
                  onPress={toggleCollapse}
                  style={styles.overlayCollapseButton}
                >
                  <Text style={styles.overlayCollapseButtonText}>Show more</Text>
                </Button>
              </View>
            </LinearGradient>
          )}
        </View>

        {!isCollapsed && data.metadata?.isCollapsible && (
          <View style={styles.showLessContainer}>
            <View style={styles.collapseButtonContainer}>
              <Button
                variant="ghost"
                onPress={toggleCollapse}
                style={styles.showLessButton}
              >
                <Text style={styles.showLessButtonText}>Show less</Text>
              </Button>
            </View>
          </View>
        )}
      </View>

      {showFooter && (
        <View style={styles.footer}>
          <View style={styles.metrics}>
            <Pressable style={styles.metricItem}>
              <Text style={styles.metricIcon}>💬</Text>
              <Text style={styles.metricNumber}>{data.stats?.responses || 0}</Text>
            </Pressable>
            <Pressable style={styles.metricItem}>
              <Text style={styles.metricIcon}>🔁</Text>
              <Text style={styles.metricNumber}>{data.stats?.shares || 0}</Text>
            </Pressable>
            <Pressable style={styles.metricItem}>
              <Text style={styles.metricIcon}>♡</Text>
              <Text style={styles.metricNumber}>{data.stats?.likes || 0}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
} 