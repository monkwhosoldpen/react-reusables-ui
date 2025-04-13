import { useCallback } from 'react';
import { View, StyleSheet, Platform, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { PreviewData } from '~/lib/enhanced-chat/types/superfeed';
import { User } from '@supabase/supabase-js';
import { useTheme } from '~/lib/providers/theme/ThemeProvider';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';

type CommonStyles = {
  container: ViewStyle;
  content: ViewStyle;
  caption: TextStyle;
  message: TextStyle;
  collapsedContent: ViewStyle;
  gradient: ViewStyle;
  showMoreButton: ViewStyle;
  showMoreText: TextStyle;
  showMoreIcon: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
};

export function useFeedItemState(data: PreviewData) {
  const { theme } = useTheme();

  const getCommonStyles = useCallback((): CommonStyles => ({
    container: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border + '20',
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    content: {
      padding: 16,
    },
    caption: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      lineHeight: 24,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    message: {
      fontSize: 15,
      color: theme.colors.text + '80',
      lineHeight: 22,
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    collapsedContent: {
      maxHeight: data?.metadata?.maxHeight || 300,
      position: 'relative',
      overflow: 'hidden',
    },
    gradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 80,
      backgroundColor: theme.colorScheme.name === 'dark' 
        ? 'rgba(0,0,0,0.98)' 
        : 'rgba(255,255,255,0.98)',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '10',
      justifyContent: 'flex-end',
    },
    showMoreButton: {
      width: '100%',
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    showMoreText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      textAlign: 'center',
      letterSpacing: 0.2,
    },
    showMoreIcon: {
      marginLeft: 4,
    },
    errorContainer: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.notification + '10',
      borderRadius: 8,
    },
    errorText: {
      color: theme.colors.notification,
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '500',
    },
    loadingContainer: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: theme.colors.text + '80',
      fontSize: 14,
      marginTop: 8,
    },
  }), [theme.colorScheme, data?.metadata?.maxHeight]);

  const renderError = useCallback((message: string) => (
    <View style={getCommonStyles().errorContainer}>
      <Text style={getCommonStyles().errorText}>{message}</Text>
    </View>
  ), [getCommonStyles]);

  const renderLoading = useCallback((message: string = 'Loading...') => (
    <View style={getCommonStyles().loadingContainer}>
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={getCommonStyles().loadingText}>{message}</Text>
    </View>
  ), [theme.colors.primary, getCommonStyles]);

  return {
    getCommonStyles,
    renderError,
    renderLoading,
  };
}

type PreviewStyles = {
  header: ViewStyle;
  headerContent: ViewStyle;
  avatar: ViewStyle;
  headerText: ViewStyle;
  username: TextStyle;
  timestamp: TextStyle;
  footer: ViewStyle;
  footerContent: ViewStyle;
  stats: ViewStyle;
  statText: TextStyle;
  collapseButton: ViewStyle;
  collapseButtonText: TextStyle;
  pollContainer: ViewStyle;
  pollQuestion: TextStyle;
  pollOption: ViewStyle;
  pollOptionText: TextStyle;
  quizContainer: ViewStyle;
  quizTitle: TextStyle;
  quizDescription: TextStyle;
  surveyContainer: ViewStyle;
  surveyTitle: TextStyle;
  surveyDescription: TextStyle;
  authRequiredText: TextStyle;
};

