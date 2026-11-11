import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId:
      "716946851146-fdhf9939k1giu735237ugffrrddv4viu.apps.googleusercontent.com",
    iosClientId:
      "716946851146-s7mmdsl09dobipj8ffu1pd5qtbvklg05.apps.googleusercontent.com",
    offlineAccess: true,
  });
};
