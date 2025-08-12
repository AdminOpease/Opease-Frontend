// app/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import colors from "../theme/colors";

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
