import useAuthStore from "@/store/auth.store";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  const { isLoading, fetchAuthenticateduser } = useAuthStore();

  const [fontsLoaded, error] = useFonts({
    "Quicksand-Bold": require("@/assets/fonts/Quicksand-Bold.ttf"),
    "Quicksand-Medium": require("@/assets/fonts/Quicksand-Medium.ttf"),
    "Quicksand-Regular": require("@/assets/fonts/Quicksand-Regular.ttf"),
    "Quicksand-SemiBold": require("@/assets/fonts/Quicksand-SemiBold.ttf"),
    "Quicksand-Light": require("@/assets/fonts/Quicksand-Light.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded && !isLoading) SplashScreen.hideAsync();
  }, [fontsLoaded, error, isLoading]);

  useEffect(() => {
    fetchAuthenticateduser();
  }, []);

  if (!fontsLoaded || isLoading) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
