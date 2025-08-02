import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { createItem, uploadImage, getItems } from '../../services/item.services';
import { useFocusEffect, useRouter } from 'expo-router';
import { BackHandler } from 'react-native';

const hotelOptions = [
  'HO', 'AS1', 'AS2', 'AS3', 'AS4', 'AS5', 'AS6',
  'ST1', 'JU1', 'JU2', 'YB1', 'YB2', 'YB3',
].map((val) => ({ label: val, value: val }));

const departmentOptions = [
  'AG', 'HR', 'IT', 'MAR', 'REV', 'RES', 'PUR',
  'SAL', 'FO', 'HK', 'ENG', 'BQT', 'SEC',
].map((val) => ({ label: val, value: val }));

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

type AssetType = 'Hardware' | 'Software' | 'Virtual';

type Item = {
  id: number;
  asset_name: string;
  brand_model: string;
  barcode: string;
  status: string;
  image?: string;
};

const categoryMap: Record<AssetType, string[]> = {
  Hardware: [
    'Laptop', 'Tablet', 'Mobile Phone', 'Router', 'Access Point', 'Switch', 'Camera',
    'DVR', 'NVR', 'Mouse', 'Keyboard', 'Keyboard Mouse', 'WebCam', 'UPS', 'Server',
    'Rack', 'Mic', 'SoundCard', 'Board', 'MiniPC', 'PC', 'Monitor', 'Cable',
    'Adapter', 'Printer', 'Trafo',
  ],
  Software: [
    'Operating System', 'MS Office', 'AutoCad', 'Antivirus', 'Adobe Product', 'Other',
  ],
  Virtual: [
    'Domain', 'Cloud', 'Website',
  ],
};

type FormState = {
  hotelCode: string;
  departmentCode: string;
  assetName: string;
  assetType: AssetType | '';
  category: string;
  status: string;
  brandModel: string;
  serialNumber: string;
  image: string;
};

export default function ItemScreen() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({
    hotelCode: '',
    departmentCode: '',
    assetName: '',
    assetType: '',
    category: '',
    status: '',
    brandModel: '',
    serialNumber: '',
    image: '',
  });
  const [items, setItems] = useState<Item[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'assetType' ? { category: '' } : {}),
    }));
  };

  const fetchItems = async () => {
    setLoadingFetch(true);
    try {
      const res = await getItems();
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoadingFetch(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handlePickImage = async () => {
    Alert.alert('Upload Image', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          const { granted } = await ImagePicker.requestCameraPermissionsAsync();
          if (!granted) return Alert.alert('Permission denied');

          const result = await ImagePicker.launchCameraAsync({ base64: false });
          if (!result.canceled && result.assets.length > 0) {
            setForm((prev) => ({ ...prev, image: result.assets[0].uri }));
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
            setForm((prev) => ({ ...prev, image: result.assets[0].uri }));
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const assetId = `${form.hotelCode}${form.departmentCode}${form.assetName?.replace(/\s+/g, '').toUpperCase()}2`;

  const handleSubmit = async () => {
    setLoadingCreate(true);
    try {
      let imageUrl = '';

      if (form.image) {
        imageUrl = await uploadImage(form.image);
      }

      const payload = {
        hotel_code: form.hotelCode,
        department_code: form.departmentCode,
        asset_name: form.assetName,
        asset_type: form.assetType,
        category: form.category,
        status: form.status,
        brand_model: form.brandModel,
        serial_number: form.serialNumber,
        barcode: assetId,
        image: imageUrl,
      };

      await createItem(payload);

      Alert.alert('Success', 'Item created successfully');

      setShowForm(false);
      setForm({
        hotelCode: '',
        departmentCode: '',
        assetName: '',
        assetType: '',
        category: '',
        status: '',
        brandModel: '',
        serialNumber: '',
        image: '',
      });

      fetchItems();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to create item');
    } finally {
      setLoadingCreate(false);
    }
  };

  const categoryOptions =
    form.assetType && ['Hardware', 'Software', 'Virtual'].includes(form.assetType)
      ? categoryMap[form.assetType as AssetType].map((val) => ({ label: val, value: val }))
      : [];

  const router = useRouter();

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity onPress={() => router.push(`/item/${item.id}`)}>
      <View style={styles.itemCard}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
            <Text style={{ color: '#999' }}>No Image</Text>
          </View>
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.asset_name}</Text>
          <Text style={{ color: '#333' }}>{item.brand_model}</Text>
          <Text style={{ color: '#333' }}>{item.barcode}</Text>
          <Text style={{ color: '#333' }}>Status: {item.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/home');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Item Master</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)} disabled={loadingCreate || loadingFetch}>
        <Feather name="plus" size={20} color="#fff" />
        <Text style={styles.addText}>{showForm ? 'Cancel' : 'Add Item'}</Text>
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        {loadingFetch ? (
          <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 40 }} />
        ) : showForm ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={80}
          >
            <ScrollView
              style={styles.formContainer}
              contentContainerStyle={{ paddingBottom: 12 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Hotel Code</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={form.hotelCode}
                  onValueChange={(val) => handleChange('hotelCode', val)}
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
                  selectedValue={form.departmentCode}
                  onValueChange={(val) => handleChange('departmentCode', val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Department Code" value="" />
                  {departmentOptions.map(opt => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.label}>Asset Name</Text>
              <TextInput
                style={styles.input}
                value={form.assetName}
                onChangeText={(val) => handleChange('assetName', val)}
                placeholder="Enter asset name"
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>Asset Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={form.assetType}
                  onValueChange={(val) => handleChange('assetType', val)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Asset Type" value="" />
                  {assetTypeOptions.map(opt => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
                </Picker>
              </View>
              {categoryOptions.length > 0 && (
                <>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={form.category}
                      onValueChange={(val) => handleChange('category', val)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select Category" value="" />
                      {categoryOptions.map(opt => (
                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                      ))}
                    </Picker>
                  </View>
                </>
              )}

              <Text style={styles.label}>Brand / Model</Text>
              <TextInput
                style={styles.input}
                value={form.brandModel}
                onChangeText={(val) => handleChange('brandModel', val)}
                placeholder="Brand or model"
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>Serial Number</Text>
              <TextInput
                style={styles.input}
                value={form.serialNumber}
                onChangeText={(val) => handleChange('serialNumber', val)}
                placeholder="Enter serial number"
                placeholderTextColor="#888"
              />

                <Text style={styles.label}>Status</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={form.status}
                    onValueChange={(val) => handleChange('status', val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Status" value="" />
                    {statusOptions.map(opt => (
                      <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                    ))}
                  </Picker>
                </View>
              <TouchableOpacity style={styles.uploadBtn} onPress={handlePickImage}>
                <Text style={{ color: '#fff' }}>{form.image ? 'Change Image' : 'Upload Image'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, loadingCreate && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={loadingCreate}
              >
                <Text style={styles.saveButtonText}>
                  {loadingCreate ? 'Saving...' : 'Save Item'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>No items found.</Text>}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#FAFAFA',
    flex: 1,
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
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 10,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 16,
},
  uploadBtn: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#28A745',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#000',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
  },
  picker: {
    height: 42,
    color: '#000',
    fontSize: 1,
    backgroundColor: 'transparent',
    marginBottom: 10,
    marginTop: -5
  },
});