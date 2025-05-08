import { FormDataType, DEFAULT_METADATA } from '~/lib/enhanced-chat/types/superfeed';

const SHORT_CONTENT_TEMPLATES = [
  "🎉 Just shipped a major update! Check out the new features.",
  "📢 Team meeting at 2 PM today. Don't forget to bring your updates!",
  "💡 Quick tip: Use keyboard shortcuts to boost productivity.",
  "🚀 New milestone reached! Thanks to everyone who contributed.",
  "📊 Weekly metrics are in - we're up 25% from last week!",
  "🎯 Just hit our quarterly target ahead of schedule.",
  "⚡ Performance improvements deployed to production.",
  "🔍 Found and fixed that tricky bug. All systems go!",
  "🌟 New team member joining next week. Welcome aboard!",
  "📱 Mobile app update now available in the store.",
  "🛠️ Maintenance complete - systems running smoothly.",
  "🎨 UI refresh coming soon. Sneak peek next week!",
  "📈 User engagement up 30% this month. Great work!",
  "🔒 Security updates implemented across all services.",
  "🌐 New regions added to our global infrastructure.",
  "⚙️ API v2.0 documentation now available.",
  "📦 Latest release includes most requested features.",
  "🎮 New developer tools launched today.",
  "🔄 System upgrade completed successfully.",
  "💪 Team productivity at an all-time high!"
];

const LONG_CONTENT_TEMPLATES = [
  `🚀 Major Platform Update Announcement

We're thrilled to announce the completion of our Q2 platform overhaul! This update brings significant improvements to performance, usability, and functionality.

Key Improvements:
• 40% faster page load times
• Redesigned dashboard interface
• Advanced analytics integration
• Improved mobile responsiveness
• New collaboration features

Special thanks to our development team for their outstanding work. We'd love to hear your feedback!`,

  `📊 Quarterly Performance Review

Our Q2 2024 results have exceeded expectations across all key metrics:

Revenue Growth: +35% YoY
User Acquisition: +28%
Platform Stability: 99.99%
Customer Satisfaction: 4.8/5

These results reflect our team's dedication and our users' trust in our platform. Looking forward to an even stronger Q3!`,

  `🎯 Project Milestone Achievement

Excited to share that we've reached a major milestone in our platform development:

✓ Completed core infrastructure upgrade
✓ Launched new API endpoints
✓ Improved security protocols
✓ Enhanced user authentication
✓ Optimized database performance

Next phase begins next week. Stay tuned for more updates!`,

  `💡 Best Practices Guide

We've compiled our top recommendations for optimal platform usage:

1. Regular data backups
2. Two-factor authentication
3. Custom alert configurations
4. Regular security audits
5. Performance monitoring

Implement these practices to get the most out of our platform.`,

  `🌟 New Feature Spotlight

Introducing our latest feature set:

• Advanced Search Capabilities
• Custom Report Builder
• Automated Workflows
• Integration Framework
• Enhanced Analytics Dashboard

Check out the documentation for detailed information.`,

  `📱 Mobile Experience Update

Our latest mobile app release brings several improvements:

- Redesigned user interface
- Offline mode support
- Push notification controls
- Performance optimizations
- Battery life improvements

Update your app to access these new features!`,

  `🛠️ Technical Infrastructure Update

We've completed major infrastructure improvements:

• Migrated to containerized architecture
• Implemented auto-scaling
• Enhanced monitoring systems
• Upgraded security protocols
• Optimized database queries

These changes will ensure better performance and reliability.`,

  `🔍 Product Research Findings

Recent user research has revealed:

- 92% satisfaction with new features
- Most used functionalities
- Common user workflows
- Areas for improvement
- Feature requests

We're using these insights to guide our roadmap.`,

  `⚡ Performance Optimization Results

Recent optimization efforts have yielded:

• 50% reduction in load times
• 30% less memory usage
• Improved API response times
• Better resource utilization
• Enhanced cache management

Users should notice significant improvements.`,

  `🌐 Global Deployment Update

We've expanded our infrastructure to new regions:

- Asia Pacific
- South America
- Eastern Europe
- Middle East
- Africa

This expansion ensures better service worldwide.`
];

