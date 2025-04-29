import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
import { createMessageStyles } from '~/lib/utils/createMessageStyles';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { INTERACTIVE_TYPES } from '~/lib/utils/quickActionTemplates';

interface InteractiveContentSectionProps {
  formData: FormDataType;
  selectedInteractiveType: typeof INTERACTIVE_TYPES[number];
  onTypeChange: (type: typeof INTERACTIVE_TYPES[number]) => void;
  onFormDataChange: (updates: Partial<FormDataType>) => void;
}

export const InteractiveContentSection: React.FC<InteractiveContentSectionProps> = ({
  formData,
  selectedInteractiveType,
  onTypeChange,
  onFormDataChange
}) => {
  const { colorScheme } = useColorScheme();
  const styles = createMessageStyles(colorScheme);

  const renderPollContent = () => (
    <View style={styles.interactiveSection}>
      <Text style={styles.sectionTitle}>Poll Settings</Text>
      <TextInput
        style={styles.input}
        value={formData.interactive_content?.poll?.question}
        onChangeText={(text) => onFormDataChange({
          interactive_content: {
            ...formData.interactive_content,
            poll: { ...formData.interactive_content?.poll, question: text }
          }
        })}
        placeholder="Enter poll question"
      />
      {formData.interactive_content?.poll?.options.map((option, index) => (
        <View key={index} style={styles.optionRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={option}
            onChangeText={(text) => {
              const newOptions = [...(formData.interactive_content?.poll?.options || [])];
              newOptions[index] = text;
              onFormDataChange({
                interactive_content: {
                  ...formData.interactive_content,
                  poll: { ...formData.interactive_content?.poll, options: newOptions }
                }
              });
            }}
            placeholder={`Option ${index + 1}`}
          />
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colorScheme.colors.destructive }]}
            onPress={() => {
              const newOptions = [...(formData.interactive_content?.poll?.options || [])];
              newOptions.splice(index, 1);
              onFormDataChange({
                interactive_content: {
                  ...formData.interactive_content,
                  poll: { ...formData.interactive_content?.poll, options: newOptions }
                }
              });
            }}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colorScheme.colors.primary }]}
        onPress={() => {
          const newOptions = [...(formData.interactive_content?.poll?.options || []), ''];
          onFormDataChange({
            interactive_content: {
              ...formData.interactive_content,
              poll: { ...formData.interactive_content?.poll, options: newOptions }
            }
          });
        }}
      >
        <Text style={styles.addButtonText}>Add Option</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuizContent = () => (
    <View style={styles.interactiveSection}>
      <Text style={styles.sectionTitle}>Quiz Settings</Text>
      <TextInput
        style={styles.input}
        value={formData.interactive_content?.quiz?.title}
        onChangeText={(text) => onFormDataChange({
          interactive_content: {
            ...formData.interactive_content,
            quiz: { ...formData.interactive_content?.quiz, title: text }
          }
        })}
        placeholder="Enter quiz title"
      />
      {(formData.interactive_content?.quiz?.questions || []).map((question, qIndex) => (
        <View key={qIndex} style={styles.questionSection}>
          <Text style={styles.questionTitle}>Question {qIndex + 1}</Text>
          <TextInput
            style={styles.input}
            value={question.text}
            onChangeText={(text) => {
              const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
              newQuestions[qIndex] = { ...question, text };
              onFormDataChange({
                interactive_content: {
                  ...formData.interactive_content,
                  quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                }
              });
            }}
            placeholder="Question Text"
            multiline
          />
          {(question.options || []).map((option, oIndex) => (
            <View key={oIndex} style={styles.optionRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={option}
                onChangeText={(text) => {
                  const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                  const newOptions = [...(question.options || [])];
                  newOptions[oIndex] = text;
                  newQuestions[qIndex] = { ...question, options: newOptions };
                  onFormDataChange({
                    interactive_content: {
                      ...formData.interactive_content,
                      quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                    }
                  });
                }}
                placeholder={`Option ${oIndex + 1}`}
              />
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colorScheme.colors.destructive }]}
                onPress={() => {
                  const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                  const newOptions = [...(question.options || [])];
                  newOptions.splice(oIndex, 1);
                  newQuestions[qIndex] = { ...question, options: newOptions };
                  onFormDataChange({
                    interactive_content: {
                      ...formData.interactive_content,
                      quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                    }
                  });
                }}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.correctOptionRow}>
            <Text style={{ color: colorScheme.colors.text }}>Correct Option:</Text>
            <TextInput
              style={[styles.input, { width: 50 }]}
              value={question.correct_option?.toString() || '0'}
              onChangeText={(text) => {
                const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
                newQuestions[qIndex] = { ...question, correct_option: parseInt(text) || 0 };
                onFormDataChange({
                  interactive_content: {
                    ...formData.interactive_content,
                    quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                  }
                });
              }}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colorScheme.colors.destructive }]}
            onPress={() => {
              const newQuestions = [...(formData.interactive_content?.quiz?.questions || [])];
              newQuestions.splice(qIndex, 1);
              onFormDataChange({
                interactive_content: {
                  ...formData.interactive_content,
                  quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
                }
              });
            }}
          >
            <Text style={styles.removeButtonText}>Remove Question</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colorScheme.colors.primary }]}
        onPress={() => {
          const newQuestions = [
            ...(formData.interactive_content?.quiz?.questions || []),
            {
              text: 'New Question',
              options: ['Option 1', 'Option 2'],
              correct_option: 0
            }
          ];
          onFormDataChange({
            interactive_content: {
              ...formData.interactive_content,
              quiz: { ...formData.interactive_content?.quiz, questions: newQuestions }
            }
          });
        }}
      >
        <Text style={styles.addButtonText}>Add Question</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSurveyContent = () => {
    const questions = formData.interactive_content?.survey?.questions || [];
    
    return (
      <View style={styles.interactiveSection}>
        <Text style={styles.sectionTitle}>Survey Settings</Text>
        <TextInput
          style={styles.input}
          value={formData.interactive_content?.survey?.title}
          onChangeText={(text) => onFormDataChange({
            interactive_content: {
              ...formData.interactive_content,
              survey: { ...formData.interactive_content?.survey, title: text }
            }
          })}
          placeholder="Enter survey title"
        />
        {questions.map((question, qIndex) => (
          <View key={qIndex} style={styles.questionSection}>
            <Text style={styles.questionTitle}>Question {qIndex + 1}</Text>
            <TextInput
              style={styles.input}
              value={question.text}
              onChangeText={(text) => {
                const newQuestions = [...questions];
                newQuestions[qIndex] = { ...question, text };
                onFormDataChange({
                  interactive_content: {
                    ...formData.interactive_content,
                    survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                  }
                });
              }}
              placeholder="Question Text"
              multiline
            />
            {(question.options || []).map((option, oIndex) => (
              <View key={oIndex} style={styles.optionRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={option}
                  onChangeText={(text) => {
                    const newQuestions = [...questions];
                    const newOptions = [...(question.options || [])];
                    newOptions[oIndex] = text;
                    newQuestions[qIndex] = { ...question, options: newOptions };
                    onFormDataChange({
                      interactive_content: {
                        ...formData.interactive_content,
                        survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                      }
                    });
                  }}
                  placeholder={`Option ${oIndex + 1}`}
                />
                <TouchableOpacity
                  style={[styles.removeButton, { backgroundColor: colorScheme.colors.destructive }]}
                  onPress={() => {
                    const newQuestions = [...questions];
                    const newOptions = [...(question.options || [])];
                    newOptions.splice(oIndex, 1);
                    newQuestions[qIndex] = { ...question, options: newOptions };
                    onFormDataChange({
                      interactive_content: {
                        ...formData.interactive_content,
                        survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                      }
                    });
                  }}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colorScheme.colors.primary }]}
              onPress={() => {
                const newQuestions = [...questions];
                const newOptions = [...(question.options || []), ''];
                newQuestions[qIndex] = { ...question, options: newOptions };
                onFormDataChange({
                  interactive_content: {
                    ...formData.interactive_content,
                    survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                  }
                });
              }}
            >
              <Text style={styles.addButtonText}>Add Option</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: colorScheme.colors.destructive }]}
              onPress={() => {
                const newQuestions = [...questions];
                newQuestions.splice(qIndex, 1);
                onFormDataChange({
                  interactive_content: {
                    ...formData.interactive_content,
                    survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                  }
                });
              }}
            >
              <Text style={styles.removeButtonText}>Remove Question</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colorScheme.colors.primary }]}
          onPress={() => {
            const newQuestions = [
              ...questions,
              {
                text: 'New Question',
                options: ['Option 1', 'Option 2']
              }
            ];
            onFormDataChange({
              interactive_content: {
                ...formData.interactive_content,
                survey: { ...formData.interactive_content?.survey, questions: newQuestions }
              }
            });
          }}
        >
          <Text style={styles.addButtonText}>Add Question</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Interactive Content</Text>
      <View style={styles.radioGroup}>
        {INTERACTIVE_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.radioOption,
              selectedInteractiveType === type && styles.radioOptionSelected
            ]}
            onPress={() => onTypeChange(type)}
          >
            <Text style={[
              styles.radioText,
              { color: selectedInteractiveType === type ? '#fff' : colorScheme.colors.text }
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedInteractiveType === 'poll' && renderPollContent()}
      {selectedInteractiveType === 'quiz' && renderQuizContent()}
      {selectedInteractiveType === 'survey' && renderSurveyContent()}
    </View>
  );
}; 