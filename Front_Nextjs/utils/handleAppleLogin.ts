const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "";
const APPLE_REDIRECT_URI = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || "";

export const handleAppleLogin = () => {
  const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${APPLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    APPLE_REDIRECT_URI,
  )}&response_type=code id_token&scope=name email&response_mode=form_post`;

  window.location.href = appleAuthUrl;
};
