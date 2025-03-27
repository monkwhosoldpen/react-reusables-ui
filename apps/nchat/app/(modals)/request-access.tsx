import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import RequestAccessForm from '~/components/forms/RequestAccessForm';

export default function RequestAccessModal() {
  const params = useLocalSearchParams();
  const username = params.username as string;

  const handleComplete = () => {
    router.push({
      pathname: '/[username]',
      params: { username }
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Request Access</Text>
      </View>
      
      <RequestAccessForm 
        username={username}
        onComplete={handleComplete}
        onBack={handleBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
}); 