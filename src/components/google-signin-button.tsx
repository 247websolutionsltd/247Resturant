import { useState } from "react";
import { ActivityIndicator, Alert, Platform, TouchableOpacity } from "react-native";

import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, type User } from "firebase/auth";

import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { goReplace } from "@/lib/nav";
import { ensureUserAccount } from "@/services/users";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../config/firebase";
import { ThemedText } from "./themed-text";

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Configure once at module load. iOS client ID is read from GoogleService-Info.plist,
// so only the Web client ID is needed here.
if (Platform.OS !== "web" && WEB_CLIENT_ID) {
  GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
}

function messageFor(error: unknown): string | null {
  if (isErrorWithCode(error)) {
    switch (error.code) {
      case statusCodes.SIGN_IN_CANCELLED:
        return null; // user backed out: stay silent
      case statusCodes.IN_PROGRESS:
        return null;
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return "Google Play Services is missing or out of date on this device.";
    }
  }
  const code = (error as { code?: string })?.code;
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return null;
  }
  if (code === "auth/account-exists-with-different-credential") {
    return "An account already exists with this email. Sign in with your email and password instead.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Check your connection and try again.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Google sign-in is not enabled for this project yet.";
  }
  return "We couldn't sign you in with Google. Please try again.";
}

export default function GoogleSignInButton() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    if (loading) return;
    if (Platform.OS !== "web" && !WEB_CLIENT_ID) {
      Alert.alert("Google Sign-In not configured", "Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env and rebuild the app.");
      return;
    }
    setLoading(true);
    try {
      let user: User;
      if (Platform.OS === "web") {
        user = (await signInWithPopup(auth, new GoogleAuthProvider())).user;
      } else {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();
        if (isCancelledResponse(response) || !isSuccessResponse(response)) return;

        const idToken = response.data.idToken;
        if (!idToken) throw new Error("Google did not return an ID token.");

        const credential = GoogleAuthProvider.credential(idToken);
        user = (await signInWithCredential(auth, credential)).user;
      }
      // Creates the customer profile for first-time Google users; no-op for existing ones.
      await ensureUserAccount(user);
      goReplace("/(tabs)/home");
    } catch (error) {
      const msg = messageFor(error);
      if (msg) Alert.alert("Google Sign-In Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{
        flex: 1,
        height: 54,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: theme.line,
        backgroundColor: theme.card,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.text} />
      ) : (
        <>
          <Ionicons name="logo-google" size={19} color={theme.text} />
          <ThemedText type="smallBold" style={{ marginLeft: Spacing.two + 2 }}>Continue with Google</ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}
