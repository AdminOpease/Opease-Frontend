// app/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Image, View, Text, TouchableOpacity } from "react-native";
import colors from "../theme/colors";

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

export default function RootLayout() {
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
      {/* Drawer items you DO want */}
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

      {/* Keep this route, hide it from the drawer */}
      <Drawer.Screen
        name="request-change"
        options={{
          drawerItemStyle: { display: "none" },
          headerShown: false,
        }}
      />
    </Drawer>
  );
}
