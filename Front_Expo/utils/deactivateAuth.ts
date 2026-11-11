import { queryClient } from "@/api/api-provider";
import { removeAccessToken } from "@/api/token";
import { router } from "expo-router";

export const deactivateAuth = async () => {
  await removeAccessToken();
  await queryClient.cancelQueries();
  queryClient.clear();
  router.replace("/login");
};
