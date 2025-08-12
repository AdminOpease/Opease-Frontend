// app/(drawer)/documents.tsx
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as WebBrowser from "expo-web-browser";
import colors from "../../theme/colors";

/* ---------------- Types ---------------- */
type DocItem = {
  id: string;
  name: string;
  uri: string;
  type?: string | null;
  uploadedBy: "client" | "candidate";
  uploadedAt: string; // ISO
};

type DocGroup = {
  id: string;
  title: string;
  items: DocItem[];
  subgroups?: DocGroup[];
};

type ContractStatus = "pending" | "viewed" | "completed" | "declined" | "expired";

type Contract = {
  id: string;
  title: string;
  status: ContractStatus;
  provider: "docusign" | "adobe" | "other";
  dueDate?: string;
  updatedAt: string;
  // optional URL to signed copy (mocked)
  fileUrl?: string;
};

/* ---------------- Seed data ---------------- */
const seedGroups = (): DocGroup[] => [
  { id: "licence", title: "Driver’s Licence", items: [], subgroups: [{ id: "licence-old", title: "Old", items: [] }] },
  { id: "identification", title: "Identification", items: [], subgroups: [{ id: "identification-old", title: "Old", items: [] }] },
  { id: "right-to-work", title: "Right to Work", items: [], subgroups: [{ id: "rtw-old", title: "Old", items: [] }] },
  { id: "national-insurance", title: "National Insurance", items: [], subgroups: [{ id: "ni-old", title: "Old", items: [] }] },
  { id: "address", title: "Proof of Address", items: [], subgroups: [{ id: "address-old", title: "Old", items: [] }] },
];

