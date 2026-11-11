import Colors from "@/constants/Colors";
import { useTabLanguage } from "@/hooks/Languages/useTabLanguage";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { t } = useTabLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: Platform.OS === "ios" ? 12 : 10,
          fontWeight: Platform.OS === "ios" ? "600" : "500",
          marginTop: 3,
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
          title: t.friend,
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
          title: t.dm,
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
          title: t.spot,
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
          title: t.meetup,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "happy" : "happy-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="joined"
        options={{
          title: t.flash,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "hand-right" : "hand-right-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: t.setting,
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
