import { MediaLayout } from '~/lib/enhanced-chat/types/superfeed';

export const MEDIA_LAYOUTS: MediaLayout[] = ['grid', 'carousel', 'list', 'collage', 'masonry', 'fullwidth'];

export const getMediaLayoutLabel = (layout: MediaLayout): string => {
  return layout.charAt(0).toUpperCase() + layout.slice(1);
};

export const getMediaLayoutIcon = (layout: MediaLayout): string => {
  switch (layout) {
    case 'grid':
      return 'grid';
    case 'carousel':
      return 'slideshow';
    case 'list':
      return 'list';
    case 'collage':
      return 'view-comfy';
    case 'masonry':
      return 'view-quilt';
    case 'fullwidth':
      return 'view-stream';
    default:
      return 'grid';
  }
}; 