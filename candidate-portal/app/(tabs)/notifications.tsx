// app/(tabs)/notifications.tsx
import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useRouter, type Href } from "expo-router";
import colors from "../../theme/colors";
import { useAuth } from "../context/AuthContext";
import { notifications as notifApi } from "../lib/api";

/* ---------------- Types ---------------- */
type Communication = {
  id: string;
  title: string;
  body?: string;
  href?: string;
  createdAt: number;
  read: boolean;
};

type ActionTask = {
  id: string;
  title: string;
  desc?: string;
  route?: string;
  href?: string;
  isComplete: boolean;
  actionLabel?: string;
};

/* ---------------- UI Bits ---------------- */
function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        {typeof title === "string" ? <Text style={styles.sectionTitle}>{title}</Text> : title}
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
        {item.body ? <Text style={[styles.itemBody, item.read && { opacity: 0.7 }]}>{item.body}</Text> : null}
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

function TaskItem({ task, onOpen }: { task: ActionTask; onOpen: (t: ActionTask) => void }) {
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
  const { driver, application } = useAuth();
  const [communications, setCommunications] = useState<Communication[]>([]);

  useEffect(() => {
    if (!driver?.id) return;
    notifApi
      .list(driver.id)
      .then((res) => {
        const items: Communication[] = (res.data || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          createdAt: new Date(n.created_at).getTime(),
          read: !!n.is_read,
        }));
        setCommunications(items);
      })
      .catch((err) => console.warn("Failed to fetch notifications:", err));
  }, [driver?.id]);

  // Compute action tasks from application state
  const tasks: ActionTask[] = [];
  if (application) {
    if (application.contract_signing !== "Complete") {
      tasks.push({ id: "t_contract", title: "Sign your contract", desc: "Open the Documents section to review and sign.", route: "(drawer)/documents", isComplete: false, actionLabel: "Review" });
    }
    if (application.bgc === "Pending") {
      tasks.push({ id: "t_bgc", title: "Background check pending", desc: "We'll notify you once it's complete.", isComplete: false });
    }
    if (!application.training_date) {
      tasks.push({ id: "t_training", title: "Training date to be assigned", desc: "Check back soon for your training schedule.", isComplete: false });
    }
  }
  const pendingTasks = tasks.filter((t) => !t.isComplete);
  const pendingCount = pendingTasks.length;

  const openCommunication = async (c: Communication) => {
    if (c.href?.startsWith("http")) await WebBrowser.openBrowserAsync(c.href);
    else if (c.href) router.push(c.href as Href);
  };

  const toggleRead = (c: Communication) => {
    if (!c.read) notifApi.markRead(c.id).catch(() => {});
    setCommunications((prev) => prev.map((x) => (x.id === c.id ? { ...x, read: !x.read } : x)));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.secondary }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
      <Section
        title={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sectionTitle}>Action Required</Text>
            <View style={styles.badgeWrap}><Text style={styles.badgeText}>{pendingCount}</Text></View>
          </View>
        }
      >
        {pendingCount > 0 ? (
          <FlatList
            data={pendingTasks}
            keyExtractor={(t) => t.id}
            renderItem={({ item }) => (
              <TaskItem task={item} onOpen={(t) => { if (t.href?.startsWith("http")) WebBrowser.openBrowserAsync(t.href); else if (t.route) router.push(t.route as Href); }} />
            )}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.muted}>You're all caught up.</Text>
        )}
      </Section>

      <Section title="Communications">
        {communications.length > 0 ? (
          <FlatList
            data={communications.sort((a, b) => b.createdAt - a.createdAt)}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => <CommItem item={item} onOpen={openCommunication} onToggleRead={toggleRead} />}
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

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontWeight: "700", color: colors.text },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee", marginTop: 6, marginBottom: 8 },
  itemRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  itemTitle: { color: colors.text, fontWeight: "700", marginBottom: 2, paddingRight: 8, flexShrink: 1 },
  itemBody: { color: "#6B7280" },
  itemActions: { flexDirection: "row", marginLeft: 8 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.primary },
  actionBtnText: { color: "#fff", fontWeight: "700" },
  listSeparator: { height: 10 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 6, marginTop: 3 },
  muted: { color: "#9CA3AF" },
  badgeWrap: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: "#FEE2E2" },
  badgeText: { color: "#991B1B", fontWeight: "700" },
});
