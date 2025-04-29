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

export function generateBulkShortMessages(count: number): FormDataType[] {
  return Array.from({ length: count }, (_, i) => ({
    type: 'all',
    content: SHORT_CONTENT_TEMPLATES[i % SHORT_CONTENT_TEMPLATES.length],
    media: [],
    metadata: {
      ...DEFAULT_METADATA,
      isCollapsible: false,
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