export function usePreviewRenderers(data: PreviewData) {
  const { theme } = useTheme();
  const { getCommonStyles } = useFeedItemState(data);

  const styles = StyleSheet.create<PreviewStyles & CommonStyles>({
    ...getCommonStyles(),
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '20',
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    username: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    timestamp: {
      fontSize: 13,
      color: theme.colors.text + '80',
      marginTop: 2,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '20',
    },
    footerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stats: {
      flexDirection: 'row',
      gap: 16,
    },
    statText: {
      fontSize: 13,
      color: theme.colors.text + '80',
    },
    collapseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    collapseButtonText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    pollContainer: {
      padding: 16,
    },
    pollQuestion: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    pollOption: {
      padding: 12,
      backgroundColor: theme.colors.background + '10',
      borderRadius: 8,
      marginBottom: 8,
    },
    pollOptionText: {
      fontSize: 15,
      color: theme.colors.text,
    },
    quizContainer: {
      padding: 16,
    },
    quizTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    quizDescription: {
      fontSize: 15,
      color: theme.colors.text + '80',
      marginBottom: 16,
    },
    surveyContainer: {
      padding: 16,
    },
    surveyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    surveyDescription: {
      fontSize: 15,
      color: theme.colors.text + '80',
      marginBottom: 16,
    },
    authRequiredText: {
      fontSize: 14,
      color: theme.colors.notification,
      textAlign: 'center',
      marginTop: 8,
    },
  });

  const renderHeader = useCallback((user: User | null) => {
    if (!user) return null;
    
    try {
      return (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image 
              source={{ uri: user.user_metadata?.avatar_url }} 
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.headerText}>
              <Text style={styles.username}>{user.user_metadata?.full_name || user.email}</Text>
              <Text style={styles.timestamp}>
                {new Date(data.metadata.timestamp).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      );
    } catch (error) {
      console.error('Error rendering header:', error);
      return null;
    }
  }, [data.metadata.timestamp]);

  const renderFooter = useCallback((isCollapsed: boolean, toggleCollapse: () => void, user: User | null) => {
    if (!user) return null;

    try {
      return (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            {data.stats && (
              <View style={styles.stats}>
                <Text style={styles.statText}>{data.stats.views} views</Text>
                <Text style={styles.statText}>{data.stats.likes} likes</Text>
                <Text style={styles.statText}>{data.stats.responses} responses</Text>
              </View>
            )}
            {data.metadata.isCollapsible && (
              <TouchableOpacity 
                onPress={toggleCollapse}
                style={styles.collapseButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={isCollapsed ? "Show more" : "Show less"}
              >
                <Text style={styles.collapseButtonText}>
                  {isCollapsed ? "Show More" : "Show Less"}
                </Text>
                <Feather 
                  name={isCollapsed ? "chevron-down" : "chevron-up"}
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    } catch (error) {
      console.error('Error rendering footer:', error);
      return null;
    }
  }, [data.stats, data.metadata.isCollapsible, theme.colors.primary]);

  const renderPoll = useCallback((user: User | null) => {
    if (!user || !data.interactive_content?.poll) return null;

    try {
      const poll = data.interactive_content.poll;
      return (
        <View style={styles.pollContainer}>
          <Text style={styles.pollQuestion}>{poll.question}</Text>
          {poll.options.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.pollOption}
              disabled={!user || poll.settings?.requireAuth}
            >
              <Text style={styles.pollOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          {!user && <Text style={styles.authRequiredText}>Sign in to vote</Text>}
        </View>
      );
    } catch (error) {
      console.error('Error rendering poll:', error);
      return null;
    }
  }, [data.interactive_content?.poll]);

  const renderQuiz = useCallback((user: User | null) => {
    if (!user || !data.interactive_content?.quiz?.settings) return null;

    try {
      const quiz = data.interactive_content.quiz;
      return (
        <View style={styles.quizContainer}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.quizDescription}>{quiz.description}</Text>
          {!user && <Text style={styles.authRequiredText}>Sign in to take quiz</Text>}
        </View>
      );
    } catch (error) {
      console.error('Error rendering quiz:', error);
      return null;
    }
  }, [data.interactive_content?.quiz]);

  const renderSurvey = useCallback((user: User | null) => {
    if (!user || !data.interactive_content?.survey?.settings) return null;

    try {
      const survey = data.interactive_content.survey;
      return (
        <View style={styles.surveyContainer}>
          <Text style={styles.surveyTitle}>{survey.title}</Text>
          <Text style={styles.surveyDescription}>{survey.description}</Text>
          {!user && <Text style={styles.authRequiredText}>Sign in to take survey</Text>}
        </View>
      );
    } catch (error) {
      console.error('Error rendering survey:', error);
      return null;
    }
  }, [data.interactive_content?.survey]);

  return {
    renderHeader,
    renderFooter,
    renderPoll,
    renderQuiz,
    renderSurvey,
  };
} 