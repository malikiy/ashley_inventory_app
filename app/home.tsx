import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        router.replace('/');
      } else {
        setToken(storedToken);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    Alert.alert('Logged out');
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!token) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.welcome}>Hi, Welcome 👋</Text>
        <Text style={styles.subheader}>Manage your inventory effectively</Text>
      </View>

      <View style={styles.featureCard}>
        <Feather name="box" size={40} color="#0066CC" />
        <Text style={styles.featureTitle}>Item Master</Text>
        <Text style={styles.featureDesc}>Add, edit and manage inventory items.</Text>
        <TouchableOpacity style={styles.goBtn} onPress={() => router.push('/item')}>
          <Text style={styles.goText}>Go to Items</Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.featureCard}>
        <MaterialIcons name="assessment" size={40} color="#0066CC" />
        <Text style={styles.featureTitle}>Reports</Text>
        <Text style={styles.featureDesc}>View, filter and export item reports.</Text>
        <TouchableOpacity style={styles.goBtn} onPress={() => router.push('/report')}>
          <Text style={styles.goText}>Go to Reports</Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Feather name="log-out" size={18} color="#FFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F2F4F8',
    flexGrow: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  featureCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    color: '#222',
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  goBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  goText: {
    color: '#FFF',
    marginRight: 6,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF4D4F',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: '600',
  },
});
