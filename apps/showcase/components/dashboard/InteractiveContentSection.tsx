import React from 'react';
import { View, TextInput, TouchableOpacity, useColorScheme } from 'react-native';
import { Text } from '~/components/ui/text';
import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';
import { INTERACTIVE_TYPES } from '~/lib/enhanced-chat/utils/quickActionTemplates';
import { MaterialIcons } from "@expo/vector-icons";

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
  const colorScheme = useColorScheme();

  // Color scheme based styles
  const iconColor = colorScheme === 'dark' ? '#fff' : '#111827';
  const bgColor = colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const cardBg = colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = colorScheme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const textColor = colorScheme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const subtitleColor = colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600';

  const renderPollContent = () => (
    <View className={`mt-4 p-4 ${cardBg} rounded-xl shadow-sm gap-3`}>
      <Text className={`text-lg font-semibold ${textColor}`}>Poll Settings</Text>
      <TextInput
        className={`p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
        value={formData.interactive_content?.poll?.question}
        onChangeText={(text) => onFormDataChange({
          interactive_content: {
            ...formData.interactive_content,
            poll: { ...formData.interactive_content?.poll, question: text }
          }
        })}
        placeholder="Enter poll question"
        placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
      />
      {formData.interactive_content?.poll?.options.map((option, index) => (
        <View key={index} className="flex-row gap-2">
          <TextInput
            className={`flex-1 p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
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
            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
          />
          <TouchableOpacity
            className="p-3 rounded-lg bg-red-500"
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
            <MaterialIcons name="delete" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        className="p-3 rounded-lg bg-blue-500"
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
    <View className={`mt-4 p-4 ${cardBg} rounded-xl shadow-sm gap-3`}>
      <Text className={`text-lg font-semibold ${textColor}`}>Quiz Settings</Text>
      <TextInput
        className={`p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
        value={formData.interactive_content?.quiz?.title}
        onChangeText={(text) => onFormDataChange({
          interactive_content: {
            ...formData.interactive_content,
            quiz: { ...formData.interactive_content?.quiz, title: text }
          }
        })}
        placeholder="Enter quiz title"
        placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
      />
      {(formData.interactive_content?.quiz?.questions || []).map((question, qIndex) => (
        <View key={qIndex} className={`p-3 ${bgColor} rounded-lg border ${borderColor}`}>
          <Text className={`text-base font-medium mb-2 ${textColor}`}>Question {qIndex + 1}</Text>
          <TextInput
            className={`p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor} mb-2`}
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
            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            multiline
          />
          {(question.options || []).map((option, oIndex) => (
            <View key={oIndex} className="flex-row gap-2 mb-2">
              <TextInput
                className={`flex-1 p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
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
                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
              />
              <TouchableOpacity
                className="p-3 rounded-lg bg-red-500"
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
                <MaterialIcons name="delete" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
          <View className="flex-row items-center gap-2 mb-2">
            <Text className={textColor}>Correct Option:</Text>
            <TextInput
              className={`w-12 p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
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
              placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            />
          </View>
          <TouchableOpacity
            className="p-3 rounded-lg bg-red-500"
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
        className="p-3 rounded-lg bg-blue-500"
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
    <View className={`mt-4 p-4 ${cardBg} rounded-xl shadow-sm gap-3`}>
      <Text className={`text-lg font-semibold ${textColor}`}>Survey Settings</Text>
      <TextInput
        className={`p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor}`}
        value={formData.interactive_content?.survey?.title}
        onChangeText={(text) => onFormDataChange({
          interactive_content: {
            ...formData.interactive_content,
            survey: { ...formData.interactive_content?.survey, title: text }
          }
        })}
        placeholder="Enter survey title"
        placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
      />
      {(formData.interactive_content?.survey?.questions || []).map((question, qIndex) => (
        <View key={qIndex} className={`p-3 ${bgColor} rounded-lg border ${borderColor}`}>
          <Text className={`text-base font-medium mb-2 ${textColor}`}>Question {qIndex + 1}</Text>
          <TextInput
            className={`p-3 border ${borderColor} rounded-lg ${bgColor} ${textColor} mb-2`}
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
            placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            multiline
          />
          <TouchableOpacity
            className="p-3 rounded-lg bg-red-500"
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
        className="p-3 rounded-lg bg-blue-500"
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
              selectedInteractiveType === type 
                ? 'bg-blue-500 border-blue-500' 
                : `${bgColor} ${borderColor}`
            }`}
            onPress={() => onTypeChange(type)}
          >
            <Text className={`text-sm font-medium text-center ${
              selectedInteractiveType === type ? 'text-white' : textColor
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