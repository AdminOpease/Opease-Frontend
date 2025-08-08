import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TrackerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Onboarding Tracker</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 20, fontWeight: "bold" },
});
