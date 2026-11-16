import { APIProvider } from "@/api/api-provider";
import { useColorScheme } from "@/components/useColorScheme";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const responseListener = useRef<Notifications.EventSubscription | undefined>(
    undefined,
  );

  // useEffect 외부 또는 컴포넌트 상단에 선언
  const lastHandledNotificationId = useRef<string | null>(null);

  useEffect(() => {
    // 1. 앱이 꺼져있거나 백그라운드에서 알림 눌러 켰을 때
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;

      const notificationId = response.notification.request.identifier;

      // 💡 이미 처리한 알림 ID라면 이동하지 않고 무시
      if (lastHandledNotificationId.current === notificationId) return;

      const data = response.notification.request.content.data;
      if (data?.type === "CHAT" && data?.gatheringId) {
        lastHandledNotificationId.current = notificationId; // 처리됨 기록
        router.push(`/gathering/${data.gatheringId}/chat`);
      }

      if (data?.type === "DM" && data?.roomId) {
        lastHandledNotificationId.current = notificationId; // 처리됨 기록
        router.push({
          pathname: "/DM/[id]", // 💡 실제 id 대신 라우트 파일명 구조 그대로 작성
          params: {
            id: String(data.roomId), // 💡 동적 파라미터 id를 params 안으로 이동
            name: String(data.nickname ?? ""), // 💡 unknown 타입 방지를 위한 타입 단언/변환
            profileImage: String(data.profileImage ?? ""),
          },
        });
      }
    });

    // 2. 앱 실행 중(포그라운드/백그라운드)일 때
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notificationId = response.notification.request.identifier;

        // 💡 이미 처리한 알림 ID라면 무시
        if (lastHandledNotificationId.current === notificationId) return;

        const data = response.notification.request.content.data;
        if (data?.type === "CHAT" && data?.gatheringId) {
          lastHandledNotificationId.current = notificationId; // 처리됨 기록
          setTimeout(() => {
            router.push(`/gathering/${data.gatheringId}/chat`);
          }, 0);
        }

        if (data?.type === "DM" && data?.roomId) {
          lastHandledNotificationId.current = notificationId; // 처리됨 기록
          router.push({
            pathname: "/DM/[id]", // 💡 실제 id 대신 라우트 파일명 구조 그대로 작성
            params: {
              id: String(data.roomId), // 💡 동적 파라미터 id를 params 안으로 이동
              name: String(data.nickname ?? ""), // 💡 unknown 타입 방지를 위한 타입 단언/변환
              profileImage: String(data.profileImage ?? ""),
            },
          });
        }

        // DM 처리 로직도 동일하게 id 체크
      });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={DarkTheme}>
      <KeyboardProvider>
        <APIProvider>
          <ActionSheetProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="gathering" options={{ headerShown: false }} />
              <Stack.Screen name="DM" options={{ headerShown: false }} />

              <Stack.Screen
                name="commercial"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="joined" options={{ headerShown: false }} />
              <Stack.Screen name="agreement" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />

              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            </Stack>
          </ActionSheetProvider>
        </APIProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
