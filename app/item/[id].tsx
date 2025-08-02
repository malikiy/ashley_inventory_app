import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native'
import { getItems, deleteItem } from '../../services/item.services'
import Barcode from 'react-native-barcode-svg'

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await getItems()
        const f = res.data.find((i: any) => i.id.toString() === id)
        setItem(f)
      } catch (err) {
        console.error('Failed to fetch item detail:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(Number(id))
              Alert.alert('Deleted', 'Item has been deleted.')
              router.replace('/item')
            } catch (err) {
              console.error('Failed to delete item:', err)
              Alert.alert('Error', 'Failed to delete item.')
            }
          },
        },
      ]
    )
  }

  if (loading)
    return (
      <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#0066CC" />
    )

  if (!item)
    return <Text style={{ margin: 20, textAlign: 'center', color: '#000' }}>Item not found</Text>

  const barcodeValue =
    typeof item.barcode === 'string' && item.barcode.trim().length > 0
      ? item.barcode.trim()
      : ''

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Stack.Screen options={{ title: item.asset_name ?? 'Item Detail' }} />

      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{item.asset_name}</Text>

      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      ) : null}

      <View style={styles.detailBox}>
        {[
          ['Hotel Code', item.hotel_code],
          ['Department Code', item.department_code],
          ['Asset Type', item.asset_type],
          ['Category', item.category],
          ['Status', item.status],
          ['Brand / Model', item.brand_model],
          ['Serial Number', item.serial_number],
        ].map(([label, val]) => (
          <View key={label} style={{ marginTop: 12 }}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{val || '-'}</Text>
          </View>
        ))}

        <Text style={[styles.label, { marginTop: 12 }]}>Barcode</Text>
        <Text style={styles.value}>{barcodeValue || '-'}</Text>

        <View style={styles.barcodeContainer}>
          <Text style={styles.subLabel}>Barcode Preview</Text>
          <View style={styles.barcodeBox}>
            {barcodeValue ? (
              <Barcode
                value={barcodeValue}
                format="CODE128"
                height={60}
                singleBarWidth={2}
                maxWidth={300}
                lineColor="#000"
                backgroundColor="#fff"
                onError={(err: any) =>
                  console.warn('Barcode rendered error:', err)
                }
              />
            ) : (
              <Text style={{ color: '#999' }}>No Barcode Available</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => router.push(`/item/edit/${item.id}`)}
          style={[styles.button, { backgroundColor: '#0066CC' }]}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          style={[styles.button, { backgroundColor: '#CC0000' }]}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#FAFAFA', flex: 1 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#0066CC', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#000' },
  image: { height: 200, borderRadius: 10, marginBottom: 16, width: '100%' },
  detailBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  label: { fontWeight: '600', fontSize: 14, color: '#000' },
  value: { marginTop: 4, color: '#333', fontSize: 15 },
  subLabel: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 12,
    color: '#000',
  },
  barcodeContainer: { marginTop: 24, alignItems: 'center' },
  barcodeBox: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 1,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
})
