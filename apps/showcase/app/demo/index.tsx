import { PREMIUM_CONFIGS } from '~/lib/in-app-db/states/telangana/premium-data';
import { Link } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function DashboardRoute() {
  const users = Object.keys(PREMIUM_CONFIGS);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select User Dashboard</Text>
      <View style={styles.cardContainer}>
        {users.map((username) => (
          <Link key={username} href={`/dashboard/${username}`} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{username}</Text>
              <Text style={styles.cardSubtitle}>Click to view dashboard</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});


