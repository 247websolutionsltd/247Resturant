import AuthShell, { OrDivider } from "@/components/auth-shell";
import Button from "@/components/button";
import Input from "@/components/custom-input";
import { ThemedText } from "@/components/themed-text";
import { Brand } from "@/constants/brand";
import { Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { go } from "@/lib/nav";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function LogIn() {
  const theme = useTheme();
  const { logInForm, updateLogInField, handleLogin, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!logInForm.email.trim() || !logInForm.password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError(null);
    handleLogin();
  };

  return (
    <AuthShell title={"Hungry?\nWelcome back."} subtitle={`Sign in to ${Brand.fullName} and pick up where your last craving left off.`}>
      <Input
        label="Email"
        icon="mail-outline"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={logInForm.email}
        onChangeText={(t) => updateLogInField("email", t)}
      />
      <Input
        label="Password"
        icon="lock-closed-outline"
        placeholder="Enter your password"
        password
        value={logInForm.password}
        onChangeText={(t) => updateLogInField("password", t)}
        onSubmitEditing={submit}
        error={error}
      />
      <TouchableOpacity onPress={() => go("/auth/forgot")} style={{ alignSelf: "flex-end", paddingVertical: Spacing.two }} hitSlop={8}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          Forgot password?
        </ThemedText>
      </TouchableOpacity>

      <Button title="Sign in" icon="arrow-forward" onPress={submit} loading={loading} style={{ marginTop: Spacing.two }} />

      <OrDivider />

      <View style={{ flexDirection: "row" }}>
        {/* <GoogleSignInButton /> */}
      </View>

      <View style={{ flex: 1, minHeight: Spacing.four }} />
      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: Spacing.three }}>
        <ThemedText type="small" themeColor="textSecondary">
          New to {Brand.name}?{" "}
        </ThemedText>
        <TouchableOpacity onPress={() => go("/auth/register")} hitSlop={8}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            Create an account
          </ThemedText>
        </TouchableOpacity>
      </View>
    </AuthShell>
  );
}
