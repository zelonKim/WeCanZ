import { Stack } from "expo-router";

export default function FlashLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="done" />
    </Stack>
  );
}
