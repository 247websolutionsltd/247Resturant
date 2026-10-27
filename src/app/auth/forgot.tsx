import AuthShell from "@/components/auth-shell";
import Button from "@/components/button";
import Input from "@/components/custom-input";
import { ThemedText } from "@/components/themed-text";
import { Card, IconBadge } from "@/components/ui";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { goReplace } from "@/lib/nav";
import { authErrorMessage, resetPassword } from "@/services/auth";
import { router } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function Forgot() {
  const theme = useTheme();
  const { logInForm, updateLogInField } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(logInForm.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await resetPassword(logInForm.email);
      setSent(true);
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      compact
      emoji={sent ? "💌" : "🔑"}
      title={sent ? "Check your inbox" : "Forgot it?"}
      subtitle={sent ? "Follow the link we sent to choose a new password." : "No stress. We'll email you a link to reset it."}
      onBack={() => router.back()}
    >
      {sent ? (
        <>
          <Card alt style={{ flexDirection: "row", alignItems: "center" }}>
            <IconBadge icon="mail" />
            <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1, marginLeft: Spacing.three, lineHeight: 20 }}>
              If an account exists for {logInForm.email.trim()}, a reset link is on its way. It may take a minute, and check spam if you don't see it.
            </ThemedText>
          </Card>
          <Button title="Back to sign in" onPress={() => goReplace("/auth/logIn")} style={{ marginTop: Spacing.four }} />
          <Button title="Send again" variant="secondary" onPress={submit} loading={busy} style={{ marginTop: Spacing.three }} />
        </>
      ) : (
        <>
          <Input label="Email" icon="mail-outline" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={logInForm.email} onChangeText={(t) => updateLogInField("email", t)} error={error} />
          <Button title="Send reset link" onPress={submit} loading={busy} style={{ marginTop: Spacing.three }} />
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: Spacing.four }}>
            <ThemedText type="small" themeColor="textSecondary">
              Remembered it?{" "}
            </ThemedText>
            <TouchableOpacity onPress={() => goReplace("/auth/logIn")} hitSlop={8}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                Back to sign in
              </ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </AuthShell>
  );
}
