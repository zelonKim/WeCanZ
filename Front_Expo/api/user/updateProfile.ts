import { UpdateProfileDto } from "@/types/user/UpdateProfileDto";
import { client } from "../client";

export const updateProfile = async (dto: UpdateProfileDto) => {
  const { data } = await client.patch("/user/profile", dto);
  return data;
};
