import { View, Text, StyleSheet } from "react-native";
import colors from "../../theme/colors";

export default function NotificationsScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.muted}>No notifications yet.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.secondary, padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    flex: 1,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  muted: { color: "#666", marginTop: 4 },
});
