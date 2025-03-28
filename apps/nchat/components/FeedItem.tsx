import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { FormDataType } from '~/lib/enhanced-chat/types/superfeed';

interface FeedItemProps {
  data: FormDataType;
}

export default function FeedItem({ data }: FeedItemProps) {
  const { metadata, stats } = data;
  const timestamp = metadata?.timestamp || new Date().toLocaleString();
  const { views = 0, likes = 0, shares = 0, responses = 0 } = stats || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{data.channel_username}</Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.contentText}>{data.content}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.stats}>
          <Text style={styles.statText}>{views} views</Text>
          <Text style={styles.statText}>{likes} likes</Text>
          <Text style={styles.statText}>{shares} shares</Text>
          <Text style={styles.statText}>{responses} responses</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171a',
  },
  timestamp: {
    fontSize: 14,
    color: '#657786',
  },
  content: {
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#14171a',
    lineHeight: 22,
  },
  footer: {
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 14,
    color: '#657786',
  },
}); 