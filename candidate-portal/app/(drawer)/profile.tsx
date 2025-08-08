import { View, Text, StyleSheet } from "react-native";
import colors from "../../theme/colors";

export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.muted}>Not connected to form yet.</Text>

        <View style={styles.section}>
          <Text style={styles.label}>First Name</Text>
          <Text style={styles.value}>—</Text>
          <Text style={styles.label}>Last Name</Text>
          <Text style={styles.value}>—</Text>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>—</Text>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>—</Text>
        </View>
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
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.text },
  muted: { color: "#666", marginTop: 4 },
  section: { marginTop: 16 },
  label: { color: "#666", marginTop: 8, fontWeight: "600" },
  value: { color: colors.text, marginTop: 2 },
});
