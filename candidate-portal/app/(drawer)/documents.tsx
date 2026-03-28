// app/(drawer)/documents.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Modal, FlatList,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as WebBrowser from "expo-web-browser";
import colors from "../../theme/colors";
import { useAuth } from "../context/AuthContext";
import { documents as docsApi } from "../lib/api";

/* ---------------- Types ---------------- */
type DocItem = {
  id: string;
  name: string;
  uri: string;
  type?: string | null;
  uploadedBy: "client" | "candidate";
  uploadedAt: string;
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
  fileUrl?: string;
};

/* ---------------- Seed groups structure ---------------- */
const seedGroups = (): DocGroup[] => [
  { id: "licence", title: "Driver's Licence", items: [], subgroups: [{ id: "licence-old", title: "Old", items: [] }] },
  { id: "identification", title: "Identification", items: [], subgroups: [{ id: "identification-old", title: "Old", items: [] }] },
  { id: "right-to-work", title: "Right to Work", items: [], subgroups: [{ id: "rtw-old", title: "Old", items: [] }] },
  { id: "national-insurance", title: "National Insurance", items: [], subgroups: [{ id: "ni-old", title: "Old", items: [] }] },
  { id: "vat", title: "VAT", items: [], subgroups: [{ id: "vat-old", title: "Old", items: [] }] },
  { id: "address", title: "Proof of Address", items: [], subgroups: [{ id: "address-old", title: "Old", items: [] }] },
];

/* Map backend document types to group IDs */
const typeToGroupId: Record<string, string> = {
  licence: "licence",
  "driving_licence": "licence",
  identification: "identification",
  passport: "identification",
  "right_to_work": "right-to-work",
  "national_insurance": "national-insurance",
  ni: "national-insurance",
  vat: "vat",
  address: "address",
  "proof_of_address": "address",
};

/* ---------------- Component ---------------- */
export default function DocumentsScreen() {
  const { driver } = useAuth();
  const [groups, setGroups] = useState<DocGroup[]>(seedGroups());

  const [contracts] = useState<Contract[]>([
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

  // Fetch documents from API and populate groups
  useEffect(() => {
    if (!driver?.id) return;
    docsApi.list(driver.id).then((res) => {
      const docs = res.data || [];
      if (docs.length === 0) return;
      setGroups((prev) => {
        const next = prev.map((g) => ({ ...g, items: [...g.items] }));
        for (const doc of docs) {
          const gid = typeToGroupId[doc.type] || typeToGroupId[doc.type?.toLowerCase()] || null;
          if (!gid) continue;
          const group = next.find((g) => g.id === gid);
          if (!group) continue;
          if (group.items.some((it) => it.id === doc.id)) continue;
          group.items.push({
            id: doc.id,
            name: doc.title || doc.file_name || doc.type,
            uri: doc.s3_key || "",
            type: doc.mime_type,
            uploadedBy: "client",
            uploadedAt: doc.uploaded_at || doc.created_at || new Date().toISOString(),
          });
        }
        return next;
      });
    }).catch((err) => console.warn("Failed to fetch documents:", err));
  }, [driver?.id]);

  // Upload flow
  const [pendingFile, setPendingFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const pickAndUpload = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (res.canceled || !res.assets?.length) return;
    setPendingFile(res.assets[0]);
    setPickerVisible(true);
  };

  const confirmUploadToGroup = (groupId: string) => {
    if (!pendingFile) return;
    const file = pendingFile;
    const newItem: DocItem = {
      id: Math.random().toString(36).slice(2),
      name: file.name || "Document",
      uri: file.uri,
      type: file.mimeType ?? null,
      uploadedBy: "candidate",
      uploadedAt: new Date().toISOString(),
    };
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, items: [...g.items, newItem] } : g)));
    const groupTitle = groups.find((g) => g.id === groupId)?.title ?? "Selected section";
    setPickerVisible(false);
    setPendingFile(null);
    Alert.alert("Uploaded", `${newItem.name} added to ${groupTitle}.`);
  };

  const startSigning = async (contractId: string) => {
    const url = "https://example.com/mock-signing";
    await WebBrowser.openBrowserAsync(url);
  };

  const openContract = async (fileUrl?: string) => {
    if (!fileUrl) return;
    await WebBrowser.openBrowserAsync(fileUrl);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.secondary }} contentContainerStyle={{ padding: 16 }}>
      <View style={[styles.card, { marginBottom: 12 }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={pickAndUpload}>
          <Text style={styles.primaryBtnText}>Upload Document</Text>
        </TouchableOpacity>
      </View>

      {groups.map((g) => (
        <View key={g.id} style={styles.card}>
          <Text style={styles.groupTitle}>{g.title}</Text>
          <View style={styles.divider} />
          {g.items.length === 0 ? (
            <Text style={styles.empty}>No documents yet.</Text>
          ) : (
            g.items.map((it) => (
              <DocRow key={it.id} title={it.name} subtitle={niceDate(it.uploadedAt)} />
            ))
          )}
          {g.subgroups?.map((sg) => (
            <View key={sg.id} style={{ marginTop: 12 }}>
              <Text style={styles.subgroupTitle}>{sg.title}</Text>
              <View style={styles.dividerThin} />
              {sg.items.length === 0 ? (
                <Text style={styles.empty}>No documents in this section.</Text>
              ) : (
                sg.items.map((it) => <DocRow key={it.id} title={it.name} subtitle={niceDate(it.uploadedAt)} />)
              )}
            </View>
          ))}
        </View>
      ))}

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
                  {ct.status === "pending" ? "Awaiting signature" : ct.status === "completed" ? "Signed" : ct.status}
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

      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => { setPickerVisible(false); setPendingFile(null); }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.white, padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <Text style={{ fontWeight: "800", color: colors.text, fontSize: 16, marginBottom: 10 }}>Choose a section</Text>
            <FlatList
              data={groups}
              keyExtractor={(g) => g.id}
              ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#eee" }} />}
              renderItem={({ item }) => (
                <TouchableOpacity style={{ paddingVertical: 12 }} onPress={() => confirmUploadToGroup(item.id)}>
                  <Text style={{ color: "#1F2937", fontWeight: "600" }}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => { setPickerVisible(false); setPendingFile(null); }} style={{ marginTop: 12, alignItems: "center", paddingVertical: 12 }}>
              <Text style={{ color: "#6B7280", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------------- Small UI bits ---------------- */
function DocRow({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
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
    <View style={{ backgroundColor: s.bg, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, marginRight: 8 }}>
      <Text style={{ color: s.fg, fontWeight: "700" }}>{s.label}</Text>
    </View>
  );
}

const niceDate = (iso: string) => new Date(iso).toLocaleDateString();

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  groupTitle: { fontWeight: "800", color: colors.text, marginBottom: 6, fontSize: 16 },
  subgroupTitle: { fontWeight: "700", color: colors.text, marginBottom: 4, marginTop: 4 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E7EB", marginBottom: 8 },
  dividerThin: { height: StyleSheet.hairlineWidth, backgroundColor: "#EEE", marginBottom: 6 },
  empty: { color: "#9CA3AF", marginVertical: 6 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  rowTitle: { color: "#1F2937", fontWeight: "600" },
  rowSub: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  pill: { marginLeft: 8, backgroundColor: "#E5F0E5", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { color: colors.primary, fontWeight: "700" },
});
