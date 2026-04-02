// app/(drawer)/profile.tsx
import React from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import colors from "../../theme/colors";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { driver } = useAuth();
  const router = useRouter();

  const d = driver;
  const fullName = d ? [d.first_name, d.last_name].filter(Boolean).join(" ") : "";

  const goEdit = (section: "Account" | "Emergency Contact" | "Payment & Tax Details") => {
    if (section === "Account") {
      router.push({
        pathname: "/request-change",
        params: { section, email_current: d?.email ?? "", phone_current: d?.phone ?? "" },
      });
      return;
    }
    if (section === "Emergency Contact") {
      router.push({
        pathname: "/request-change",
        params: {
          section,
          name_current: d?.emergency_name ?? "",
          relationship_current: d?.emergency_relationship ?? "",
          phone_current: d?.emergency_phone ?? "",
          email_current: d?.emergency_email ?? "",
        },
      });
      return;
    }
    if (section === "Payment & Tax Details") {
      router.push({
        pathname: "/request-change",
        params: {
          section,
          bank_current: d?.bank_name ?? "",
          sort_current: d?.sort_code ?? "",
          account_current: d?.account_number ?? "",
          utr_current: d?.tax_reference ?? "",
          vat_current: d?.vat_number ?? "",
        },
      });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.secondary }} contentContainerStyle={{ padding: 16 }}>
      <Section title="Account" onEdit={() => goEdit("Account")}>
        <Row label="Name" value={fullName} />
        <Row label="Email" value={d?.email} />
        <Row label="Phone" value={d?.phone} />
      </Section>

      <Section title="Driver's Licence">
        <Row label="Country of Issue" value={d?.licence_country} />
        <Row label="Licence Number" value={d?.licence_number} />
        <Row label="Date Test Passed" value={fmtDate(d?.date_test_passed)} />
        <Row label="Expiry" value={fmtDate(d?.licence_expiry)} />
      </Section>

      <Section title="Identification">
        <Row label="Document Type" value={d?.id_document_type} />
        <Row label="Passport/ID Expiry" value={fmtDate(d?.id_expiry)} />
        <Row label="Country" value={d?.passport_country} />
      </Section>

      <Section title="Right to Work">
        <Row label="Type" value={d?.right_to_work} />
        {d?.right_to_work?.toLowerCase() === "share code" && (
          <Row label="Share Code" value={d?.share_code} />
        )}
      </Section>

      <Section title="National Insurance">
        <Row label="NI Number" value={d?.ni_number} />
      </Section>

      <Section title="Address">
        <Row label="Address" value={line([d?.address_line1, d?.address_line2, d?.town, d?.county])} />
        <Row label="Postcode" value={d?.postcode} />
      </Section>

      <Section
        title="Emergency Contact"
        onEdit={!(d?.emergency_name?.trim() && d?.emergency_phone?.trim()) ? () => goEdit("Emergency Contact") : undefined}
        locked={!!(d?.emergency_name?.trim() && d?.emergency_phone?.trim())}
        lockedMessage="Contact your manager to request changes"
      >
        <Row label="Full Name" value={d?.emergency_name} />
        <Row label="Relationship" value={d?.emergency_relationship} />
        <Row label="Phone" value={d?.emergency_phone} />
        <Row label="Email" value={d?.emergency_email} />
      </Section>

      <Section
        title="Payment & Tax Details"
        onEdit={!(d?.bank_name?.trim() && d?.sort_code?.trim() && d?.account_number?.trim()) ? () => goEdit("Payment & Tax Details") : undefined}
        locked={!!(d?.bank_name?.trim() && d?.sort_code?.trim() && d?.account_number?.trim())}
        lockedMessage="Contact your manager to request changes"
      >
        <Row label="Bank / Building Society" value={d?.bank_name} />
        <Row label="Sort Code" value={d?.sort_code} />
        <Row label="Account Number" value={d?.account_number} />
        <Row label="Unique Tax Reference" value={d?.tax_reference} />
        <Row label="VAT Number (If applicable)" value={d?.vat_number} />
      </Section>
    </ScrollView>
  );
}

/* ---------- UI bits ---------- */
function Section({ title, children, onEdit, locked, lockedMessage }: { title: string; children: React.ReactNode; onEdit?: () => void; locked?: boolean; lockedMessage?: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onEdit ? (
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        ) : locked ? (
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.lockedText}>🔒 Locked</Text>
            {lockedMessage ? <Text style={[styles.lockedText, { fontSize: 11 }]}>{lockedMessage}</Text> : null}
          </View>
        ) : null}
      </View>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  const str = value != null ? String(value) : "";
  const v = str.trim() ? str : "— —";
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label} • </Text>
      <Text style={styles.rowValue}>{v}</Text>
    </View>
  );
}

const line = (parts: (string | null | undefined)[]) => parts.filter(Boolean).join(", ");

/** Format a value that might be a Unix timestamp (ms), ISO string, or plain date string */
function fmtDate(val: string | number | null | undefined): string | null {
  if (val == null) return null;
  const n = typeof val === "string" ? Number(val) : val;
  // If it's a large number, treat as Unix ms timestamp
  if (typeof n === "number" && !isNaN(n) && n > 1e9) {
    return new Date(n).toLocaleDateString("en-GB");
  }
  // If it's a date-like string, format it
  if (typeof val === "string" && val.match(/^\d{4}-\d{2}/)) {
    return new Date(val).toLocaleDateString("en-GB");
  }
  return String(val);
}

/* ---------- styles ---------- */
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
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontWeight: "700", color: colors.text, marginBottom: 6 },
  editText: { color: colors.primary, fontWeight: "600" },
  lockedText: { color: "#9CA3AF", fontWeight: "600", fontSize: 13 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee", marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 6 },
  rowLabel: { color: "#374151" },
  rowValue: { color: "#9CA3AF", flexShrink: 1 },
});
