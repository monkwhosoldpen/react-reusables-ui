import { FormDataType } from '~/lib/enhanced-chat/types/superfeed';

// Constants for component heights - adjusted for WhatsApp-like appearance
const WHATSAPP_STYLE_HEIGHT = 80; // Base height for collapsed messages
const HEADER_HEIGHT = 40; // Reduced header height
const CONTENT_PADDING = 16; // Reduced padding (8px top + 8px bottom)
const FOOTER_HEIGHT = 32; // Height for footer elements

export const calculateMaxHeight = (formData: FormDataType): number => {
  if (!formData.metadata?.isCollapsible) {
    return Infinity;
  }

  // For collapsed state, use WhatsApp-style height
  const totalHeight = WHATSAPP_STYLE_HEIGHT +
    (formData.metadata?.visibility?.header ? HEADER_HEIGHT : 0) +
    (formData.metadata?.visibility?.footer ? FOOTER_HEIGHT : 0);

  return totalHeight;
};

export const logHeightCalculation = (formData: FormDataType): void => {
  const maxHeight = calculateMaxHeight(formData);
  console.log('Height Calculation:', {
    isCollapsible: formData.metadata?.isCollapsible,
    maxHeight,
    hasHeader: formData.metadata?.visibility?.header,
    hasFooter: formData.metadata?.visibility?.footer,
    hasMedia: !!formData.media?.length,
    whatsappStyleHeight: WHATSAPP_STYLE_HEIGHT,
    headerHeight: formData.metadata?.visibility?.header ? HEADER_HEIGHT : 0,
    footerHeight: formData.metadata?.visibility?.footer ? FOOTER_HEIGHT : 0,
    contentPadding: CONTENT_PADDING,
  });
}; 