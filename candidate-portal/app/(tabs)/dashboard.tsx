import { View, Text, StyleSheet } from "react-native";
import colors from "../../theme/colors";

export default function DashboardScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Application Overview</Text>
        <Text style={styles.muted}>Data source not connected yet.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.row}>Name • —</Text>
          <Text style={styles.row}>Email • —</Text>
          <Text style={styles.row}>Phone • —</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver’s Licence</Text>
          <Text style={styles.row}>Licence Number • —</Text>
          <Text style={styles.row}>Expiry • —</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification</Text>
          <Text style={styles.row}>Passport/ID Expiry • —</Text>
          <Text style={styles.row}>Country • —</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Right to Work</Text>
          <Text style={styles.row}>Type • —</Text>
          <Text style={styles.row}>Share Code • —</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>National Insurance</Text>
          <Text style={styles.row}>NI Number • —</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.row}>Address • —</Text>
          <Text style={styles.row}>Postcode • —</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <Text style={styles.row}>Licence (Front/Back) • —</Text>
          <Text style={styles.row}>ID/Passport • —</Text>
          <Text style={styles.row}>Right to Work File • —</Text>
          <Text style={styles.row}>NI Document • —</Text>
          <Text style={styles.row}>Proof of Address • —</Text>
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
  section: { marginTop: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#eee" },
  sectionTitle: { fontWeight: "700", color: colors.text, marginBottom: 6 },
  row: { color: "#555", marginVertical: 2 },
});
