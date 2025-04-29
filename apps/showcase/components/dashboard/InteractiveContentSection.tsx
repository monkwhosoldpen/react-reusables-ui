import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
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

  const renderPollContent = () => (
    <View className="mt-4 p-4 bg-card rounded-lg gap-3">
      <Text className="text-lg font-semibold">Poll Settings</Text>
      <TextInput
        className="p-3 border border-border rounded-lg bg-background text-base"
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
        <View key={index} className="flex-row gap-2">
          <TextInput
            className="flex-1 p-3 border border-border rounded-lg bg-background text-base"
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
            className="p-3 rounded-lg bg-destructive"
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
            <Text className="text-white font-medium">Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        className="p-3 rounded-lg bg-primary"
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
        <Text className="text-white font-medium text-center">Add Option</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuizContent = () => (
    <View className="mt-4 p-4 bg-card rounded-lg gap-3">
      <Text className="text-lg font-semibold">Quiz Settings</Text>
      <TextInput
        className="p-3 border border-border rounded-lg bg-background text-base"
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
        <View key={qIndex} className="p-3 bg-background rounded-lg border border-border">
          <Text className="text-base font-medium mb-2">Question {qIndex + 1}</Text>
          <TextInput
            className="p-3 border border-border rounded-lg bg-background text-base mb-2"
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
            <View key={oIndex} className="flex-row gap-2 mb-2">
              <TextInput
                className="flex-1 p-3 border border-border rounded-lg bg-background text-base"
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
                className="p-3 rounded-lg bg-destructive"
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
                <Text className="text-white font-medium">Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View className="flex-row items-center gap-2 mb-2">
            <Text>Correct Option:</Text>
            <TextInput
              className="w-12 p-3 border border-border rounded-lg bg-background text-base"
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
            className="p-3 rounded-lg bg-destructive"
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
            <Text className="text-white font-medium text-center">Remove Question</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        className="p-3 rounded-lg bg-primary"
        onPress={() => {
          const newQuestions = [
            ...(formData.interactive_content?.quiz?.questions || []),
            {
              text: '',
              options: [''],
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
        <Text className="text-white font-medium text-center">Add Question</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSurveyContent = () => (
    <View className="mt-4 p-4 bg-card rounded-lg gap-3">
      <Text className="text-lg font-semibold">Survey Settings</Text>
      <TextInput
        className="p-3 border border-border rounded-lg bg-background text-base"
        value={formData.interactive_content?.survey?.title}
        onChangeText={(text) => onFormDataChange({
          interactive_content: {
            ...formData.interactive_content,
            survey: { ...formData.interactive_content?.survey, title: text }
          }
        })}
        placeholder="Enter survey title"
      />
      {(formData.interactive_content?.survey?.questions || []).map((question, qIndex) => (
        <View key={qIndex} className="p-3 bg-background rounded-lg border border-border">
          <Text className="text-base font-medium mb-2">Question {qIndex + 1}</Text>
          <TextInput
            className="p-3 border border-border rounded-lg bg-background text-base mb-2"
            value={question.text}
            onChangeText={(text) => {
              const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
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
          <TouchableOpacity
            className="p-3 rounded-lg bg-destructive"
            onPress={() => {
              const newQuestions = [...(formData.interactive_content?.survey?.questions || [])];
              newQuestions.splice(qIndex, 1);
              onFormDataChange({
                interactive_content: {
                  ...formData.interactive_content,
                  survey: { ...formData.interactive_content?.survey, questions: newQuestions }
                }
              });
            }}
          >
            <Text className="text-white font-medium text-center">Remove Question</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        className="p-3 rounded-lg bg-primary"
        onPress={() => {
          const newQuestions = [
            ...(formData.interactive_content?.survey?.questions || []),
            { text: '', options: ['', ''] }
          ];
          onFormDataChange({
            interactive_content: {
              ...formData.interactive_content,
              survey: { ...formData.interactive_content?.survey, questions: newQuestions }
            }
          });
        }}
      >
        <Text className="text-white font-medium text-center">Add Question</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
        {INTERACTIVE_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            className={`flex-1 p-3 rounded-lg border ${
              selectedInteractiveType === type ? 'bg-primary border-primary' : 'bg-background border-border'
            }`}
            onPress={() => onTypeChange(type)}
          >
            <Text className={`text-sm font-medium text-center ${
              selectedInteractiveType === type ? 'text-white' : 'text-foreground'
            }`}>
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