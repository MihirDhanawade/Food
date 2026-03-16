import useAuthStore from "@/store/auth.store";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const fetchAuthenticateduser = useAuthStore(
    (state) => state.fetchAuthenticateduser,
  );

  const [fontsLoaded, error] = useFonts({
    "Quicksand-Bold": require("@/assets/fonts/Quicksand-Bold.ttf"),
    "Quicksand-Medium": require("@/assets/fonts/Quicksand-Medium.ttf"),
    "Quicksand-Regular": require("@/assets/fonts/Quicksand-Regular.ttf"),
    "Quicksand-SemiBold": require("@/assets/fonts/Quicksand-SemiBold.ttf"),
    "Quicksand-Light": require("@/assets/fonts/Quicksand-Light.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded && hasHydrated && !isLoading) SplashScreen.hideAsync();
  }, [fontsLoaded, error, hasHydrated, isLoading]);

  useEffect(() => {
    if (hasHydrated) {
      // Pass true so isLoading is properly set to true during the check,
      // preventing the auth layout from rendering before we know the auth state.
      fetchAuthenticateduser(true);
    }
  }, [hasHydrated, fetchAuthenticateduser]);

  if (!fontsLoaded || !hasHydrated || isLoading) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
