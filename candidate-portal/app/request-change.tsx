// app/request-change.tsx
import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import colors from "../theme/colors";

type EditableSection = "Account" | "Emergency Contact" | "Payment & Tax Details";
const EDITABLE: EditableSection[] = ["Account", "Emergency Contact", "Payment & Tax Details"];

export default function RequestChangeScreen() {
  const router = useRouter();
  const raw = useLocalSearchParams();

  // section passed like /request-change?section=Account
  const section = useMemo(() => {
    const s = Array.isArray(raw.section) ? raw.section[0] : raw.section;
    return s ? decodeURIComponent(s) : "";
  }, [raw.section]);

  const isEditable = EDITABLE.includes(section as EditableSection);

  // pull "current" values from params (set by the Profile page)
  const current = useMemo(() => {
    return {
      // Account
      email: getParam(raw, "email_current"),
      phone: getParam(raw, "phone_current"),

      // Emergency contact
      eName: getParam(raw, "name_current"),
      eRelationship: getParam(raw, "relationship_current"),
      ePhone: getParam(raw, "phone_current"),
      eEmail: getParam(raw, "email_current"),

      // Payment & tax
      bank: getParam(raw, "bank_current"),
      sort: getParam(raw, "sort_current"),
      account: getParam(raw, "account_current"),
      utr: getParam(raw, "utr_current"),
      vat: getParam(raw, "vat_current"),
    };
  }, [raw]);

  // "request new" inputs
  const [values, setValues] = useState({
    // Account
    email_new: "",
    phone_new: "",

    // Emergency
    name_new: "",
    relationship_new: "",
    ephone_new: "",
    eemail_new: "",

    // Payment
    bank_new: "",
    sort_new: "",
    account_new: "",
    utr_new: "",
    vat_new: "",
  });

  const set = (k: keyof typeof values, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const submit = () => {
    // Build a minimal payload for now (mock)
    let payload: any = { section };

    if (section === "Account") {
      payload.current = { email: current.email, phone: current.phone };
      payload.requested = { email: values.email_new, phone: values.phone_new };
    } else if (section === "Emergency Contact") {
      payload.current = {
        name: current.eName,
        relationship: current.eRelationship,
        phone: current.ePhone,
        email: current.eEmail,
      };
      payload.requested = {
        name: values.name_new,
        relationship: values.relationship_new,
        phone: values.ephone_new,
        email: values.eemail_new,
      };
    } else if (section === "Payment & Tax Details") {
      payload.current = {
        bank: current.bank,
        sort: current.sort,
        account: current.account,
        utr: current.utr,
        vat: current.vat,
      };
      payload.requested = {
        bank: values.bank_new,
        sort: values.sort_new,
        account: values.account_new,
        utr: values.utr_new,
        vat: values.vat_new,
      };
    }

    // Mock submit for now
    Alert.alert("Change request sent", "Your request has been submitted for approval.");
    router.back();
  };

  // If section is not recognized or is client-only, show banner
  if (!isEditable) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.secondary }} contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Request Change</Text>
          <Text style={styles.sectionLine}>Section: <Text style={styles.bold}>{section || "— —"}</Text></Text>

          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              This section can only be updated by the client. If you believe something is incorrect, please contact
              support.
            </Text>
          </View>

          <Button label="Back" onPress={() => router.back()} />
        </View>
      </ScrollView>
    );
  }

  // Editable forms
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.secondary }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Request Change</Text>
        <Text style={styles.sectionLine}>Section: <Text style={styles.bold}>{section}</Text></Text>

        {section === "Account" && (
          <>
            <Field
              label="Current Email"
              value={current.email}
              readOnly
            />
            <Field
              label="Request New Email"
              value={values.email_new}
              onChangeText={(t) => set("email_new", t)}
              placeholder="Enter new email"
            />

            <Field
              label="Current Phone"
              value={current.phone}
              readOnly
            />
            <Field
              label="Request New Phone"
              value={values.phone_new}
              onChangeText={(t) => set("phone_new", t.replace(/\D/g, ""))}
              placeholder="Enter new phone"
              keyboardType="phone-pad"
            />
          </>
        )}

        {section === "Emergency Contact" && (
          <>
            <Field label="Current Name" value={current.eName} readOnly />
            <Field label="Request New Name" value={values.name_new} onChangeText={(t) => set("name_new", t)} placeholder="Full name" />

            <Field label="Current Relationship" value={current.eRelationship} readOnly />
            <Field label="Request New Relationship" value={values.relationship_new} onChangeText={(t) => set("relationship_new", t)} placeholder="e.g., Spouse" />

            <Field label="Current Phone" value={current.ePhone} readOnly />
            <Field label="Request New Phone" value={values.ephone_new} onChangeText={(t) => set("ephone_new", t.replace(/\D/g, ""))} placeholder="Phone" keyboardType="phone-pad" />

            <Field label="Current Email" value={current.eEmail} readOnly />
            <Field label="Request New Email" value={values.eemail_new} onChangeText={(t) => set("eemail_new", t)} placeholder="Email" keyboardType="email-address" />
          </>
        )}

        {section === "Payment & Tax Details" && (
          <>
            <Field label="Current Bank / Building Society" value={current.bank} readOnly />
            <Field label="Request New Bank / Building Society" value={values.bank_new} onChangeText={(t) => set("bank_new", t)} placeholder="Bank name" />

            <Field label="Current Sort Code" value={current.sort} readOnly />
            <Field label="Request New Sort Code" value={values.sort_new} onChangeText={(t) => set("sort_new", t.replace(/\D/g, ""))} placeholder="e.g., 12-34-56" />

            <Field label="Current Account Number" value={current.account} readOnly />
            <Field label="Request New Account Number" value={values.account_new} onChangeText={(t) => set("account_new", t.replace(/\D/g, ""))} placeholder="Account number" />

            <Field label="Current Unique Tax Reference" value={current.utr} readOnly />
            <Field label="Request New Unique Tax Reference" value={values.utr_new} onChangeText={(t) => set("utr_new", t)} placeholder="UTR" />

            <Field label="Current VAT Number" value={current.vat} readOnly />
            <Field label="Request New VAT Number" value={values.vat_new} onChangeText={(t) => set("vat_new", t)} placeholder="VAT (if applicable)" />
          </>
        )}

        <Button label="Submit Request" onPress={submit} primary />
        <Button label="Back" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

/* ---------------- components & styles ---------------- */
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  readOnly,
  keyboardType,
}: {
  label: string;
  value?: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}) {
  const showValue = value && value.trim() ? value : "— —";
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {readOnly ? (
        <View style={styles.readOnlyBox}>
          <Text style={styles.readOnlyText}>{showValue}</Text>
        </View>
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
        />
      )}
    </View>
  );
}

function Button({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, primary ? styles.btnPrimary : styles.btnGhost]}>
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function getParam(obj: Record<string, any>, key: string): string {
  const v = obj?.[key];
  const s = Array.isArray(v) ? v[0] : v;
  return s ? String(s) : "";
}

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
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 6 },
  sectionLine: { color: "#6B7280", marginBottom: 12 },
  bold: { fontWeight: "700", color: colors.text },

  banner: {
    padding: 12,
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerText: { color: "#9A3412" },

  fieldLabel: { color: "#374151", marginBottom: 6, fontWeight: "600" },
  readOnlyBox: {
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  readOnlyText: { color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  btn: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnGhost: { backgroundColor: "#9BA7A0" },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
