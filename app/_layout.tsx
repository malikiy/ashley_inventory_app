import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Error boundary disediakan oleh expo-router
export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Set initial route jika bukan (tabs)
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Throw error kalau font gagal load
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Delay 2 detik sebelum sembunyiin splash screen
  useEffect(() => {
    const hideSplash = async () => {
      if (loaded) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // delay 2 detik
        await SplashScreen.hideAsync();
      }
    };
    hideSplash();
  }, [loaded]);

  // Kalau belum selesai load, jangan render apa-apa
  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
    </Stack>
    </ThemeProvider>
  );
}
