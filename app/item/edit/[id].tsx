import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Alert,
  Image, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getItems, updateItem, uploadImage } from '../../../services/item.services';

const hotelOptions = [
  'HO', 'AS1', 'AS2', 'AS3', 'AS4', 'AS5', 'AS6',
  'ST1', 'JU1', 'JU2', 'YB1', 'YB2', 'YB3',
].map(val => ({ label: val, value: val }));

const departmentOptions = [
  'AG', 'HR', 'IT', 'MAR', 'REV', 'RES', 'PUR',
  'SAL', 'FO', 'HK', 'ENG', 'BQT', 'SEC',
].map(val => ({ label: val, value: val }));

const assetTypeOptions = [
  { label: 'Hardware', value: 'Hardware' },
  { label: 'Software', value: 'Software' },
  { label: 'Digital / Virtual Asset', value: 'Virtual' },
];

const statusOptions = [
  { label: 'Fixed Asset', value: 'Fixed Asset' },
  { label: 'Leased Asset', value: 'Leased Asset' },
  { label: 'Disposal Asset', value: 'Disposal Asset' },
];

const categoryMap: Record<string, string[]> = {
  Hardware: [
    'Laptop', 'Tablet', 'Mobile Phone', 'Router', 'Access Point', 'Switch', 'Camera',
    'DVR', 'NVR', 'Mouse', 'Keyboard', 'Keyboard Mouse', 'WebCam', 'UPS', 'Server',
    'Rack', 'Mic', 'SoundCard', 'Board', 'MiniPC', 'PC', 'Monitor', 'Cable',
    'Adapter', 'Printer', 'Trafo',
  ],
  Software: [
    'Operating System', 'MS Office', 'AutoCad', 'Antivirus', 'Adobe Product', 'Other',
  ],
  Virtual: ['Domain', 'Cloud', 'Website'],
};

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await getItems();
        const found = res.data.find((i: any) => i.id.toString() === id);
        setForm(found);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch item');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDetail();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImagePick = async () => {
    Alert.alert('Upload Image', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          const { granted } = await ImagePicker.requestCameraPermissionsAsync();
          if (!granted) return Alert.alert('Permission denied');
          const result = await ImagePicker.launchCameraAsync({ base64: false });
          if (!result.canceled && result.assets.length > 0) {
            setForm((prev: any) => ({ ...prev, image: result.assets[0].uri }));
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!granted) return Alert.alert('Permission denied');
          const result = await ImagePicker.launchImageLibraryAsync({ base64: false });
          if (!result.canceled && result.assets.length > 0) {
            setForm((prev: any) => ({ ...prev, image: result.assets[0].uri }));
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      let imageUrl = form.image;
      if (form.image && form.image.startsWith('file')) {
        imageUrl = await uploadImage(form.image);
      }
      const payload = { ...form, image: imageUrl };
      await updateItem(form.id, payload);
      Alert.alert('Success', 'Item updated');
      router.push(`/item/${form.id}`);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !form)
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#0066CC" />;

  const categoryOptions = form.asset_type && categoryMap[form.asset_type]
    ? categoryMap[form.asset_type].map(val => ({ label: val, value: val }))
    : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Edit Item' }} />

      {[{ label: 'Hotel Code', key: 'hotel_code', items: hotelOptions },
        { label: 'Department Code', key: 'department_code', items: departmentOptions },
        { label: 'Asset Type', key: 'asset_type', items: assetTypeOptions },
        { label: 'Category', key: 'category', items: categoryOptions, condition: !!form.asset_type },
        { label: 'Status', key: 'status', items: statusOptions },
      ].map(
        ({ label, key, items, condition = true }) =>
          condition && (
            <View key={key}>
              <Text style={styles.label}>{label}</Text>
              <RNPickerSelect
                onValueChange={val => handleChange(key, val)}
                items={items}
                value={form[key]}
                placeholder={{ label: `Select ${label}`, value: '' }}
                style={pickerSelectStyles}
              />
            </View>
          )
      )}

      <Text style={styles.label}>Asset Name</Text>
      <TextInput
        style={styles.input}
        value={form.asset_name}
        onChangeText={val => handleChange('asset_name', val)}
        placeholder="Enter asset name"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Brand / Model</Text>
      <TextInput
        style={styles.input}
        value={form.brand_model}
        onChangeText={val => handleChange('brand_model', val)}
        placeholder="Enter brand/model"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Serial Number</Text>
      <TextInput
        style={styles.input}
        value={form.serial_number}
        onChangeText={val => handleChange('serial_number', val)}
        placeholder="Enter serial number"
        placeholderTextColor="#888"
      />

      <TouchableOpacity onPress={handleImagePick} style={styles.uploadBtn}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Upload Image</Text>
      </TouchableOpacity>

      {!!form.image && (
        <Image
          source={{ uri: form.image }}
          style={{ height: 160, marginTop: 12, borderRadius: 8 }}
        />
      )}

      <TouchableOpacity
        onPress={handleUpdate}
        style={[styles.uploadBtn, { backgroundColor: '#28A745', marginTop: 20 }]}
        disabled={updating}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          {updating ? 'Saving...' : 'Update Item'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FAFAFA' },
  label: { marginTop: 12, marginBottom: 4, fontWeight: '600', fontSize: 15, color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    color: '#000',
  },
  uploadBtn: {
    backgroundColor: '#0066CC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 15,
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 15,
  },
});
