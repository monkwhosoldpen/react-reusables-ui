import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';

export const calculateMaxHeight = (formData: FormDataType): number => {
  return formData.metadata?.isCollapsible ? 300 : Infinity;
};

export const logHeightCalculation = (formData: FormDataType): void => {
  const maxHeight = calculateMaxHeight(formData);
  console.log('Height Calculation:', {
    isCollapsible: formData.metadata?.isCollapsible,
    maxHeight,
    hasMedia: !!formData.media?.length
  });
}; 