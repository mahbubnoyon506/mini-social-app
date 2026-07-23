import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { authApi } from "@/api/auth";

// Foreground behavior: show banners + play sound for likes/comments while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * NOTE ON FCM SETUP
 * -----------------
 * This project doesn't ship a `google-services.json` yet, so there is no
 * real Firebase project wired up. Instead we go through Expo's push
 * service (`getExpoPushTokenAsync`), which itself sits on top of FCM on
 * Android and works out of the box in a dev build without any Firebase
 * console setup.
 *
 * If `getExpoPushTokenAsync` can't produce a token (no EAS project id yet,
 * running in an environment without push capabilities, etc.) we fall back
 * to a mock token so the rest of the like/comment -> notification flow can
 * still be developed and demoed end-to-end. Swap `registerForPushNotificationsAsync`
 * for a real FCM token call once you drop in your own `google-services.json`
 * and configure the `expo-notifications` plugin with your Firebase project.
 */
export async function registerForPushNotificationsAsync(): Promise<{
  token: string;
  isMock: boolean;
}> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4F46E5",
    });
  }

  if (!Device.isDevice) {
    // Simulators/emulators can't receive real push notifications.
    return { token: `mock-emulator-token-${Date.now()}`, isMock: true };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return { token: `mock-permission-denied-${Date.now()}`, isMock: true };
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const response = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return { token: response.data, isMock: false };
  } catch (error) {
    console.warn(
      "[notifications] Falling back to a mock push token — configure an EAS project id / Firebase to get real pushes.",
      error
    );
    return { token: `mock-token-${Date.now()}`, isMock: true };
  }
}

/** Fetches (or mocks) a push token and syncs it with the backend so likes/comments can notify this device. */
export async function syncPushTokenWithBackend() {
  const { token, isMock } = await registerForPushNotificationsAsync();
  try {
    await authApi.registerFcmToken(token);
  } catch (error) {
    console.warn("[notifications] Failed to register push token with backend", error);
  }
  return { token, isMock };
}

/** Subscribes to notifications received while the app is foregrounded/backgrounded, and taps on them. */
export function addNotificationListeners(handlers: {
  onReceive?: (notification: Notifications.Notification) => void;
  onTap?: (response: Notifications.NotificationResponse) => void;
}) {
  const receivedSub = Notifications.addNotificationReceivedListener((n) => {
    handlers.onReceive?.(n);
  });
  const responseSub = Notifications.addNotificationResponseReceivedListener((r) => {
    handlers.onTap?.(r);
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
