// app/(tabs)/notifications.tsx
import React, { useMemo, useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import colors from "../../theme/colors";

/* ---------------- Types ---------------- */
type Communication = {
  id: string;
  title: string;
  body?: string;
  href?: string;          // external link or in‑app route
  createdAt: number;
  read: boolean;
};

type ActionTask = {
  id: string;
  title: string;          // e.g., "Sign your contract"
  desc?: string;          // short helper text
  route?: string;         // in‑app route like "(drawer)/documents" or "(tabs)/dashboard"
  href?: string;          // external URL if applicable
  isComplete: boolean;    // if true -> hidden
  actionLabel?: string;   // e.g., "Open", "Upload", "Review"
};

/* ---------------- Mock data (swap later) ----------------
   Replace these two hooks with your Client Portal data.
--------------------------------------------------------- */
function useClientPortalCommunications() {
  const [data, setData] = useState<Communication[]>([]);
  useEffect(() => {
    // TODO: replace with real fetch from Client Portal
    const now = Date.now();
    setTimeout(() => {
      setData([
        {
          id: "c1",
          title: "Welcome to Velox Logistics",
          body: "We’ll guide you through the onboarding steps.",
          createdAt: now - 1000 * 60 * 30,
          read: false,
        },
        {
          id: "c2",
          title: "Training session info",
          body: "We’ll email dates once your background check clears.",
          createdAt: now - 1000 * 60 * 60 * 2,
          read: true,
        },
      ]);
    }, 200);
  }, []);
  return { communications: data, setCommunications: setData };
}

function useActionTasksComputedFromAppState() {
  // TODO: compute from real ATS/app state
  // Example mock app state:
  const app = {
    contractsSigned: false,
    expiringDocs: [{ name: "Driving Licence", daysLeft: 13 }],
    missingProfileFields: ["Emergency Contact Phone"],
  };

  const tasks: ActionTask[] = [
    {
      id: "t_contract",
      title: "Sign your contract",
      desc: "Open the Contracts section to review and sign.",
      route: "(tabs)/dashboard", // or a dedicated contracts screen if you add one
      isComplete: app.contractsSigned,
      actionLabel: "Review",
    },
    {
      id: "t_doc_expiry",
      title: "Document expiring soon",
      desc: `${app.expiringDocs[0]?.name} — ${app.expiringDocs[0]?.daysLeft} days left`,
      route: "(drawer)/documents",
      isComplete: app.expiringDocs.length === 0,
      actionLabel: "Upload",
    },
    {
      id: "t_profile_missing",
      title: "Complete your profile",
      desc: app.missingProfileFields.length
        ? `Missing: ${app.missingProfileFields[0]}`
        : undefined,
      route: "(drawer)/profile",
      isComplete: app.missingProfileFields.length === 0,
      actionLabel: "Update",
    },
  ];

  // Only show pending (auto-hides when complete)
  return tasks.filter((t) => !t.isComplete);
}

/* ---------------- UI Bits (match dashboard theme) ---------------- */
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

function CommItem({
  item,
  onOpen,
  onToggleRead,
}: {
  item: Communication;
  onOpen: (c: Communication) => void;
  onToggleRead: (c: Communication) => void;
}) {
  return (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
          {!item.read ? <View style={styles.unreadDot} /> : null}
          <Text style={[styles.itemTitle, item.read && { opacity: 0.7 }]}>{item.title}</Text>
        </View>
        {item.body ? (
          <Text style={[styles.itemBody, item.read && { opacity: 0.7 }]}>{item.body}</Text>
        ) : null}
      </View>

      <View style={styles.itemActions}>
        {item.href ? (
          <TouchableOpacity onPress={() => onOpen(item)} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Open</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={() => onToggleRead(item)} style={[styles.actionBtn, { marginLeft: 8 }]}>
          <Text style={styles.actionBtnText}>{item.read ? "Unread" : "Mark read"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TaskItem({
  task,
  onOpen,
}: {
  task: ActionTask;
  onOpen: (t: ActionTask) => void;
}) {
  return (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{task.title}</Text>
        {task.desc ? <Text style={styles.itemBody}>{task.desc}</Text> : null}
      </View>
      <TouchableOpacity onPress={() => onOpen(task)} style={styles.actionBtn}>
        <Text style={styles.actionBtnText}>{task.actionLabel ?? "Open"}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- Screen ---------------- */
export default function NotificationsScreen() {
  const router = useRouter();
  const { communications, setCommunications } = useClientPortalCommunications();
  const tasks = useActionTasksComputedFromAppState();

  const pendingCount = tasks.length;
  const hasComms = communications.length > 0;

  const openCommunication = async (c: Communication) => {
    if (c.href?.startsWith("http")) {
      await WebBrowser.openBrowserAsync(c.href);
    } else if (c.href) {
      router.push(c.href as any);
    }
  };

  const toggleRead = (c: Communication) => {
    setCommunications((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, read: !x.read } : x))
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.secondary }}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
    >
      {/* Card: Action Required (auto-hides items when complete) */}
      <Section
        title={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sectionTitle}>Action Required</Text>
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          </View>
        }
      >
        {pendingCount > 0 ? (
          <FlatList
            data={tasks}
            keyExtractor={(t) => t.id}
            renderItem={({ item }) => <TaskItem task={item} onOpen={(t) => {
              if (t.href?.startsWith("http")) WebBrowser.openBrowserAsync(t.href);
              else if (t.route) router.push(t.route as any);
            }} />}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.muted}>You’re all caught up.</Text>
        )}
      </Section>

      {/* Card: Communications (persist, even when read) */}
      <Section title="Communications">
        {hasComms ? (
          <FlatList
            data={communications.sort((a, b) => b.createdAt - a.createdAt)}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => (
              <CommItem item={item} onOpen={openCommunication} onToggleRead={toggleRead} />
            )}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.muted}>No notifications yet.</Text>
        )}
      </Section>
    </ScrollView>
  );
}

/* ---------------- Styles (aligned with dashboard/profile theme) ---------------- */
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
    alignItems: "center",
  },
  sectionTitle: { fontWeight: "700", color: colors.text },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee", marginTop: 6, marginBottom: 8 },

  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  itemTitle: { color: colors.text, fontWeight: "700", marginBottom: 2, paddingRight: 8, flexShrink: 1 },
  itemBody: { color: "#6B7280" },

  itemActions: { flexDirection: "row", marginLeft: 8 },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  actionBtnText: { color: "#fff", fontWeight: "700" },

  listSeparator: { height: 10 },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 6,
    marginTop: 3,
  },

  muted: { color: "#9CA3AF" },

  // Small count badge for Action Required header
  badgeWrap: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
  },
  badgeText: { color: "#991B1B", fontWeight: "700" },
});
