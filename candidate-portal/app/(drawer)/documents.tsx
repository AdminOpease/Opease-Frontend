import { View, Text, StyleSheet } from "react-native";
import colors from "../../theme/colors";

const rows = [
  "Licence (Front)",
  "Licence (Back)",
  "ID/Passport",
  "Right to Work File",
  "NI Document",
  "Proof of Address",
];

export default function DocumentsScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Documents</Text>
        <Text style={styles.muted}>Uploads will be wired later.</Text>

        {rows.map((label) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.status}>—</Text>
          </View>
        ))}
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
  muted: { color: "#666", marginTop: 4, marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
  },
  rowLabel: { color: colors.text, fontWeight: "600" },
  status: { color: "#888" },
});
