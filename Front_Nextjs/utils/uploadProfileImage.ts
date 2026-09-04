import { client } from "@/api/client";

export const uploadProfileImage = async (imageUri: string) => {
  const formData = new FormData();

  // 1. 이미 Cloudflare R2에 올라간 http(s) URL이면 업로드 생략하고 바로 반환
  if (imageUri.startsWith("http://") || imageUri.startsWith("https://")) {
    return { imageUrl: imageUri };
  }

  // 2. blob: URL 또는 로컬 URI를 실제 File 객체로 변환하여 FormData에 추가
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const file = new File([blob], `profile_${Date.now()}.jpg`, {
      type: blob.type || "image/jpeg",
    });
    formData.append("profile_image", file);
  } catch (error) {
    console.error("이미지 변환 중 오류 발생:", error);
    throw new Error("이미지 파일을 읽을 수 없습니다.");
  }

  // 3. 서버로 multipart/form-data 전송
  const response = await client.post("/user/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
