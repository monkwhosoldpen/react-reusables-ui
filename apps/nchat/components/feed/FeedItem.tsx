import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { FormDataType, PollData, QuizData, SurveyData } from '~/lib/types/superfeed';
import { useInteractiveContent } from '~/lib/hooks/useInteractiveContent';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';

interface FeedItemProps {
  data: FormDataType;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function FeedItem({ data, showHeader = true, showFooter = true }: FeedItemProps) {
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
      await submitResponse({ options: selectedPollOptions }, 'poll');
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
        await submitResponse({ answers: quizAnswers, score }, 'quiz');
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
      await submitResponse({ answers: surveyAnswers }, 'survey');
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

  const renderQuiz = (quiz: QuizData) => (
    <View style={styles.interactiveContent}>
      <Text style={styles.quizTitle}>{quiz.title}</Text>
      {error && (
        <Text style={styles.errorText}>{error.message}</Text>
      )}
      {quiz.questions.map((question, qIndex) => (
        <View key={qIndex} style={styles.questionContainer}>
          <Text style={styles.questionText}>{question.text}</Text>
          {question.options.map((option, oIndex) => (
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
          ))}
        </View>
      ))}
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
              {(data.type === 'all' || data.type === 'poll') && data.interactive_content?.poll && (
                renderPoll(data.interactive_content.poll)
              )}
              
              {(data.type === 'all' || data.type === 'quiz') && data.interactive_content?.quiz && (
                renderQuiz(data.interactive_content.quiz)
              )}
              
              {(data.type === 'all' || data.type === 'survey') && data.interactive_content?.survey && (
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    margin: 16,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff3f4',
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
    gap: 4,
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f1419',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#1d9bf0',
  },
  timestamp: {
    fontSize: 15,
    color: '#536471',
  },
  moreButton: {
    padding: 8,
    marginTop: -8,
    marginRight: -8,
  },
  moreButtonText: {
    fontSize: 20,
    color: '#536471',
    letterSpacing: -1,
    marginTop: -8,
  },
  content: {
    position: 'relative',
  },
  contentWrapper: {
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  interactiveFeaturesContainer: {
    gap: 16,
    padding: 16,
    paddingTop: 0,
  },
  interactiveContent: {
    marginTop: 12,
    width: '100%',
  },
  collapsible: {
    overflow: 'hidden'
  },
  contentText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#0f1419',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 12,
  },
  mediaItem: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
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
    marginBottom: 4,
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
    color: '#fff',
    padding: 4,
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#eff3f4',
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
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  metricIcon: {
    fontSize: 16,
    color: '#536471',
  },
  metricNumber: {
    fontSize: 13,
    color: '#536471',
    minWidth: 16, // Ensures alignment when numbers change
  },
  shareButton: {
    marginLeft: 'auto',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  authRequiredText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  pollQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f1419',
    marginBottom: 12,
  },
  pollOption: {
    minHeight: 40,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#cfd9de',
    borderRadius: 4,
    overflow: 'hidden',
  },
  pollOptionSelected: {
    borderColor: '#1d9bf0',
    backgroundColor: '#e8f5fd',
  },
  pollOptionResult: {
    borderColor: '#eff3f4',
  },
  pollOptionProgress: {
    position: 'relative',
    padding: 12,
    backgroundColor: '#f7f9f9',
  },
  pollOptionText: {
    fontSize: 15,
    color: '#0f1419',
    zIndex: 1,
  },
  pollOptionTextSelected: {
    color: '#1d9bf0',
  },
  pollPercentage: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f1419',
  },
  pollFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  pollSubmitButton: {
    backgroundColor: '#0f1419',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
  },
  pollSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pollVoteCount: {
    fontSize: 13,
    color: '#536471',
  },
  quizTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f1419',
    marginBottom: 16,
  },
  surveyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  questionContainer: {
    marginBottom: 16,
    backgroundColor: '#f7f9f9',
    borderRadius: 16,
    padding: 16,
  },
  questionText: {
    fontSize: 15,
    color: '#0f1419',
    marginBottom: 12,
    fontWeight: '600',
  },
  optionButton: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cfd9de',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  submitButton: {
    backgroundColor: '#0f1419',
    borderRadius: 9999,
    paddingVertical: 12,
    marginTop: 16,
  },
  resultText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#536471',
  },
  thankYouText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
    color: '#00ba7c',
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
    paddingBottom: 12,
    zIndex: 2,
  },
  collapseButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    width: '100%',
  },
  overlayCollapseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#eff3f4',
    zIndex: 2,
    elevation: 3,
  },
  overlayCollapseButtonText: {
    fontSize: 14,
    color: '#0f1419',
    fontWeight: '700',
  },
  showLessContainer: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eff3f4',
  },
  showLessButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#f7f9f9',
    borderWidth: 1,
    borderColor: '#eff3f4',
  },
  showLessButtonText: {
    fontSize: 14,
    color: '#0f1419',
    fontWeight: '500',
  },
  markdownContainer: {
    overflow: 'hidden',
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: '#0f1419',
    fontSize: 15,
    lineHeight: 20,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#0f1419',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#0f1419',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#0f1419',
  },
  link: {
    color: '#1d9bf0',
    textDecorationLine: 'underline',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listItemNumber: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  listItemBullet: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#cfd9de',
    paddingLeft: 12,
    marginVertical: 8,
  },
  code_inline: {
    backgroundColor: '#f7f9f9',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#f7f9f9',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: 'monospace',
  },
  hr: {
    backgroundColor: '#cfd9de',
    height: 1,
    marginVertical: 16,
  },
}); 