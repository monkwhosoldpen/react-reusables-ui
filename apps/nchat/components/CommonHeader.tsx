import { View, Text, Image, StyleSheet } from 'react-native';

export function CommonHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://placehold.co/32x32' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>nchat</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
}); 