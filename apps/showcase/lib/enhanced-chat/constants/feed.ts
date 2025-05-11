export const FEED_CONSTANTS = {
  // Content limits
  MAX_CONTENT_LENGTH: 5000,
  MAX_TITLE_LENGTH: 200,
  MAX_QUESTION_LENGTH: 500,
  MAX_OPTION_LENGTH: 200,
  
  // Media limits
  MAX_MEDIA_COUNT: 3,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_DIMENSION: 2048,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  
  // Poll limits
  MAX_POLL_OPTIONS: 10,
  MIN_POLL_OPTIONS: 2,
  
  // Quiz limits
  MAX_QUIZ_QUESTIONS: 50,
  MIN_QUIZ_OPTIONS: 2,
  MAX_QUIZ_OPTIONS: 6,
  MAX_QUIZ_TIME_LIMIT: 3600, // 1 hour in seconds
  MIN_QUIZ_TIME_LIMIT: 10, // 10 seconds
  MAX_QUIZ_POINTS: 100,
  MIN_QUIZ_POINTS: 1,
  MIN_PASSING_SCORE: 0,
  MAX_PASSING_SCORE: 100,
  
  // Pagination
  FEED_PAGE_SIZE: 20,
  
  // Default values
  DEFAULT_MAX_HEIGHT: 300, // Fixed height for collapsible content
  DEFAULT_QUIZ_TIME_LIMIT: 30,
  DEFAULT_QUIZ_POINTS: 10,
  DEFAULT_POLL_DURATION: 24,
} as const; 