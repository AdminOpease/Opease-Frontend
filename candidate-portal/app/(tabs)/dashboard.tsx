// app/(tabs)/dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import colors from "../../theme/colors";

/* ---------- Types ---------- */
type DriverStatus = "Onboarding" | "Active" | "Inactive" | "Offboarded";

type DashboardData = {
  status: DriverStatus;
  accountId?: string;
  driverId?: string;
  messages?: string[];
};

/* ---------- Mock ATS hook (swap later) ---------- */
function useClientPortalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchFromATS(): Promise<DashboardData> {
      // TODO: replace with real Client Portal ATS call
      await new Promise((r) => setTimeout(r, 400));
      return {
        status: "Onboarding",
        accountId: undefined, // filled by ATS later
        driverId: undefined,  // filled by ATS later
        messages: [
          "Thanks for starting your application.",
          "Next: Upload required documents in the Documents tab.",
        ],
      };
    }

    fetchFromATS()
      .then((res) => mounted && setData(res))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading };
}

/* ---------- UI helpers ---------- */
const dash = (v?: string) => (v && v.trim() ? v : "— —");

const STATUS_STYLES: Record<
  DriverStatus,
  { bg: string; fg: string; label: string }
> = {
  Onboarding: { bg: "#FEF3C7", fg: "#92400E", label: "Onboarding" }, // amber
  Active: { bg: "#DCFCE7", fg: "#065F46", label: "Active" }, // green
  Inactive: { bg: "#E5E7EB", fg: "#374151", label: "Inactive" }, // gray
  Offboarded: { bg: "#FEE2E2", fg: "#991B1B", label: "Offboarded" }, // red
};

function StatusChip({ status }: { status: DriverStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <View style={[styles.chip, { backgroundColor: s.bg }]}>
      <Text style={[styles.chipText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

/* Bold only the "ID" in the label */
function Row({ label, value }: { label: string; value?: string }) {
  const parts = label.split("ID");
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>
        {parts[0]}
        <Text style={{ fontWeight: "700" }}>ID</Text>
        {parts[1] ?? ""} •{" "}
      </Text>
      <Text style={styles.rowValue}>{dash(value)}</Text>
    </View>
  );
}

/* Reusable card that accepts string or ReactNode for title */
function Section({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        {typeof title === "string" ? (
          <Text style={styles.sectionTitle}>{title}</Text>
        ) : (
          title
        )}
      </View>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

/* ---------- Screen ---------- */
export default function DashboardScreen() {
  const { data, loading } = useClientPortalDashboard();

  const status: DriverStatus | null = useMemo(() => data?.status ?? null, [data]);
  const showMessages = status === "Onboarding";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.secondary }}
      contentContainerStyle={{ padding: 16 }}
    >
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          {/* Card #1: Driver Status + IDs */}
          <Section
            title={
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.sectionTitle}>Driver Status: </Text>
                {status ? (
                  <View style={{ marginTop: -0 /* adjust this value as needed */ }}>
                    <StatusChip status={status} />
                  </View>
                ) : (
                  <Text style={styles.muted}>— —</Text>
                )}
              </View>
            }
          >
            <Row label="Account ID" value={data?.accountId} />
            <Row label="Driver ID" value={data?.driverId} />
          </Section>

          {/* Card #2: Messages (only during Onboarding) */}
          {showMessages && (
            <Section title="Messages">
              {data?.messages?.length ? (
                <FlatList
                  data={data.messages}
                  keyExtractor={(item, idx) => `${idx}`}
                  renderItem={({ item }) => <Text style={styles.messageItem}>• {item}</Text>}
                  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                  scrollEnabled={false}
                />
              ) : (
                <Text style={styles.muted}>No messages yet.</Text>
              )}
            </Section>
          )}
        </>
      )}
    </ScrollView>
  );
}

/* ---------- Styles (aligned with profile.tsx) ---------- */
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  sectionTitle: { fontWeight: "700", color: colors.text, marginBottom: 0 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee", marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 6 },
  rowLabel: { color: "#374151" },
  rowValue: { color: "#9CA3AF", flexShrink: 1 },
  muted: { color: "#9CA3AF" },
  loadingWrap: { paddingTop: 32 },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { fontWeight: "700" },
  messageItem: { color: colors.text },
});