// Poll templates
const POLL_TEMPLATES = [
  {
    question: "Which feature would you like to see next?",
    options: ["Dark mode", "Mobile app", "API integration", "Advanced analytics"]
  },
  {
    question: "How satisfied are you with our latest release?",
    options: ["Very satisfied", "Satisfied", "Neutral", "Unsatisfied", "Very unsatisfied"]
  },
  {
    question: "What's your preferred communication channel?",
    options: ["Email", "Slack", "Teams", "Discord", "In-person meetings"]
  },
  {
    question: "How often do you use our platform?",
    options: ["Daily", "Weekly", "Monthly", "Rarely"]
  },
  {
    question: "Which department do you work in?",
    options: ["Engineering", "Product", "Design", "Marketing", "Sales", "Support"]
  },
  {
    question: "What's your experience level with our product?",
    options: ["Beginner", "Intermediate", "Advanced", "Expert"]
  },
  {
    question: "When do you prefer team meetings?",
    options: ["Morning", "Afternoon", "Evening", "No preference"]
  },
  {
    question: "What's your primary operating system?",
    options: ["Windows", "macOS", "Linux", "Chrome OS", "Other"]
  },
  {
    question: "Which browser do you primarily use?",
    options: ["Chrome", "Firefox", "Safari", "Edge", "Other"]
  },
  {
    question: "What's your preferred development environment?",
    options: ["VS Code", "IntelliJ", "Sublime Text", "Vim", "Other"]
  }
];

// Quiz templates
const QUIZ_TEMPLATES = [
  {
    title: "Web Development Basics",
    questions: [
      {
        text: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Multi Language", "Hyper Transfer Markup Language", "Hyper Text Multiple Language"],
        correct_option: 0
      },
      {
        text: "Which of these is not a CSS preprocessor?",
        options: ["SASS", "LESS", "SCSS", "CSSP"],
        correct_option: 3
      }
    ]
  },
  {
    title: "JavaScript Fundamentals",
    questions: [
      {
        text: "Which of the following is not a JavaScript data type?",
        options: ["String", "Boolean", "Character", "Object"],
        correct_option: 2
      },
      {
        text: "What will console.log(typeof []) output?",
        options: ["array", "object", "undefined", "null"],
        correct_option: 1
      }
    ]
  },
  {
    title: "React Knowledge Check",
    questions: [
      {
        text: "What hook is used for side effects in React?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correct_option: 1
      },
      {
        text: "Which lifecycle method is NOT available in functional components?",
        options: ["componentDidMount", "useEffect", "useState", "useLayoutEffect"],
        correct_option: 0
      }
    ]
  },
  {
    title: "Git Version Control",
    questions: [
      {
        text: "What command creates a new local git repository?",
        options: ["git init", "git clone", "git start", "git create"],
        correct_option: 0
      },
      {
        text: "Which is NOT a remote repository hosting service?",
        options: ["GitHub", "GitLab", "Bitbucket", "GitStack"],
        correct_option: 3
      }
    ]
  },
  {
    title: "Database Concepts",
    questions: [
      {
        text: "Which of these is NOT a NoSQL database?",
        options: ["MongoDB", "Cassandra", "Oracle", "Firebase"],
        correct_option: 2
      },
      {
        text: "What type of SQL join returns rows that have matching values in both tables?",
        options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN"],
        correct_option: 0
      }
    ]
  }
];

