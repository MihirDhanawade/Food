import { getCurrentUser } from "@/lib/appwrite";
import { User } from "@/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  hasHydrated: boolean;

  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  setHasHydrated: (value: boolean) => void;

  fetchAuthenticateduser: (showLoading?: boolean) => Promise<void>;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: true, // ← start true so RootLayout blocks until first auth check is done
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setUser: (user) => set({ user }),
      setIsLoading: (value) => set({ isLoading: value }),

      fetchAuthenticateduser: async (showLoading = true) => {
        if (showLoading) set({ isLoading: true });

        try {
          const user = await getCurrentUser();

          if (user) {
            set({ isAuthenticated: true, user: user as unknown as User });
          } else {
            // getCurrentUser returned null/undefined — definitive "no session"
            set({ isAuthenticated: false, user: null });
          }
        } catch (e: any) {
          console.log("fetchAuthenticateduser error", e);
          // Only clear auth for a real "no session" Appwrite error (code 401).
          // For network errors or other failures, keep the persisted auth state
          // so a refresh while offline doesn't log the user out.
          if (e?.code === 401) {
            set({ isAuthenticated: false, user: null });
          }
          // Otherwise leave isAuthenticated as-is (persisted value stays)
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",

      // Only persist auth state — never persist runtime flags like
      // isLoading or hasHydrated (they must always reset on app start)
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },

      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    },
  ),
);

export default useAuthStore;
