// app/(drawer)/profile.tsx
import React, { useMemo } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import colors from "../../theme/colors";

type CandidateProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  licenceCountryOfIssue?: string;
  licenceNumber: string;
  licenceDatePassed?: string;
  licenceExpiry: string;

  idType?: string;
  idExpiry: string;
  passportCountry: string;

  rightToWork: string;
  shareCode: string;

  niNumber: string;

  addressLine1: string;
  addressLine2?: string;
  town: string;
  county: string;
  postcode: string;

  emergencyName?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;
  emergencyEmail?: string;

  bankName?: string;
  sortCode?: string;
  accountNumber?: string;
  taxReference?: string;
  vatNumber?: string;
};

const empty: CandidateProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  licenceNumber: "",
  licenceExpiry: "",
  idExpiry: "",
  passportCountry: "",
  rightToWork: "",
  shareCode: "",
  niNumber: "",
  addressLine1: "",
  addressLine2: "",
  town: "",
  county: "",
  postcode: "",
};

export default function ProfileScreen() {
  const data = useMemo(() => empty, []);
  const router = useRouter();

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");

  // Push to /request-change with section + current values for that section
  const goEdit = (section: "Account" | "Emergency Contact" | "Payment & Tax Details") => {
    if (section === "Account") {
      router.push({
        pathname: "/request-change",
        params: {
          section,
          email_current: data.email ?? "",
          phone_current: data.phone ?? "",
        },
      });
      return;
    }

    if (section === "Emergency Contact") {
      router.push({
        pathname: "/request-change",
        params: {
          section,
          name_current: data.emergencyName ?? "",
          relationship_current: data.emergencyRelationship ?? "",
          phone_current: data.emergencyPhone ?? "",
          email_current: data.emergencyEmail ?? "",
        },
      });
      return;
    }

    if (section === "Payment & Tax Details") {
      router.push({
        pathname: "/request-change",
        params: {
          section,
          bank_current: data.bankName ?? "",
          sort_current: data.sortCode ?? "",
          account_current: data.accountNumber ?? "",
          utr_current: data.taxReference ?? "",
          vat_current: data.vatNumber ?? "",
        },
      });
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.secondary }} contentContainerStyle={{ padding: 16 }}>
      {/* Editable by candidate */}
      <Section title="Account" onEdit={() => goEdit("Account")}>
        <Row label="Name" value={fullName} />
        <Row label="Email" value={data.email} />
        <Row label="Phone" value={fmt(data.phone)} />
      </Section>

      {/* Read‑only sections (no Edit) */}
      <Section title="Driver’s Licence">
        <Row label="Country of Issue" value={data.licenceCountryOfIssue} />
        <Row label="Licence Number" value={data.licenceNumber} />
        <Row label="Date Test Passed" value={data.licenceDatePassed} />
        <Row label="Expiry" value={data.licenceExpiry} />
      </Section>

      <Section title="Identification">
        <Row label="Document Type" value={data.idType} />
        <Row label="Passport/ID Expiry" value={data.idExpiry} />
        <Row label="Country" value={data.passportCountry} />
      </Section>

      <Section title="Right to Work">
        <Row label="Type" value={data.rightToWork} />
        {data.rightToWork?.toLowerCase() === "share code" && (
          <Row label="Share Code" value={data.shareCode} />
        )}
      </Section>

      <Section title="National Insurance">
        <Row label="NI Number" value={data.niNumber} />
      </Section>

      <Section title="Address">
        <Row
          label="Address"
          value={line([data.addressLine1, data.addressLine2, data.town, data.county])}
        />
        <Row label="Postcode" value={data.postcode} />
      </Section>

      {/* Editable by candidate */}
      <Section title="Emergency Contact" onEdit={() => goEdit("Emergency Contact")}>
        <Row label="Full Name" value={data.emergencyName} />
        <Row label="Relationship" value={data.emergencyRelationship} />
        <Row label="Phone" value={data.emergencyPhone} />
        <Row label="Email" value={data.emergencyEmail} />
      </Section>

      {/* Editable by candidate */}
      <Section title="Payment & Tax Details" onEdit={() => goEdit("Payment & Tax Details")}>
        <Row label="Bank / Building Society" value={data.bankName} />
        <Row label="Sort Code" value={data.sortCode} />
        <Row label="Account Number" value={data.accountNumber} />
        <Row label="Unique Tax Reference" value={data.taxReference} />
        <Row label="VAT Number (If applicable)" value={data.vatNumber} />
      </Section>
    </ScrollView>
  );
}

/* ---------- UI bits ---------- */
function Section({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onEdit ? (
          <TouchableOpacity onPress={onEdit}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  const v = value && value.trim() ? value : "— —";
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label} • </Text>
      <Text style={styles.rowValue}>{v}</Text>
    </View>
  );
}

/* ---------- helpers ---------- */
const fmt = (s?: string) => (s && s.trim() ? s : "");
const line = (parts: (string | undefined)[]) => parts.filter(Boolean).join(", ");

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
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee", marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 6 },
  rowLabel: { color: "#374151" },
  rowValue: { color: "#9CA3AF", flexShrink: 1 },
});
