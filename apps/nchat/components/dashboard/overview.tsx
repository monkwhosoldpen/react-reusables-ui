import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/providers/theme/ColorSchemeProvider';
import { useDesign } from '~/lib/providers/theme/DesignSystemProvider';
import { Card } from '~/components/ui/card';
import { Avatar } from '~/components/ui/avatar';

const projects = [
  {
    id: 1,
    title: 'Web Development',
    tasks: 10,
    progress: 96,
    members: 7,
    color: '#8B5CF6',
  },
  {
    id: 2,
    title: 'Mobile App Design',
    tasks: 12,
    progress: 48,
    members: 9,
    color: '#67E8F9',
  },
  {
    id: 3,
    title: 'Brand UI Kit',
    tasks: 22,
    progress: 73,
    members: 3,
    color: '#FB923C',
  },
];

const stats = [
  { label: 'Tracked time', value: '28h' },
  { label: 'Finished tasks', value: '18' },
  { label: 'New widgets', value: '+2' },
];

export default function OverviewScreen() {
  const { colorScheme } = useColorScheme();
  const { design } = useDesign();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colorScheme.colors.background }]}
      contentContainerStyle={{ padding: Number(design.spacing.padding.card) }}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colorScheme.colors.text }]}>
          Hello, User
        </Text>
        <Text style={[styles.date, { color: colorScheme.colors.textMuted }]}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </Text>
      </View>

      <View style={styles.projectsGrid}>
        {projects.map((project) => (
          <Card
            key={project.id}
            style={[
              styles.projectCard,
              { backgroundColor: project.color }
            ]}
          >
            <View style={styles.projectHeader}>
              <Text style={styles.projectTitle} className="text-white font-medium">
                {project.title}
              </Text>
              <View style={styles.memberCount}>
                <Text style={styles.memberText} className="text-white">
                  +{project.members}
                </Text>
              </View>
            </View>
            <Text style={styles.taskCount} className="text-white opacity-80">
              {project.tasks} tasks
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${project.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText} className="text-white">
              {project.progress}%
            </Text>
          </Card>
        ))}
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <Card
            key={index}
            style={[
              styles.statCard,
              { backgroundColor: colorScheme.colors.card }
            ]}
          >
            <Text style={[styles.statValue, { color: colorScheme.colors.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colorScheme.colors.textMuted }]}>
              {stat.label}
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  projectCard: {
    flex: 1,
    minWidth: 280,
    padding: 16,
    borderRadius: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberText: {
    fontSize: 12,
  },
  taskCount: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
}); 