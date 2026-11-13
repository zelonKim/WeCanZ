import { removeAccessToken } from "@/api/token";

export const deactivateAuth = async () => {
  await removeAccessToken();

  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
};
