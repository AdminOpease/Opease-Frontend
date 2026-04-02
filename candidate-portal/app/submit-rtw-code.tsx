// app/submit-rtw-code.tsx
import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import colors from "../theme/colors";
import { useAuth } from "./context/AuthContext";
import { driverActions } from "./lib/api";

export default function SubmitRtwCodeScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert("Required", "Please enter your new Share Code.");
      return;
    }
    if (trimmed.length !== 9) {
      Alert.alert("Invalid", "Share code must be exactly 9 characters.");
      return;
    }
    try {
      setSubmitting(true);
      await driverActions.submitRtwCode(trimmed);
      await refreshProfile();
      Alert.alert("Submitted", "Your new Share Code has been submitted successfully.");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.secondary }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Submit New Share Code</Text>
        <Text style={styles.desc}>
          Your visa / pre-settled status is expiring. Please enter your new share code below so we can verify your right to work.
        </Text>

        <Text style={styles.label}>Share Code (9 characters)</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="e.g. ABC123DEF"
          autoCapitalize="characters"
          maxLength={9}
        />

        <TouchableOpacity
          style={[styles.btn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Submit Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 8 },
  desc: { fontSize: 14, color: "#6B7280", lineHeight: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 2,
    marginBottom: 20,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  backBtn: {
    backgroundColor: "#9BA7A0",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  backBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
