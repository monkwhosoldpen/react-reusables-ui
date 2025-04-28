import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';

export const calculateMaxHeight = (formData: FormDataType): number => {
  const baseMaxHeight = formData.metadata?.isCollapsible ? 400 : 600;
  const mediaMaxHeight = formData.media?.length ? 500 : baseMaxHeight;
  return Math.min(mediaMaxHeight, formData.metadata?.maxHeight ?? baseMaxHeight);
};

export const logHeightCalculation = (formData: FormDataType): void => {
  const maxHeight = calculateMaxHeight(formData);
  console.log('Height Calculation:', {
    isCollapsible: formData.metadata?.isCollapsible,
    baseMaxHeight: formData.metadata?.isCollapsible ? 400 : 600,
    mediaMaxHeight: formData.media?.length ? 500 : (formData.metadata?.isCollapsible ? 400 : 600),
    forcedMaxHeight: maxHeight,
    hasMedia: !!formData.media?.length
  });
}; 