// app/(drawer)/documents.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Modal, FlatList, ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
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
  const DOC_TYPES = ["Driver's Licence", "Identification", "Right to Work", "National Insurance", "Proof of Address", "Other"];
  const [uploadVisible, setUploadVisible] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState(DOC_TYPES[0]);
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [uploadFile, setUploadFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploadShareCode, setUploadShareCode] = useState("");
  const [uploadDvlaCode, setUploadDvlaCode] = useState("");
  const [uploading, setUploading] = useState(false);

  const resetUpload = () => {
    setUploadTitle("");
    setUploadType(DOC_TYPES[0]);
    setUploadExpiry("");
    setUploadFile(null);
    setUploadShareCode("");
    setUploadDvlaCode("");
    setUploadVisible(false);
  };

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false });
    if (res.canceled || !res.assets?.length) return;
    setUploadFile(res.assets[0]);
    if (!uploadTitle) setUploadTitle(res.assets[0].name?.replace(/\.[^.]+$/, "") || "");
  };

  const submitUpload = async () => {
    if (!uploadTitle.trim() || !uploadFile) {
      Alert.alert("Required", "Please enter a title and select a file.");
      return;
    }
    try {
      setUploading(true);
      await docsApi.upload({
        driver_id: driver!.id,
        type: uploadType,
        file_name: uploadFile.name || "document",
        title: uploadTitle.trim(),
        expiry_date: uploadExpiry || undefined,
      });
      // Submit share code if provided (Right to Work)
      if (uploadType === "Right to Work" && uploadShareCode.trim()) {
        const { driverActions } = await import("../lib/api");
        await driverActions.submitRtwCode(uploadShareCode.trim());
      }
      // Submit DVLA code if provided (Driver's Licence)
      if (uploadType === "Driver's Licence" && uploadDvlaCode.trim()) {
        const { driverActions } = await import("../lib/api");
        await driverActions.submitDvlaCode(uploadDvlaCode.trim());
      }
      // Add to local state
      const typeMap: Record<string, string> = { "Driver's Licence": "licence", "Identification": "identification", "Right to Work": "right_to_work", "National Insurance": "national_insurance", "Proof of Address": "proof_of_address" };
      const groupId = typeMap[uploadType] || "other";
      const newItem: DocItem = {
        id: Math.random().toString(36).slice(2),
        name: uploadTitle.trim(),
        uri: uploadFile.uri,
        type: uploadFile.mimeType ?? null,
        uploadedBy: "candidate",
        uploadedAt: new Date().toISOString(),
      };
      setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, items: [...g.items, newItem] } : g)));
      resetUpload();
      Alert.alert("Uploaded", "Document uploaded successfully.");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const openContract = async (fileUrl?: string) => {
    if (!fileUrl) return;
    await WebBrowser.openBrowserAsync(fileUrl);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.secondary }} contentContainerStyle={{ padding: 16 }}>
      <View style={[styles.card, { marginBottom: 12 }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => setUploadVisible(true)}>
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

      {/* Upload Document Modal */}
      <Modal visible={uploadVisible} transparent animationType="slide" onRequestClose={resetUpload}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={styles.uploadModal}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
              <Text style={{ fontWeight: "800", color: colors.text, fontSize: 16, marginLeft: 8 }}>Upload Document</Text>
            </View>

            {/* Document Title */}
            <Text style={styles.uploadLabel}>Document Title</Text>
            <TextInput
              style={styles.uploadInput}
              value={uploadTitle}
              onChangeText={setUploadTitle}
              placeholder="e.g., Driving Licence Front"
            />

            {/* Document Type */}
            <Text style={styles.uploadLabel}>Document Type</Text>
            <View style={styles.uploadTypeRow}>
              {DOC_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.uploadTypeChip, uploadType === t && styles.uploadTypeChipActive]}
                  onPress={() => setUploadType(t)}
                >
                  <Text style={[styles.uploadTypeText, uploadType === t && styles.uploadTypeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Expiry Date — only for types that expire */}
            {(uploadType === "Driver's Licence" || uploadType === "Identification") && (
              <>
                <Text style={styles.uploadLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.uploadInput}
                  value={uploadExpiry}
                  onChangeText={setUploadExpiry}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                />
              </>
            )}

            {/* DVLA Check Code — for Driver's Licence only */}
            {uploadType === "Driver's Licence" && (
              <>
                <Text style={styles.uploadLabel}>DVLA Check Code</Text>
                <TextInput
                  style={styles.uploadInput}
                  value={uploadDvlaCode}
                  onChangeText={setUploadDvlaCode}
                  placeholder="Enter DVLA check code"
                  autoCapitalize="characters"
                  maxLength={20}
                />
              </>
            )}

            {/* Share Code — for Right to Work only */}
            {uploadType === "Right to Work" && (
              <>
                <Text style={styles.uploadLabel}>Share Code <Text style={{ fontWeight: "400", color: "#9CA3AF" }}>(9 characters)</Text></Text>
                <TextInput
                  style={styles.uploadInput}
                  value={uploadShareCode}
                  onChangeText={setUploadShareCode}
                  placeholder="e.g., ABC123DEF"
                  autoCapitalize="characters"
                  maxLength={9}
                />
              </>
            )}

            {/* File Selection */}
            <Text style={styles.uploadLabel}>File</Text>
            <TouchableOpacity style={styles.uploadDropZone} onPress={pickFile}>
              {uploadFile ? (
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="document" size={28} color={colors.primary} />
                  <Text style={{ fontWeight: "600", color: colors.text, marginTop: 4 }}>{uploadFile.name}</Text>
                </View>
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                  <Text style={{ fontWeight: "600", color: colors.text, marginTop: 4 }}>Tap to select file</Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 2 }}>PDF, JPG, PNG up to 10MB</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Actions */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={styles.uploadCancelBtn} onPress={resetUpload}>
                <Text style={{ color: "#6B7280", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadSubmitBtn, (!uploadTitle.trim() || !uploadFile || uploading) && { opacity: 0.5 }]}
                onPress={submitUpload}
                disabled={!uploadTitle.trim() || !uploadFile || uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={14} color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 4 }}>Upload</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
  uploadPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  uploadPillText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  uploadModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
  },
  uploadLabel: { fontWeight: "700", color: "#374151", fontSize: 13, marginBottom: 6, marginTop: 12 },
  uploadInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
  },
  uploadTypeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  uploadTypeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
  },
  uploadTypeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  uploadTypeText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  uploadTypeTextActive: { color: "#fff" },
  uploadDropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  uploadCancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  uploadSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
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
