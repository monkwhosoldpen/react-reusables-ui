import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export type ChatItemProps = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
};

const ChatItem: React.FC<ChatItemProps> = ({ name, avatar, lastMessage, lastMessageTime, unreadCount, isOnline }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage}</Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.lastMessageTime}>{lastMessageTime}</Text>
        {unreadCount > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadText}>{unreadCount}</Text></View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  lastMessage: {
    color: '#555',
    fontSize: 14,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  lastMessageTime: {
    color: '#999',
    fontSize: 12,
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginTop: 5,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default ChatItem; 