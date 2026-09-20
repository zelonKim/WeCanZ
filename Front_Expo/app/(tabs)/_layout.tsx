import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { router, Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const responseListener = useRef<Notifications.EventSubscription | undefined>(
    undefined,
  );

  useEffect(() => {
    // 1. 앱이 꺼져있을 때 알림을 눌러서 켠 경우 처리
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        if (data?.type === "CHAT" && data?.gatheringId) {
          router.push(`/gathering/${data.gatheringId}/chat`);
        }
      }
    });

    // 2. 앱이 실행 중(포그라운드/백그라운드)일 때 알림을 누른 경우 처리
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        if (data?.type === "CHAT" && data?.gatheringId) {
          setTimeout(() => {
            router.push(`/gathering/${data.gatheringId}/chat`);
          }, 0);
        }

        if (data?.type === "DM" && data?.roomId) {
          setTimeout(() => {
            router.push(`/DM/${data.roomId}`);
          }, 0);
        }
      });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFE600", // 포인트 컬러
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        // 💡 탭바 스타일 및 높이/패딩 동적 처리
        tabBarLabelStyle: {
          fontSize: Platform.OS === "ios" ? 12 : 10, // 폰트 크기 (원하는 사이즈로 조절)
          fontWeight: Platform.OS === "ios" ? 600 : 500, // 폰트 굵기
          marginTop: 3, // 아이콘과 글자 사이의 간격 조절
        },
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#1C1C1E",
          // 기본 탭바 높이(약 60px)에 안드로이드 하단 소프트키 높이(insets.bottom)를 더해줍니다.
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
      }}
    >
      {/* 4. 친구 */}
      <Tabs.Screen
        name="friend"
        options={{
          title: "친구",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 3. DM */}
      <Tabs.Screen
        name="dm"
        options={{
          title: "DM",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 6. 스팟 */}
      <Tabs.Screen
        name="spot"
        options={{
          title: "스팟",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "location" : "location-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 1. 홈 */}
      <Tabs.Screen
        name="index"
        options={{
          title: "벙개",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "flash" : "flash-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 2. 나의 번개 */}
      <Tabs.Screen
        name="flash"
        options={{
          title: "참여",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "checkmark-circle" : "checkmark-circle-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 5. 설정 */}
      <Tabs.Screen
        name="setting"
        options={{
          title: "설정",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
