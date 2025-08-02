import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function HeaderWithHome({ title }: { title: string }) {
  const router = useRouter();

  return (
    <View
      style={{
        height: 100,
        backgroundColor: '#0066CC',
        paddingTop: 30,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
        {title}
      </Text>
      <TouchableOpacity onPress={() => router.push('/home')}>
        <FontAwesome name="home" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
}
