
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface UserSettings {
  theme: string;
  notifications: boolean;
  autoSave: boolean;
}

export function useUserSettings() {
  return useUserPreferences<UserSettings>('user-settings', {
    theme: 'light',
    notifications: true,
    autoSave: true
  });
}
