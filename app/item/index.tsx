// app/item/index.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function ItemScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Item Master</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => Alert.alert('Add item')}
      >
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.addText}>Add Item</Text>
      </TouchableOpacity>

      <View style={styles.listPlaceholder}>
        <Text style={{ color: '#999' }}>[List of items will appear here]</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  listPlaceholder: {
    marginTop: 24,
  },
});
