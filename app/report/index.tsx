import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getReport, exportReportCSV } from '../../services/item.services';

interface Item {
  id: number;
  asset_name: string;
  asset_id: string;
  hotel_code: string;
  department_code: string;
  status: string;
}

const hotelOptions = [
  'HO', 'AS1', 'AS2', 'AS3', 'AS4', 'AS5', 'AS6',
  'ST1', 'JU1', 'JU2', 'YB1', 'YB2', 'YB3',
].map(val => ({ label: val, value: val }));

const departmentOptions = [
  'AG', 'HR', 'IT', 'MAR', 'REV', 'RES', 'PUR',
  'SAL', 'FO', 'HK', 'ENG', 'BQT', 'SEC',
].map(val => ({ label: val, value: val }));

const statusOptions = [
  { label: 'Fixed Asset', value: 'Fixed Asset' },
  { label: 'Leased Asset', value: 'Leased Asset' },
  { label: 'Disposal Asset', value: 'Disposal Asset' },
];

export default function ReportScreen() {
  const [filters, setFilters] = useState({
    hotel_code: '',
    department_code: '',
    status: '',
  });

  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!filters.hotel_code && !filters.department_code && !filters.status) {
      Alert.alert('Info', 'Please at least choose 1 filter');
      return;
    }

    try {
      setLoading(true);
      const res = await getReport(filters);
      setData(res?.data || []);
      setReportGenerated(true);
    } catch (err) {
      Alert.alert('Error', 'Failed to preview');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const ids = data.map((item: Item) => item.id);
      const res = await exportReportCSV(ids);

      const reader = new FileReader();

      reader.onload = async () => {
        const result = reader.result as string | null;
        if (!result) {
          Alert.alert('Error', 'Failed to read csv file');
          return;
        }

        const base64 = result.split(',')[1];
        const fileUri = FileSystem.documentDirectory + 'report.csv';

        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Sukses', `CSV saved on ${fileUri}`);
        }
      };

      reader.onerror = () => {
        Alert.alert('Error', 'Failed to read CSV');
      };

      reader.readAsDataURL(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to export CSV');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.asset_name}</Text>
      <Text style={styles.cardText}>Asset ID: {item.asset_id}</Text>
      <Text style={styles.cardText}>
        Hotel: {item.hotel_code} | Dept: {item.department_code}
      </Text>
      <Text style={styles.cardText}>Status: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report Page</Text>

      <View style={styles.filters}>
        <Text style={styles.label}>Hotel Code</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filters.hotel_code}
            onValueChange={(val) => handleChange('hotel_code', val)}
            style={styles.picker}
          >
            <Picker.Item label="Select Hotel Code" value="" />
            {hotelOptions.map(opt => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Department Code</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filters.department_code}
            onValueChange={(val) => handleChange('department_code', val)}
            style={styles.picker}
          >
            <Picker.Item label="Select Department" value="" />
            {departmentOptions.map(opt => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filters.status}
            onValueChange={(val) => handleChange('status', val)}
            style={styles.picker}
          >
            <Picker.Item label="Select Status" value="" />
            {statusOptions.map(opt => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGenerate}>
        <Text style={styles.buttonText}>Preview</Text>
      </TouchableOpacity>

      {reportGenerated && data.length > 0 && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#28A745' }]}
          onPress={handleExportCSV}
        >
          <Text style={styles.buttonText}>Export as CSV</Text>
        </TouchableOpacity>
      )}

      <View style={styles.reportTable}>
        {reportGenerated ? (
          loading ? (
            <Text style={{ color: '#666' }}>Loading...</Text>
          ) : data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
            />
          ) : (
            <>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/512/6134/6134065.png',
                }}
                style={{ width: 120, height: 120, marginBottom: 16 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#999', textAlign: 'center' }}>
                No data with that filter
              </Text>
            </>
          )
        ) : (
          <>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076549.png',
              }}
              style={{ width: 120, height: 120, marginBottom: 16 }}
              resizeMode="contain"
            />
            <Text style={{ color: '#999', textAlign: 'center' }}>
              Please choose filter and click "Preview"
            </Text>
          </>
        )}
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
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    color: '#000',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  picker: {
    height: 44,
    paddingHorizontal: 8,
    color: '#000',
  },
  button: {
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  reportTable: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  card: {
    backgroundColor: '#F2F7FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
    color: '#000',
  },
  cardText: {
    color: '#555',
    fontSize: 14,
  },
});
