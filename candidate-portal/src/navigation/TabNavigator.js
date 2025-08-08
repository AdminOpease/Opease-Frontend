import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TrackerScreen from "../screens/TrackerScreen";
import ProfileScreen from "../screens/ProfileScreen";
import DocumentsScreen from "../screens/DocumentsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Tracker") iconName = "checkmark-done-circle";
          else if (route.name === "Profile") iconName = "person-circle";
          else if (route.name === "Documents") iconName = "folder";
          else if (route.name === "Notifications") iconName = "notifications";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2E4C1E",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Tracker" component={TrackerScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}
