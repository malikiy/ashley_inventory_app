import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report Page</Text>

      <View style={styles.filters}>
        <TextInput placeholder="Hotel Code" style={styles.input} />
        <TextInput placeholder="Department Code" style={styles.input} />
        <TextInput placeholder="Status" style={styles.input} />
      </View>

      <View style={styles.reportTable}>
        <Text style={{ color: '#999' }}>[Table or report grid will appear here]</Text>
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
  filters: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  reportTable: {
    padding: 24,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
