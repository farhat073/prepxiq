import { create } from "zustand";
import type { Profile } from "@/lib/types";
import type { UserRole } from "@/lib/constants";

interface AppState {
  // Auth
  profile: Profile | null;
  role: UserRole | null;
  setProfile: (profile: Profile | null) => void;

  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Theme
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;

  // Notifications
  unreadNotificationCount: number;
  setUnreadNotificationCount: (count: number) => void;

  // Search
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  profile: null,
  role: null,
  setProfile: (profile) =>
    set({ profile, role: profile?.role as UserRole | null }),

  // UI State
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Theme
  theme: "dark",
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      }
      return { theme: newTheme };
    }),

  // Notifications
  unreadNotificationCount: 0,
  setUnreadNotificationCount: (count) =>
    set({ unreadNotificationCount: count }),

  // Search
  globalSearchOpen: false,
  setGlobalSearchOpen: (open) => set({ globalSearchOpen: open }),
}));
