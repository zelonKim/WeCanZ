import { UpdateProfileDto } from "@/types/user/UpdateProfileDto";
import { client } from "../client";

export const updateProfile = async (updateProfilePayload: UpdateProfileDto) => {
  const { data } = await client.patch("/user/profile", updateProfilePayload);
  return data;
};
