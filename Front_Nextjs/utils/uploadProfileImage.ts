import { client } from "@/api/client";

export const uploadProfileImage = async (imageUri: string) => {
  const formData = new FormData();

  const filename = imageUri.split("/").pop() || "profile.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  formData.append("profile_image", {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  const response = await client.post("/user/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