/* ---------------- Component ---------------- */
export default function DocumentsScreen() {
  // TODO: wire to real auth role later
  const isClient = true; // set false to see the candidate view

  const [groups, setGroups] = useState<DocGroup[]>(seedGroups());

  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: "c1",
      title: "Zero Hours Agreement",
      status: "pending",
      provider: "docusign",
      dueDate: new Date(Date.now() + 3 * 864e5).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "c2",
      title: "GDPR Consent",
      status: "completed",
      provider: "docusign",
      updatedAt: new Date().toISOString(),
      fileUrl: "https://example.com/mock-signed-gdpr.pdf",
    },
  ]);

  // Upload flow: pick -> choose group in a modal -> confirm
  const [pendingFile, setPendingFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const pickAndUpload = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (res.canceled || !res.assets?.length) return;
    setPendingFile(res.assets[0]);
    setPickerVisible(true); // open group picker
  };

  const confirmUploadToGroup = (groupId: string) => {
    if (!pendingFile) return;
    const file = pendingFile;

    const newItem: DocItem = {
      id: Math.random().toString(36).slice(2),
      name: file.name || inferNameFromMime(file.mimeType) || "Document",
      uri: file.uri,
      type: file.mimeType ?? null,
      uploadedBy: isClient ? "client" : "candidate",
      uploadedAt: new Date().toISOString(),
    };

    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, items: [...g.items, newItem] } : g))
    );

    const groupTitle = groups.find((g) => g.id === groupId)?.title ?? "Selected section";

    setPickerVisible(false);
    setPendingFile(null);
    Alert.alert("Uploaded", `${newItem.name} added to ${groupTitle}.`);
  };

  const renameItem = (groupId: string, itemId: string) => {
    if (!isClient) return;
    // iOS-only convenience; replace with a custom modal if you need Android rename
    if (Alert.prompt) {
      Alert.prompt("Rename Document", "Enter a new name", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: (text) => {
            if (!text?.trim()) return;
            setGroups((prev) =>
              prev.map((g) =>
                g.id !== groupId
                  ? g
                  : { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, name: text.trim() } : it)) }
              )
            );
          },
        },
      ]);
    } else {
      Alert.alert("Rename unsupported here", "We’ll add a cross‑platform rename dialog later.");
    }
  };

  const deleteItem = (groupId: string, itemId: string) => {
    if (!isClient) return;
    Alert.alert("Delete document?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setGroups((prev) =>
            prev.map((g) =>
              g.id === groupId ? { ...g, items: g.items.filter((it) => it.id !== itemId) } : g
            )
          ),
      },
    ]);
  };

  const moveToOld = (groupId: string, itemId: string) => {
    if (!isClient) return;
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const item = g.items.find((i) => i.id === itemId);
        if (!item) return g;

        const rest = g.items.filter((i) => i.id !== itemId);
        const old = g.subgroups?.find((sg) => sg.title.toLowerCase() === "old");
        if (!old) {
          const newOld: DocGroup = { id: `${g.id}-old`, title: "Old", items: [item] };
          const updatedSubs = g.subgroups ? [...g.subgroups, newOld] : [newOld];
          return { ...g, items: rest, subgroups: updatedSubs };
        }
        const updatedOld: DocGroup = { ...old, items: [...old.items, item] };
        const updatedSubs = g.subgroups!.map((sg) => (sg.id === old.id ? updatedOld : sg));
        return { ...g, items: rest, subgroups: updatedSubs };
      })
    );
  };

  // Contracts
  const startSigning = async (contractId: string) => {
    // Later: call backend to get an embedded signing URL
    const url = "https://example.com/mock-signing";
    await WebBrowser.openBrowserAsync(url);

    // Mock a status update to "viewed"
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId ? { ...c, status: "viewed", updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const openContract = async (fileUrl?: string) => {
    if (!fileUrl) return;
    await WebBrowser.openBrowserAsync(fileUrl);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.secondary }} contentContainerStyle={{ padding: 16 }}>
      {/* Upload button */}
      <View style={[styles.card, { marginBottom: 12 }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={pickAndUpload}>
          <Text style={styles.primaryBtnText}>Upload Document</Text>
        </TouchableOpacity>
        {!isClient && (
          <Text style={styles.note}>
            You can upload new documents. Deleting, renaming and moving files can only be done by the client.
          </Text>
        )}
      </View>

      {/* Groups */}
      {groups.map((g) => (
        <View key={g.id} style={styles.card}>
          <Text style={styles.groupTitle}>{g.title}</Text>
          <View style={styles.divider} />

          {/* Current items */}
          {g.items.length === 0 ? (
            <Text style={styles.empty}>No documents yet.</Text>
          ) : (
            g.items.map((it) => (
              <DocRow
                key={it.id}
                title={it.name}
                subtitle={niceDate(it.uploadedAt)}
                onRename={isClient ? () => renameItem(g.id, it.id) : undefined}
                onDelete={isClient ? () => deleteItem(g.id, it.id) : undefined}
                onMoveOld={isClient ? () => moveToOld(g.id, it.id) : undefined}
              />
            ))
          )}

          {/* Subgroups */}
          {g.subgroups?.map((sg) => (
            <View key={sg.id} style={{ marginTop: 12 }}>
              <Text style={styles.subgroupTitle}>{sg.title}</Text>
              <View style={styles.dividerThin} />
              {sg.items.length === 0 ? (
                <Text style={styles.empty}>No documents in this section.</Text>
              ) : (
                sg.items.map((it) => (
                  <DocRow
                    key={it.id}
                    title={it.name}
                    subtitle={niceDate(it.uploadedAt)}
                    onRename={isClient ? () => renameItem(sg.id, it.id) : undefined}
                    onDelete={isClient ? () => deleteItem(sg.id, it.id) : undefined}
                  />
                ))
              )}
            </View>
          ))}
        </View>
      ))}

      {/* Contracts */}
      <View style={styles.card}>
        <Text style={styles.groupTitle}>Contracts</Text>
        <View style={styles.divider} />
        {contracts.length === 0 ? (
          <Text style={styles.empty}>No contracts assigned.</Text>
        ) : (
          contracts.map((ct) => (
            <View key={ct.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{ct.title}</Text>
                <Text style={styles.rowSub}>
                  {ct.status === "pending"
                    ? "Awaiting signature"
                    : ct.status === "viewed"
                    ? "Viewed"
                    : ct.status === "completed"
                    ? "Signed"
                    : ct.status === "declined"
                    ? "Declined"
                    : "Expired"}
                  {ct.dueDate ? ` • Due ${new Date(ct.dueDate).toLocaleDateString()}` : ""}
                </Text>
              </View>
              <StatusChip status={ct.status} />

              {ct.status === "pending" && (
                <TouchableOpacity style={styles.pill} onPress={() => startSigning(ct.id)}>
                  <Text style={styles.pillText}>Sign</Text>
                </TouchableOpacity>
              )}

              {ct.status === "completed" && ct.fileUrl && (
                <TouchableOpacity style={styles.pill} onPress={() => openContract(ct.fileUrl)}>
                  <Text style={styles.pillText}>Open</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      {/* ---- Group Picker Modal ---- */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setPickerVisible(false);
          setPendingFile(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: colors.white,
              padding: 16,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            <Text style={{ fontWeight: "800", color: colors.text, fontSize: 16, marginBottom: 10 }}>
              Choose a section
            </Text>

            <FlatList
              data={groups}
              keyExtractor={(g) => g.id}
              ItemSeparatorComponent={() => (
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#eee" }} />
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ paddingVertical: 12 }}
                  onPress={() => confirmUploadToGroup(item.id)}
                >
                  <Text style={{ color: "#1F2937", fontWeight: "600" }}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={() => {
                setPickerVisible(false);
                setPendingFile(null);
              }}
              style={{ marginTop: 12, alignItems: "center", paddingVertical: 12 }}
            >
              <Text style={{ color: "#6B7280", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------------- Small UI bits ---------------- */
function DocRow({
  title,
  subtitle,
  onRename,
  onDelete,
  onMoveOld,
}: {
  title: string;
  subtitle?: string;
  onRename?: () => void;
  onDelete?: () => void;
  onMoveOld?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      {onMoveOld && (
        <TouchableOpacity style={styles.pill} onPress={onMoveOld}>
          <Text style={styles.pillText}>Move to Old</Text>
        </TouchableOpacity>
      )}
      {onRename && (
        <TouchableOpacity style={styles.pill} onPress={onRename}>
          <Text style={styles.pillText}>Rename</Text>
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity style={[styles.pill, styles.pillDanger]} onPress={onDelete}>
          <Text style={styles.pillDangerText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function StatusChip({ status }: { status: ContractStatus }) {
  const map = {
    pending: { bg: "#FEF3C7", fg: "#92400E", label: "Pending" },
    viewed: { bg: "#DBEAFE", fg: "#1E40AF", label: "Viewed" },
    completed: { bg: "#DCFCE7", fg: "#166534", label: "Signed" },
    declined: { bg: "#FEE2E2", fg: "#991B1B", label: "Declined" },
    expired: { bg: "#F3F4F6", fg: "#111827", label: "Expired" },
  } as const;
  const s = map[status];
  return (
    <View
      style={{
        backgroundColor: s.bg,
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginRight: 8,
      }}
    >
      <Text style={{ color: s.fg, fontWeight: "700" }}>{s.label}</Text>
    </View>
  );
}

/* ---------------- helpers ---------------- */
const niceDate = (iso: string) => new Date(iso).toLocaleDateString();

const inferNameFromMime = (mime?: string | null) => {
  if (!mime) return null;
  if (mime.includes("pdf")) return "Document.pdf";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "Image.jpg";
  if (mime.includes("png")) return "Image.png";
  return "Document";
};

/* ---------------- styles ---------------- */
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
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  note: { marginTop: 8, color: "#6B7280" },

  groupTitle: { fontWeight: "800", color: colors.text, marginBottom: 6, fontSize: 16 },
  subgroupTitle: { fontWeight: "700", color: colors.text, marginBottom: 4, marginTop: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E7EB", marginBottom: 8 },
  dividerThin: { height: StyleSheet.hairlineWidth, backgroundColor: "#EEE", marginBottom: 6 },

  empty: { color: "#9CA3AF", marginVertical: 6 },

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  rowTitle: { color: "#1F2937", fontWeight: "600" },
  rowSub: { color: "#6B7280", fontSize: 12, marginTop: 2 },

  pill: {
    marginLeft: 8,
    backgroundColor: "#E5F0E5",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  pillText: { color: colors.primary, fontWeight: "700" },
  pillDanger: { backgroundColor: "#FEE2E2" },
  pillDangerText: { color: "#B91C1C", fontWeight: "700" },
});
