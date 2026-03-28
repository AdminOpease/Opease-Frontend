// app/_layout.tsx
import React, { useState } from "react";
import { Drawer } from "expo-router/drawer";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import colors from "../theme/colors";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Expo Router ErrorBoundary — catches render errors in any child route
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: colors.secondary }}>
      <Text style={{ fontWeight: "700", fontSize: 18, color: colors.text, marginBottom: 8 }}>
        Something went wrong
      </Text>
      <Text style={{ color: "#6B7280", marginBottom: 20, textAlign: "center" }}>
        {error.message}
      </Text>
      <TouchableOpacity
        onPress={retry}
        style={{ paddingVertical: 12, paddingHorizontal: 24, backgroundColor: colors.primary, borderRadius: 10 }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const Logo = () => (
  <Image
    source={require("../assets/logo.png")}
    style={{ width: 120, height: 40, resizeMode: "contain" }}
  />
);

/* ── Login Screen (shown when not authenticated) ── */
function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { setError("Email is required"); return; }
    setError("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password || "dev");
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.secondary }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={loginStyles.container}>
        <View style={loginStyles.logoWrap}>
          <Image
            source={require("../assets/logo.png")}
            style={{ width: 180, height: 60, resizeMode: "contain" }}
          />
        </View>

        <View style={loginStyles.card}>
          <Text style={loginStyles.title}>Driver Login</Text>

          <Text style={loginStyles.label}>Email</Text>
          <TextInput
            style={loginStyles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="e.g., amy.jones@opease.co.uk"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={loginStyles.label}>Password</Text>
          <TextInput
            style={loginStyles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password (any for dev)"
            secureTextEntry
          />

          {!!error && <Text style={loginStyles.error}>{error}</Text>}

          <TouchableOpacity
            style={[loginStyles.btn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={loginStyles.btnText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const loginStyles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoWrap: { alignItems: "center", marginBottom: 32 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 20, textAlign: "center" },
  label: { fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  error: { color: "#DC2626", marginTop: 12, textAlign: "center", fontWeight: "600" },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

/* ── Authenticated App Shell ── */
function AuthenticatedApp() {
  const { logout } = useAuth();

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: colors.secondary },
        headerTitle: () => <Logo />,
        headerTitleAlign: "center",
        headerTintColor: colors.text,
        headerLeft: () => <DrawerToggleButton />,
        drawerActiveTintColor: colors.primary,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Home",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="(drawer)/profile"
        options={{
          title: "Profile",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="(drawer)/documents"
        options={{
          title: "Documents",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="index"
        options={{
          drawerItemStyle: { display: "none" },
          headerShown: false,
        }}
      />

      <Drawer.Screen
        name="request-change"
        options={{
          drawerItemStyle: { display: "none" },
          headerShown: false,
        }}
      />

      {/* Hide non-route files that Expo Router picks up */}
      <Drawer.Screen name="context/AuthContext" options={{ drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="context/ApplicationContext" options={{ drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="lib/api" options={{ drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="lib/applicationSchema" options={{ drawerItemStyle: { display: "none" } }} />
    </Drawer>
  );
}

/* ── Root Layout ── */
function RootContent() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <AuthenticatedApp /> : <LoginScreen />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}