// Survey templates
const SURVEY_TEMPLATES = [
  {
    title: "Product Feedback Survey",
    questions: [
      {
        text: "How would you rate the user interface?",
        options: ["Excellent", "Good", "Average", "Below Average", "Poor"]
      },
      {
        text: "How easy was it to find what you were looking for?",
        options: ["Very Easy", "Easy", "Neutral", "Difficult", "Very Difficult"]
      },
      {
        text: "What features would you like to see improved?",
        options: ["Search functionality", "Navigation", "Performance", "Mobile experience", "Documentation"]
      }
    ]
  },
  {
    title: "Team Satisfaction Survey",
    questions: [
      {
        text: "How satisfied are you with your current role?",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
      },
      {
        text: "How would you rate the team collaboration?",
        options: ["Excellent", "Good", "Average", "Below Average", "Poor"]
      },
      {
        text: "What area would you like more support in?",
        options: ["Technical skills", "Soft skills", "Project management", "Work-life balance", "Career development"]
      }
    ]
  },
  {
    title: "Development Process Feedback",
    questions: [
      {
        text: "How effective is our current sprint planning?",
        options: ["Very effective", "Effective", "Neutral", "Ineffective", "Very ineffective"]
      },
      {
        text: "How useful are our retrospective meetings?",
        options: ["Very useful", "Useful", "Somewhat useful", "Not very useful", "Not useful at all"]
      },
      {
        text: "What part of our development process needs the most improvement?",
        options: ["Planning", "Implementation", "Testing", "Deployment", "Maintenance"]
      }
    ]
  },
  {
    title: "Customer Experience Evaluation",
    questions: [
      {
        text: "How likely are you to recommend our product to others?",
        options: ["Very likely", "Likely", "Neutral", "Unlikely", "Very unlikely"]
      },
      {
        text: "How would you rate your overall experience?",
        options: ["Excellent", "Good", "Average", "Below Average", "Poor"]
      },
      {
        text: "What area of our service impressed you the most?",
        options: ["Product features", "Customer support", "Ease of use", "Performance", "Documentation"]
      }
    ]
  },
  {
    title: "Remote Work Assessment",
    questions: [
      {
        text: "How productive do you feel working remotely?",
        options: ["Very productive", "Productive", "Same as office", "Less productive", "Much less productive"]
      },
      {
        text: "What's your biggest challenge with remote work?",
        options: ["Communication", "Work-life balance", "Technical issues", "Distractions", "Collaboration"]
      },
      {
        text: "How satisfied are you with the remote work tools provided?",
        options: ["Very satisfied", "Satisfied", "Neutral", "Unsatisfied", "Very unsatisfied"]
      }
    ]
  }
];

export function generateBulkShortMessages(count: number): FormDataType[] {
  return Array.from({ length: count }, (_, i) => ({
    type: 'all',
    content: SHORT_CONTENT_TEMPLATES[i % SHORT_CONTENT_TEMPLATES.length],
    media: [],
    metadata: {
      ...DEFAULT_METADATA,
      isCollapsible: true,
      mediaLayout: 'grid',
      visibility: {
        ...DEFAULT_METADATA.visibility,
        footer: false
      }
    }
  }));
}

export function generateBulkLongMessages(count: number): FormDataType[] {
  return Array.from({ length: count }, (_, i) => ({
    type: 'all',
    content: LONG_CONTENT_TEMPLATES[i % LONG_CONTENT_TEMPLATES.length],
    media: [],
    metadata: {
      ...DEFAULT_METADATA,
      isCollapsible: true,
      mediaLayout: 'grid',
      visibility: {
        ...DEFAULT_METADATA.visibility,
        footer: false
      }
    }
  }));
}

export function generateBulkPollMessages(count: number): FormDataType[] {
  return Array.from({ length: count }, (_, i) => ({
    type: 'poll',
    content: `Poll: ${POLL_TEMPLATES[i % POLL_TEMPLATES.length].question}`,
    media: [],
    metadata: {
      ...DEFAULT_METADATA,
      isCollapsible: true,
      mediaLayout: 'grid',
      interactiveType: 'poll',
      visibility: {
        ...DEFAULT_METADATA.visibility,
        footer: false
      }
    },
    interactive_content: {
      poll: POLL_TEMPLATES[i % POLL_TEMPLATES.length]
    }
  }));
}

export function generateBulkQuizMessages(count: number): FormDataType[] {
  return Array.from({ length: count }, (_, i) => ({
    type: 'quiz',
    content: `Quiz: ${QUIZ_TEMPLATES[i % QUIZ_TEMPLATES.length].title}`,
    media: [],
    metadata: {
      ...DEFAULT_METADATA,
      isCollapsible: true,
      mediaLayout: 'grid',
      interactiveType: 'quiz',
      visibility: {
        ...DEFAULT_METADATA.visibility,
        footer: false
      }
    },
    interactive_content: {
      quiz: QUIZ_TEMPLATES[i % QUIZ_TEMPLATES.length]
    }
  }));
}

export function generateBulkSurveyMessages(count: number): FormDataType[] {
  return Array.from({ length: count }, (_, i) => ({
    type: 'survey',
    content: `Survey: ${SURVEY_TEMPLATES[i % SURVEY_TEMPLATES.length].title}`,
    media: [],
    metadata: {
      ...DEFAULT_METADATA,
      isCollapsible: true,
      mediaLayout: 'grid',
      interactiveType: 'survey',
      visibility: {
        ...DEFAULT_METADATA.visibility,
        footer: false
      }
    },
    interactive_content: {
      survey: SURVEY_TEMPLATES[i % SURVEY_TEMPLATES.length]
    }
  }));
} 