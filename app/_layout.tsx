import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import HeaderWithHome from '@/components/HeaderWithHome'; // Pastikan file ini ada
import { useColorScheme } from '@/components/useColorScheme';

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const hideSplash = async () => {
      if (loaded) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await SplashScreen.hideAsync();
      }
    };
    hideSplash();
  }, [loaded]);

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
        
        <Stack.Screen
          name="item/index"
          options={{
            header: () => <HeaderWithHome title="Inventory" />,
          }}
        />
        <Stack.Screen
          name="item/[id]"
          options={{
            header: () => <HeaderWithHome title="Inventory Details" />,
          }}
        />
        <Stack.Screen
          name="item/edit/[id]"
          options={{
            header: () => <HeaderWithHome title="Edit Inventory" />,
          }}
        />
        <Stack.Screen
          name="report/index"
          options={{
            header: () => <HeaderWithHome title="Report Analysis" />,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
