import { queryClient } from "@/api/api-provider";
import { removeAccessToken } from "@/api/token";
import { router } from "expo-router";

export const deactivateAuth = async () => {
  try {
    await queryClient.cancelQueries();
    queryClient.clear();
    await removeAccessToken();
  } catch (error) {
    console.error("로그아웃 처리 중 에러 발생:", error);
  } finally {
    router.replace("/login");
  }
};
