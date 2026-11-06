import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.green, // 포인트 컬러
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        // 💡 탭바 스타일 및 높이/패딩 동적 처리
        tabBarLabelStyle: {
          fontSize: Platform.OS === "ios" ? 12 : 10, // 폰트 크기 (원하는 사이즈로 조절)
          fontWeight: Platform.OS === "ios" ? 600 : 500, // 폰트 굵기
          marginTop: 3, // 아이콘과 글자 사이의 간격 조절
        },
        tabBarStyle: {
          backgroundColor: "#121212",
          height: (Platform.OS === "android" ? 75 : 55) + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
      }}
    >
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

      <Tabs.Screen
        name="index"
        options={{
          title: "밋업",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "happy" : "happy-outline"}
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
              name={focused ? "hand-right" : "hand-right-outline"}
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
