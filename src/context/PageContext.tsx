import { auth } from "@/config/firebase";
import { goReplace } from "@/lib/nav";
import { authErrorMessage, loginUser, registerUser } from "@/services/auth";
import { ensureUserAccount, subscribeUserProfile, updateUserProfile, UserProfile } from "@/services/users";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

/* -------------------------------------------------------------------------- */
/* Theme                                                                       */
/* -------------------------------------------------------------------------- */

export type ThemeMode = "light" | "dark";

type ThemeContextType = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({
  children,
  initialTheme = "light",
}: {
  children: ReactNode;
  initialTheme?: ThemeMode;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  const toggleThemeMode = () => setThemeMode((c) => (c === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, toggleThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAppTheme must be used inside an AppThemeProvider");
  return context;
}

/* -------------------------------------------------------------------------- */
/* Auth / profile (Firebase Auth + live users/{uid} document)                  */
/* -------------------------------------------------------------------------- */

type LogInForm = { email: string; password: string };
type RegisterForm = { email: string; password: string; confirm: string; name: string; phone: string };

export type Owner = {
  name: string;
  phone: string;
  email: string;
  referralCode: string;
};

type AuthContextType = {
  /** true while a sign-in / sign-up request is in flight */
  loading: boolean;
  /** Firebase has restored (or not) the previous session */
  authReady: boolean;
  /** the first profile snapshot has arrived (or failed) for the signed-in user */
  profileReady: boolean;
  uid: string | null;
  user: UserProfile | null;
  owner: Owner;
  logInForm: LogInForm;
  updateLogInField: (field: keyof LogInForm, value: string) => void;
  registerForm: RegisterForm;
  updateRegisterField: (field: keyof RegisterForm, value: string) => void;
  updateOwner: (patch: { name?: string; phone?: string }) => Promise<void>;
  handleSignup: () => Promise<void>;
  handleLogin: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const emptyLogin: LogInForm = { email: "", password: "" };
const emptyRegister: RegisterForm = { email: "", password: "", confirm: "", name: "", phone: "" };
const emptyOwner: Owner = { name: "", phone: "", email: "", referralCode: "" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logInForm, setLogInForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      unsubProfile?.();
      unsubProfile = undefined;
      setUser(null);

      if (!fbUser) {
        setUid(null);
        setProfileReady(false);
        setAuthReady(true);
        return;
      }

      setUid(fbUser.uid);
      setProfileReady(false);
      setAuthReady(true);

      // Create / repair the account document (no-op when it's already fine).
      ensureUserAccount(fbUser).catch((e) => console.error("[auth] ensureUserAccount failed", e));

      // Live profile: name, phone, points, favourites... update everywhere instantly.
      unsubProfile = subscribeUserProfile(
        fbUser.uid,
        (profile) => {
          setUser(profile);
          // a missing doc means ensureUserAccount is still creating it; wait for the next snapshot
          if (profile) setProfileReady(true);
        },
        (error) => {
          if (!auth.currentUser) return; // signed out; listener is being torn down
          console.error("[auth] profile subscription failed", error);
          setProfileReady(true); // don't block the app on a failed read
        },
      );
    });

    return () => {
      unsubProfile?.();
      unsubAuth();
    };
  }, []);

  const owner = useMemo<Owner>(() => {
    if (!uid) return emptyOwner;
    return {
      name: user?.displayName ?? auth.currentUser?.displayName ?? "",
      email: user?.email ?? auth.currentUser?.email ?? "",
      phone: user?.phone ?? "",
      referralCode: user?.referralCode ?? "",
    };
  }, [uid, user]);

  const handleSignup = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const fbUser = await registerUser(registerForm.email, registerForm.password);
      const displayName = registerForm.name.trim();
      await updateProfile(fbUser, { displayName });
      await ensureUserAccount(fbUser, { displayName, phone: registerForm.phone.trim() });
      setRegisterForm(emptyRegister); // don't keep passwords in memory
      goReplace("/(tabs)/home");
    } catch (error: unknown) {
      Alert.alert("Signup failed", authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await loginUser(logInForm.email, logInForm.password);
      setLogInForm(emptyLogin);
      goReplace("/(tabs)/home");
    } catch (error: unknown) {
      Alert.alert("Login failed", authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const updateOwner: AuthContextType["updateOwner"] = async (patch) => {
    const fbUser = auth.currentUser;
    if (!fbUser) throw new Error("You must be signed in to update your profile.");
    const displayName = patch.name?.trim() ?? owner.name;
    const phone = patch.phone?.trim() ?? owner.phone;
    await updateProfile(fbUser, { displayName });
    await updateUserProfile(fbUser.uid, { displayName, phone });
    // the live profile listener refreshes `owner`
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        authReady,
        profileReady,
        uid,
        user,
        owner,
        logInForm,
        updateLogInField: (f, v) => setLogInForm((p) => ({ ...p, [f]: v })),
        registerForm,
        updateRegisterField: (f, v) => setRegisterForm((p) => ({ ...p, [f]: v })),
        updateOwner,
        handleSignup,
        handleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}
