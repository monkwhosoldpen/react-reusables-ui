import React from 'react';
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
    isLoading,
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
      await submitResponse({ 
        type: 'poll',
        options: selectedPollOptions 
      });
      setShowResults(true);
    } catch (err) {
    }
  };

  const handleQuizSubmit = async () => {
    if (!isAuthenticated && data.metadata?.requireAuth) {
      handleAuthRequired();
      return;
    }

    try {
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
    }
  };

  const handleSurveySubmit = async () => {
    if (!isAuthenticated && data.metadata?.requireAuth) {
      handleAuthRequired();
      return;
    }

    try {
      await submitResponse({ 
        type: 'survey',
        answers: surveyAnswers 
      });
      setShowResults(true);
    } catch (err) {
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

  const renderPoll = (poll: PollData) => (
    <View style={styles.interactiveContent}>
      <Text style={styles.pollQuestion}>{poll.question}</Text>
      {error && (
        <Text style={styles.errorText}>{error.message}</Text>
      )}
      {poll.options.map((option, index) => (
        <Pressable
          key={index}
          onPress={() => !showResults && setSelectedPollOptions([index])}
          style={[
            styles.pollOption,
            selectedPollOptions.includes(index) && styles.pollOptionSelected,
            showResults && styles.pollOptionResult
          ]}
          disabled={isLoading || (showResults && !isAuthenticated)}
        >
          <View style={[
            styles.pollOptionProgress,
            showResults && {
              width: `${Math.floor(Math.random() * 100)}%` // Replace with actual percentage
            }
          ]}>
            <Text style={[
              styles.pollOptionText,
              selectedPollOptions.includes(index) && styles.pollOptionTextSelected
            ]}>
              {option}
            </Text>
            {showResults && (
              <Text style={styles.pollPercentage}>
                {Math.floor(Math.random() * 100)}%
              </Text>
            )}
          </View>
        </Pressable>
      ))}
      {!showResults && (
        <View style={styles.pollFooter}>
          <Button 
            variant="default" 
            onPress={handlePollSubmit} 
            style={styles.pollSubmitButton}
            disabled={isLoading || selectedPollOptions.length === 0}
          >
            <Text style={styles.pollSubmitText}>
              {isLoading ? 'Submitting...' : 'Vote'}
            </Text>
          </Button>
          <Text style={styles.pollVoteCount}>
            {data.stats?.responses || 0} votes
          </Text>
        </View>
      )}
    </View>
  );

  const renderQuiz = (quiz: QuizData) => {
    console.log('Rendering quiz:', quiz);
    console.log('Quiz questions:', quiz.questions);
    console.log('Quiz title:', quiz.title);
    return (
      <View style={styles.interactiveContent}>
        <Text style={styles.quizTitle}>{quiz.title}</Text>
        {error && (
          <Text style={styles.errorText}>{error.message}</Text>
        )}
        {quiz.questions.map((question, qIndex) => {
          console.log('Rendering question:', question);
          console.log('Question text:', question.text);
          console.log('Question options:', question.options);
          return (
            <View key={qIndex} style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.text}</Text>
              {question.options.map((option, oIndex) => {
                console.log('Rendering option:', option);
                return (
                  <Button
                    key={oIndex}
                    variant={quizAnswers[qIndex] === oIndex ? 'default' : 'secondary'}
                    onPress={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                    style={styles.optionButton}
                    disabled={isLoading || (showResults && !isAuthenticated)}
                  >
                    <Text>{option}</Text>
                    {showResults && (
                      <Text style={styles.resultText}>
                        {oIndex === question.correct_option ? '✅' : '❌'}
                      </Text>
                    )}
                  </Button>
                );
              })}
            </View>
          );
        })}
        {!showResults && (
          <Button 
            variant="default" 
            onPress={handleQuizSubmit} 
            style={styles.submitButton}
            disabled={isLoading || Object.keys(quizAnswers).length !== quiz.questions.length}
          >
            <Text>{isLoading ? 'Submitting...' : 'Submit Answers'}</Text>
          </Button>
        )}
        {showResults && (
          <Button 
            variant="default" 
            onPress={() => setShowResults(false)} 
            style={styles.submitButton}
            disabled={isLoading}
          >
            <Text>Try Again</Text>
          </Button>
        )}
        {data.metadata?.requireAuth && !isAuthenticated && (
          <Text style={styles.authRequiredText}>Sign in to participate in this quiz</Text>
        )}
      </View>
    );
  };

  const renderSurvey = (survey: SurveyData) => (
    <View style={styles.interactiveContent}>
      <Text style={styles.surveyTitle}>{survey.title}</Text>
      {error && (
        <Text style={styles.errorText}>{error.message}</Text>
      )}
      {survey.questions.map((question, qIndex) => (
        <View key={qIndex} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.text}</Text>
          {question.options.map((option, oIndex) => (
            <Button
              key={oIndex}
              variant={surveyAnswers[qIndex] === oIndex ? 'default' : 'secondary'}
              onPress={() => setSurveyAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
              style={styles.optionButton}
              disabled={isLoading || (showResults && !isAuthenticated)}
            >
              <Text>{option}</Text>
            </Button>
          ))}
        </View>
      ))}
      {!showResults && (
        <Button 
          variant="default" 
          onPress={handleSurveySubmit} 
          style={styles.submitButton}
          disabled={isLoading || Object.keys(surveyAnswers).length !== survey.questions.length}
        >
          <Text>{isLoading ? 'Submitting...' : 'Submit Survey'}</Text>
        </Button>
      )}
      {showResults && (
        <Text style={styles.thankYouText}>Thank you for your feedback!</Text>
      )}
      {data.metadata?.requireAuth && !isAuthenticated && (
        <Text style={styles.authRequiredText}>Sign in to participate in this survey</Text>
      )}
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colorScheme.colors.card,
      borderRadius: Number(design.radius.lg),
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
      margin: Number(design.spacing.padding.card),
      overflow: 'hidden'
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: Number(design.spacing.padding.card),
      paddingVertical: Number(design.spacing.padding.item),
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      gap: Number(design.spacing.padding.item),
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
    },
    verifiedBadge: {
      fontSize: Number(design.spacing.fontSize.sm),
      color: colorScheme.colors.primary,
    },
    timestamp: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      opacity: Number(design.opacity.medium),
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
    },
    contentWrapper: {
      padding: Number(design.spacing.padding.card),
      position: 'relative',
      overflow: 'hidden',
    },
    interactiveFeaturesContainer: {
      gap: Number(design.spacing.padding.card),
      padding: Number(design.spacing.padding.card),
      paddingTop: 0,
    },
    interactiveContent: {
      marginTop: Number(design.spacing.margin.item),
      width: '100%',
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
    },
    mediaItem: {
      borderRadius: Number(design.radius.md),
      overflow: 'hidden',
      backgroundColor: colorScheme.colors.notification,
    },
    singleMediaItem: {
      width: '100%',
      aspectRatio: 16/9,
    },
    doubleMediaItem: {
      width: '49%',
      aspectRatio: 1,
    },
    tripleMediaItem: {
      width: '32%',
      aspectRatio: 1,
    },
    tripleMainItem: {
      width: '100%',
      aspectRatio: 16/9,
      marginBottom: Number(design.spacing.margin.item),
    },
    tripleSecondaryItem: {
      width: '49%',
      aspectRatio: 1,
    },
    quadMediaItem: {
      width: '49%',
      aspectRatio: 1,
    },
    lastQuadItem: {
      width: '100%',
      aspectRatio: 2,
    },
    mediaImage: {
      width: '100%',
      height: '100%',
    },
    mediaCaption: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      color: colorScheme.colors.background,
      padding: Number(design.spacing.padding.item),
      fontSize: Number(design.spacing.fontSize.sm),
    },
    footer: {
      paddingHorizontal: Number(design.spacing.padding.item),
      paddingVertical: Number(design.spacing.padding.item),
      borderTopWidth: 1,
      borderTopColor: colorScheme.colors.border,
    },
    metrics: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: 425,
    },
    metricItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Number(design.spacing.padding.item),
      paddingVertical: Number(design.spacing.padding.item),
      paddingHorizontal: Number(design.spacing.padding.item),
      borderRadius: Number(design.radius.full),
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
      marginBottom: Number(design.spacing.margin.item),
      textAlign: 'center',
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
      fontWeight: '700',
      color: colorScheme.colors.text,
      marginBottom: Number(design.spacing.margin.item),
    },
    pollOption: {
      minHeight: 40,
      marginBottom: Number(design.spacing.margin.item),
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
      borderRadius: Number(design.radius.sm),
      overflow: 'hidden',
    },
    pollOptionSelected: {
      borderColor: colorScheme.colors.primary,
      backgroundColor: colorScheme.colors.notification,
    },
    pollOptionResult: {
      borderColor: colorScheme.colors.border,
    },
    pollOptionProgress: {
      position: 'relative',
      padding: Number(design.spacing.padding.item),
      backgroundColor: colorScheme.colors.notification,
    },
    pollOptionText: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      zIndex: 1,
    },
    pollOptionTextSelected: {
      color: colorScheme.colors.primary,
    },
    pollPercentage: {
      position: 'absolute',
      right: Number(design.spacing.padding.item),
      top: Number(design.spacing.padding.item),
      fontSize: Number(design.spacing.fontSize.base),
      fontWeight: '700',
      color: colorScheme.colors.text,
    },
    pollFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: Number(design.spacing.margin.item),
    },
    pollSubmitButton: {
      backgroundColor: colorScheme.colors.primary,
      borderRadius: Number(design.radius.full),
      paddingHorizontal: Number(design.spacing.padding.item),
      paddingVertical: Number(design.spacing.padding.item),
      minWidth: 80,
    },
    pollSubmitText: {
      color: colorScheme.colors.background,
      fontSize: Number(design.spacing.fontSize.sm),
      fontWeight: '600',
    },
    pollVoteCount: {
      fontSize: Number(design.spacing.fontSize.sm),
      color: colorScheme.colors.text,
      opacity: Number(design.opacity.medium),
    },
    quizTitle: {
      fontSize: Number(design.spacing.fontSize.lg),
      fontWeight: '700',
      color: colorScheme.colors.text,
      marginBottom: Number(design.spacing.margin.item),
    },
    surveyTitle: {
      fontSize: Number(design.spacing.fontSize.xl),
      fontWeight: '600',
      marginBottom: Number(design.spacing.margin.item)
    },
    questionContainer: {
      marginBottom: Number(design.spacing.margin.item),
      backgroundColor: colorScheme.colors.notification,
      borderRadius: Number(design.radius.lg),
      padding: Number(design.spacing.padding.card),
    },
    questionText: {
      fontSize: Number(design.spacing.fontSize.base),
      color: colorScheme.colors.text,
      marginBottom: Number(design.spacing.margin.item),
      fontWeight: '600',
    },
    optionButton: {
      marginBottom: Number(design.spacing.margin.item),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colorScheme.colors.background,
      borderWidth: 1,
      borderColor: colorScheme.colors.border,
      borderRadius: Number(design.radius.sm),
      paddingVertical: Number(design.spacing.padding.item),
      paddingHorizontal: Number(design.spacing.padding.card),
    },
    submitButton: {
      backgroundColor: colorScheme.colors.primary,
      borderRadius: Number(design.radius.full),
      paddingVertical: Number(design.spacing.padding.item),
      marginTop: Number(design.spacing.margin.item),
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

  return (
    <View style={styles.container}>
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
          <View style={[
            styles.markdownContainer,
            isCollapsed && { maxHeight: 72 } // Approximately 3 lines of text
          ]}>
            <Markdown style={markdownStyles}>
              {data.content}
            </Markdown>
          </View>

          {data.media && data.media.length > 0 && (
            <View style={[styles.mediaContainer]}>
              {data.media.map((item, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.mediaItem,
                    data.media?.length === 1 && styles.singleMediaItem,
                    data.media?.length === 2 && styles.doubleMediaItem,
                    data.media?.length === 3 && styles.tripleMediaItem,
                    data.media?.length === 3 && index === 0 && styles.tripleMainItem,
                    data.media?.length === 3 && index > 0 && styles.tripleSecondaryItem,
                    data.media?.length === 4 && styles.quadMediaItem,
                    data.media?.length === 4 && index === 3 && styles.lastQuadItem,
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
          )}

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

        {!isCollapsed && (
          <>
            <View style={styles.interactiveFeaturesContainer}>
              {(data.type === 'poll') && data.interactive_content?.poll && (
                renderPoll(data.interactive_content.poll)
              )}
              
              {(data.type === 'quiz') && data.interactive_content?.quiz && (
                renderQuiz(data.interactive_content.quiz)
              )}
              
              {(data.type === 'survey') && data.interactive_content?.survey && (
                renderSurvey(data.interactive_content.survey)
              )}
            </View>

            {data.metadata?.isCollapsible && (
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
          </>
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
            <Pressable style={styles.metricItem}>
              <Text style={styles.metricIcon}>📊</Text>
              <Text style={styles.metricNumber}>{data.stats?.views || 0}</Text>
            </Pressable>
            <Pressable style={[styles.metricItem, styles.shareButton]}>
              <Text style={styles.metricIcon}>↗️</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
} 