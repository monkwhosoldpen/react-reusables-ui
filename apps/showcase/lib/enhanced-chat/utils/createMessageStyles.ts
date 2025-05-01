import { StyleSheet } from 'react-native';
import { ColorSchemeConfig } from '~/lib/core/themes/types';

export const createMessageStyles = (colorScheme: ColorSchemeConfig) => StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  leftSection: {
    flex: 0.3,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colorScheme.colors.border,
    paddingRight: 16,
  },
  centerSection: {
    flex: 0.3,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colorScheme.colors.border,
    paddingRight: 16,
  },
  centerScroll: {
    flex: 1,
    padding: 16,
  },
  previewContainer: {
    flex: 1,
  },
  previewScroll: {
    flex: 1,
  },
  previewCard: {
    padding: 16,
    marginBottom: 16,
  },
  rightSection: {
    flex: 0.4,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: colorScheme.colors.notification,
    margin: 8,
    borderRadius: 8,
  },
  errorText: {
    color: colorScheme.colors.text,
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colorScheme.colors.border,
  },
  quickActionButton: {
    flex: 1,
    minWidth: 120,
  },
  formScroll: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colorScheme.colors.card,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colorScheme.colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colorScheme.colors.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: colorScheme.colors.background,
    color: colorScheme.colors.text,
  },
  interactiveSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colorScheme.colors.card,
    borderRadius: 8,
    gap: 12,
  },
  interactiveTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colorScheme.colors.text,
  },
  correctOption: {
    padding: 16,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colorScheme.colors.border,
  },
  dialogFooter: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colorScheme.colors.border,
  },
  mediaLayoutContainer: {
    marginBottom: 16,
  },
  mediaLayoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colorScheme.colors.text,
  },
  mediaLayoutButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaLayoutButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: colorScheme.colors.background,
    borderColor: colorScheme.colors.border,
  },
  selectedMediaLayoutButton: {
    backgroundColor: colorScheme.colors.primary,
    borderColor: colorScheme.colors.primary,
  },
  mediaLayoutButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mediaItemsContainer: {
    gap: 12,
    padding: 12,
    backgroundColor: colorScheme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorScheme.colors.border,
  },
  mediaItem: {
    gap: 8,
    padding: 12,
    backgroundColor: colorScheme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorScheme.colors.border,
  },
  mediaItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colorScheme.colors.text,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  mediaButton: {
    flex: 1,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorScheme.colors.border,
    backgroundColor: colorScheme.colors.background,
  },
  radioOptionSelected: {
    backgroundColor: colorScheme.colors.primary,
    borderColor: colorScheme.colors.primary,
  },
  radioText: {
    flex: 1,
    fontSize: 16,
    color: colorScheme.colors.text,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colorScheme.colors.text,
    opacity: 0.7,
    transform: [{ rotate: '-45deg' }],
  },
  messageCount: {
    fontSize: 16,
    marginTop: 16,
  },
  messageList: {
    flex: 1,
    width: '100%',
    padding: 16,
  },
  messageItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colorScheme.colors.border,
  },
  messageId: {
    fontSize: 14,
    color: colorScheme.colors.text,
  },
  messageType: {
    fontSize: 14,
    color: colorScheme.colors.text,
  },
  editButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
  },
  editButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  questionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colorScheme.colors.border,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: colorScheme.colors.background,
    color: colorScheme.colors.text,
  },
  questionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  questionSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colorScheme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorScheme.colors.border,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colorScheme.colors.text,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  removeButton: {
    padding: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  addButton: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
}); 