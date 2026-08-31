import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useState } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react-native";

import {
  clearAuthSession,
  loginUser,
} from "../api/authApi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await loginUser(email, password);

      if (result.user.role === "therapist") {
        router.replace("/therapist-dashboard");
        return;
      }

      if (result.user.role === "admin") {
        router.replace("/admin");
        return;
      }

      if (result.user.role === "parent") {
        // "as never" only avoids the stale Expo typed-route warning
        // before Expo regenerates route types after the new parent.tsx file exists.
        router.replace("/parent" as never);
        return;
      }

      clearAuthSession();
      setError("This account role is not supported.");
    } catch (loginError) {

  console.error(
    "LOGIN ERROR:",
    loginError
  );

  clearAuthSession();

  const message =
    loginError instanceof Error
      ? loginError.message
      : String(loginError);

  setError(
    message ||
    "Unable to sign in. Please try again."
  );

} finally {

  setLoading(false);

}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.backgroundCircleOne} />
          <View style={styles.backgroundCircleTwo} />

          <View style={styles.card}>
            <View style={styles.brand}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.heading}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to access child assessments, sessions, progress,
                and reports.
              </Text>
            </View>

            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Email address</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color="#9BA3BA" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#A3ABC0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    style={styles.input}
                  />
                </View>
              </View>

              <View>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <LockKeyhole size={20} color="#9BA3BA" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#A3ABC0"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                    style={styles.input}
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#969EB5" />
                    ) : (
                      <Eye size={20} color="#969EB5" />
                    )}
                  </Pressable>
                </View>
              </View>

              {!!error && (
                <View style={styles.errorBox}>
                  <View style={styles.errorIcon}>
                    <Text style={styles.errorIconText}>!</Text>
                  </View>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Pressable
                disabled={loading}
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && !loading && styles.loginButtonPressed,
                  loading && styles.loginButtonDisabled,
                ]}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.loginButtonText}>
                      Signing in...
                    </Text>
                  </>
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <ShieldCheck size={18} color="#8173E7" />
              <Text style={styles.footerText}>
                Secure access for authorized KidMind users
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F6FC" },
  keyboard: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 28,
    backgroundColor: "#F8F6FC",
    overflow: "hidden",
  },
  backgroundCircleOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -100,
    right: -100,
    backgroundColor: "rgba(134,112,255,0.08)",
  },
  backgroundCircleTwo: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    left: -140,
    bottom: -150,
    backgroundColor: "rgba(237,109,204,0.07)",
  },
  card: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 34,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(99,90,168,0.12)",
    shadowColor: "#56429F",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.11,
    shadowRadius: 30,
    elevation: 8,
  },
  brand: { alignItems: "center", marginBottom: 24 },
  logo: { width: 210, height: 90 },
  heading: { alignItems: "center", marginBottom: 29 },
  title: {
    color: "#322A7A",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    maxWidth: 390,
    marginTop: 10,
    color: "#68738F",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  form: { gap: 19 },
  label: {
    marginBottom: 9,
    color: "#28335B",
    fontSize: 14,
    fontWeight: "700",
  },
  inputWrapper: {
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#E0E2EE",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    height: "100%",
    marginLeft: 12,
    color: "#252852",
    fontSize: 15,
  },
  eyeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  errorBox: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(221,76,105,0.15)",
    backgroundColor: "#FFF0F3",
  },
  errorIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DB5873",
  },
  errorIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  errorText: {
    flex: 1,
    color: "#B63F5B",
    fontSize: 13,
    lineHeight: 19,
  },
  loginButton: {
    height: 55,
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#806CF4",
    shadowColor: "#7E67E7",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 15,
    elevation: 5,
  },
  loginButtonPressed: { opacity: 0.9 },
  loginButtonDisabled: { opacity: 0.72 },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  footer: {
    marginTop: 30,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: "#EDEAF5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  footerText: {
    flexShrink: 1,
    color: "#9299AD",
    fontSize: 12,
    textAlign: "center",
  },
});