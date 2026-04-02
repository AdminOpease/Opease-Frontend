// app/(tabs)/dashboard.tsx
import React, { useMemo, useEffect, useState } from "react";
import {
  ScrollView, View, Text, TextInput, StyleSheet, ActivityIndicator,
  FlatList, AppState, TouchableOpacity, Alert, Modal,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import colors from "../../theme/colors";
import { useAuth } from "../context/AuthContext";
import { documents as docsApi, applications as appsApi, driverActions, availability as availApi } from "../lib/api";

/* ---------- Types ---------- */
type DriverStatus = "Onboarding" | "Active" | "Inactive" | "Offboarded";

/* ---------- UI helpers ---------- */
const dash = (v?: string | null) => (v && v.trim() ? v : "— —");

const STATUS_STYLES: Record<DriverStatus, { bg: string; fg: string; label: string }> = {
  Onboarding: { bg: "#FEF3C7", fg: "#92400E", label: "Onboarding" },
  Active: { bg: "#DCFCE7", fg: "#065F46", label: "Active" },
  Inactive: { bg: "#E5E7EB", fg: "#374151", label: "Inactive" },
  Offboarded: { bg: "#FEE2E2", fg: "#991B1B", label: "Offboarded" },
};

function StatusChip({ status }: { status: DriverStatus }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Onboarding;
  return (
    <View style={[styles.chip, { backgroundColor: s.bg }]}>
      <Text style={[styles.chipText, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  const parts = label.split("ID");
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>
        {parts[0]}
        {parts.length > 1 && <Text style={{ fontWeight: "700" }}>ID</Text>}
        {parts[1] ?? ""} •{" "}
      </Text>
      <Text style={styles.rowValue}>{dash(value)}</Text>
    </View>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
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

/* ---------- FIR Upload Item ---------- */
function FirDocItem({ category, driverId }: { category: string; driverId: string }) {
  const [status, setStatus] = useState<"pending" | "uploading" | "done">("pending");

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (result.canceled) return;

      setStatus("uploading");
      const file = result.assets[0];
      await docsApi.upload({
        driver_id: driverId,
        type: category,
        file_name: file.name,
      });
      setStatus("done");
    } catch (e: any) {
      setStatus("pending");
      Alert.alert("Upload Failed", e.message || "Please try again.");
    }
  };

  return (
    <View style={styles.firItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.firCategory}>{category}</Text>
      </View>
      {status === "done" ? (
        <View style={styles.firDoneChip}>
          <Ionicons name="checkmark-circle" size={16} color="#065F46" />
          <Text style={styles.firDoneText}>Uploaded</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.firUploadBtn}
          onPress={handleUpload}
          disabled={status === "uploading"}
        >
          {status === "uploading" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={14} color="#fff" />
              <Text style={styles.firUploadText}>Upload</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ---------- Screen ---------- */
export default function DashboardScreen() {
  const { driver, application, refreshProfile } = useAuth();
  const router = useRouter();

  // Auto-refresh profile every 30s and when app returns to foreground
  useEffect(() => {
    refreshProfile();
    const interval = setInterval(refreshProfile, 5_000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshProfile();
    });
    return () => { clearInterval(interval); sub.remove(); };
  }, [refreshProfile]);

  // Fetch availability requests for active drivers
  useEffect(() => {
    if (driver?.status !== "Active") return;
    const fetchAvail = () => {
      availApi.mine().then((res: any) => {
        setAvailRequests(res.data || []);
      }).catch(() => {});
    };
    fetchAvail();
    const iv = setInterval(fetchAvail, 15_000);
    return () => clearInterval(iv);
  }, [driver?.status]);

  const toggleAvailDay = (reqId: string, day: string) => {
    setAvailDays((prev) => {
      const cur = prev[reqId] || {};
      const val = cur[day] === "A" ? "N" : "A";
      return { ...prev, [reqId]: { ...cur, [day]: val } };
    });
  };

  const handleSubmitAvail = async (reqId: string) => {
    setAvailSubmitting(reqId);
    try {
      const days = availDays[reqId] || {};
      const notes = availNotes[reqId] || "";
      await availApi.submit(reqId, { ...days, notes });
      setAvailSubmitted((prev) => new Set([...prev, reqId]));
      setAvailRequests((prev) => prev.filter((r) => r.id !== reqId));
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to submit.");
    }
    setAvailSubmitting(null);
  };

  const [confirmingFlex, setConfirmingFlex] = useState(false);
  const [confirmingDl, setConfirmingDl] = useState(false);

  // Inline action modals for expiry tasks
  const [showDvlaModal, setShowDvlaModal] = useState(false);

  // Availability requests
  const [availRequests, setAvailRequests] = useState<any[]>([]);
  const [availDays, setAvailDays] = useState<Record<string, Record<string, string>>>({});
  const [availNotes, setAvailNotes] = useState<Record<string, string>>({});
  const [availSubmitting, setAvailSubmitting] = useState<string | null>(null);
  const [availSubmitted, setAvailSubmitted] = useState<Set<string>>(new Set());
  const [showRtwModal, setShowRtwModal] = useState(false);
  const [showLicenceUpload, setShowLicenceUpload] = useState(false);
  const [dvlaCodeInput, setDvlaCodeInput] = useState("");
  const [rtwCodeInput, setRtwCodeInput] = useState("");
  const [submittingCode, setSubmittingCode] = useState(false);

  const handleConfirmFlex = async () => {
    try {
      setConfirmingFlex(true);
      await appsApi.confirmFlex();
      await refreshProfile();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Please try again.");
    } finally {
      setConfirmingFlex(false);
    }
  };

  const handleConfirmDl = async () => {
    try {
      setConfirmingDl(true);
      await appsApi.confirmDl();
      await refreshProfile();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Please try again.");
    } finally {
      setConfirmingDl(false);
    }
  };

  const [bookingSlot, setBookingSlot] = useState<string | null>(null);

  const handleBookDrivingTest = async (slot: { date: string; time: string }) => {
    try {
      setBookingSlot(`${slot.date}${slot.time}`);
      await appsApi.bookDrivingTest(slot);
      await refreshProfile();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Please try again.");
    } finally {
      setBookingSlot(null);
    }
  };

  const drivingTestSlots: { date: string; time: string }[] = useMemo(() => {
    if (!application?.driving_test_slots) return [];
    try { return JSON.parse(application.driving_test_slots); } catch { return []; }
  }, [application?.driving_test_slots]);

  // Training booking
  const [bookingTraining, setBookingTraining] = useState<string | null>(null);

  const handleBookTraining = async (slot: { date: string; time: string }) => {
    try {
      setBookingTraining(`${slot.date}${slot.time}`);
      await appsApi.bookTraining(slot);
      await refreshProfile();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Please try again.");
    } finally {
      setBookingTraining(null);
    }
  };

  const trainingSlots: { date: string; time: string }[] = useMemo(() => {
    if (!application?.training_slots) return [];
    try { return JSON.parse(application.training_slots); } catch { return []; }
  }, [application?.training_slots]);

  const trainingBooked = useMemo(() => {
    if (!application?.training_booked) return null;
    try {
      const parsed = JSON.parse(application.training_booked);
      if (parsed?.date && parsed?.time) return parsed as { date: string; time: string };
    } catch {}
    return null;
  }, [application?.training_booked]);

  const trainingMessage = application?.training_message || '';

  const bookedSlot = useMemo(() => {
    try {
      const parsed = JSON.parse(application?.contract_signing || "");
      if (parsed?.date && parsed?.time) return parsed as { date: string; time: string };
    } catch {}
    return null;
  }, [application?.contract_signing]);

  const status = (driver?.status as DriverStatus) || "Onboarding";
  const showMessages = status === "Onboarding";
  const isDeactivated = status === "Inactive" || status === "Offboarded";

  const firMissingDocs: string[] = useMemo(() => {
    if (!application?.fir_missing_docs) return [];
    try { return JSON.parse(application.fir_missing_docs); } catch { return []; }
  }, [application?.fir_missing_docs]);

  const isFir = application?.pre_dcc === "FIR" && firMissingDocs.length > 0;

  const messages = useMemo(() => {
    if (!application) return ["Thanks for starting your application."];

    const preDcc = application.pre_dcc || "In Review";

    // Pre-DCC stage: documents are being checked
    if (preDcc === "In Review") {
      return ["We are currently checking your documents."];
    }
    if (preDcc === "FIR") {
      return ["Further information is required. Please upload the following documents:"];
    }
    if (preDcc === "DMR") {
      return ["Your document review is complete. Unfortunately, you do not meet the criteria. We are unable to continue with your application. We wish you all the best!"];
    }

    // Pre-DCC complete — if Account ID is set, flex instructions show instead
    if (preDcc === "Complete") {
      if (driver?.amazon_id?.trim()) return [];
      return ["Your document review is complete. You will shortly receive the instructions for the next steps. Please check again later."];
    }

    const msgs: string[] = [];
    if (application.bgc === "Pending") msgs.push("Background check is pending.");
    if (!application.training_date) msgs.push("Training date will be assigned soon.");
    if (application.contract_signing !== "Complete") msgs.push("Please sign your contract when available.");
    if (msgs.length === 0) msgs.push("All steps completed. Awaiting activation.");
    return msgs;
  }, [application, driver?.amazon_id]);

  if (!driver) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.secondary }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Section
        title={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.sectionTitle}>Driver Status: </Text>
            <StatusChip status={status} />
          </View>
        }
      >
        <Row label="Account ID" value={driver.amazon_id} />
        <Row label="Driver ID" value={driver.transporter_id} />
      </Section>

      {isDeactivated && (
        <Section title="Account Status">
          <Text style={{ fontSize: 14, color: "#666", textAlign: "center", paddingVertical: 24 }}>
            {status === "Inactive"
              ? "Your account is currently inactive. Please contact your manager for more information."
              : "You have been offboarded. Please contact your manager if you believe this is an error."}
          </Text>
        </Section>
      )}

      {!isDeactivated && showMessages && (
        <Section title="Messages">
          {messages.map((msg) => (
            <Text key={msg} style={styles.messageItem}>• {msg}</Text>
          ))}

          {isFir && (
            <View style={styles.firList}>
              {firMissingDocs.map((cat) => (
                <FirDocItem key={cat} category={cat} driverId={driver.id} />
              ))}
            </View>
          )}

          {!!driver.amazon_id?.trim() && application?.dl_verification !== "Pass" && (
            <View style={styles.flexInstructions}>
              <Text style={styles.flexLink}>https://flex.amazon.co.uk/download-app</Text>
              <Text style={styles.flexText}>
                When you have a moment, please download the flex app above.
              </Text>
              <Text style={styles.flexText}>
                ID: <Text style={{ fontWeight: "700" }}>{driver.amazon_id}</Text>
              </Text>
              <Text style={styles.flexText}>Password: velox1234</Text>
              <Text style={styles.flexText}>Please log in, using the details above.</Text>
              <Text style={styles.flexText}>
                There will be steps to complete on the app. The last step would be uploading your driving licence for verification, which will take 24hrs.
              </Text>

              {application?.dl_verification !== "Fail" && (
                application?.flex_confirmed ? (
                  <View style={styles.confirmedChip}>
                    <Ionicons name="checkmark-circle" size={18} color="#065F46" />
                    <Text style={styles.confirmedText}>Confirmed</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={handleConfirmFlex}
                    disabled={confirmingFlex}
                  >
                    {confirmingFlex ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.confirmBtnText}>I have completed the above</Text>
                    )}
                  </TouchableOpacity>
                )
              )}
            </View>
          )}

          {/* Driving Test + Safety Training Booking */}
          {!application?.driving_test_result && (bookedSlot || drivingTestSlots.length > 0) && (
            <View style={styles.dtIntroSection}>
              <Text style={styles.dtIntroText}>
                The next step is a driving test. As we you will be using a Medium-Wheel Base vans, we would like to see that you are capable to park and manoeuvre the vehicle. After the test, will conduct a safety training as well. Please choose your availability from the option below.
              </Text>
            </View>
          )}

          {bookedSlot && !application?.driving_test_result && (
            <View style={styles.dtBookedSection}>
              <Ionicons name="checkmark-circle" size={20} color="#065F46" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.dtBookedTitle}>Driving Test + Safety Training Booked</Text>
                <Text style={styles.dtBookedDate}>
                  {new Date(bookedSlot.date + "T00:00").toLocaleDateString("en-GB", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })} at {bookedSlot.time}
                </Text>
              </View>
            </View>
          )}

          {!bookedSlot && drivingTestSlots.length > 0 && !application?.driving_test_result && (
            <View style={styles.dtSlotSection}>
              <Text style={styles.dtTitle}>Driving Test + Safety Training — Please select a date and time:</Text>
              {drivingTestSlots.map((slot) => {
                const key = `${slot.date}${slot.time}`;
                const isLoading = bookingSlot === key;
                return (
                  <View key={key} style={styles.dtSlotItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dtSlotText}>
                        {new Date(slot.date + "T00:00").toLocaleDateString("en-GB", {
                          weekday: "short", day: "numeric", month: "short",
                        })} at {slot.time}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dtBookBtn}
                      onPress={() => handleBookDrivingTest(slot)}
                      disabled={!!bookingSlot}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.dtBookBtnText}>Book</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Driving Test Result Messages */}
          {application?.driving_test_result === "Pass" && (!application?.bgc || application.bgc === "—") && (
            <View style={styles.dlSection}>
              <Text style={styles.dlPassText}>
                Congratulations! You have passed the driving test and safety training. You will shortly receive the next steps. Please check again later.
              </Text>
            </View>
          )}

          {application?.driving_test_result === "Fail" && (
            <View style={styles.dlFailSection}>
              <Text style={styles.dlFailText}>
                Unfortunately, you did not pass the driving test. We are unable to continue with your application. We wish you all the best!
              </Text>
            </View>
          )}

          {/* Background Check Instructions — only show after flex confirmed + DL passed */}
          {!!application?.flex_confirmed && application?.dl_verification === "Pass" && application?.bgc === "Not Applied" && (
            <View style={styles.bgcInstructions}>
              <Text style={styles.bgcTitle}>Background Check</Text>
              <Text style={styles.bgcText}>
                You are now ready to apply for the background check
              </Text>
              <Text style={[styles.bgcText, { fontStyle: "italic" }]}>
                (This is at no cost to you)
              </Text>
              <Text style={styles.bgcText}>
                When you have a moment, please follow the steps below:
              </Text>
              <Text style={styles.bgcStepTitle}>Step 1</Text>
              <Text style={styles.bgcText}>
                Please press start on the background check section of the Flex app. (If you don't have the option, it means it has been pressed already)
              </Text>
              <Text style={styles.bgcStepTitle}>Step 2</Text>
              <Text style={styles.bgcText}>
                Press <Text style={styles.bgcLink}>https://login.one.com/mail</Text>
              </Text>
              <Text style={styles.bgcStepTitle}>Step 3</Text>
              <Text style={styles.bgcText}>
                Log into your email{"\n"}ID: <Text style={{ fontWeight: "700" }}>{driver.amazon_id || "—"}</Text>{"\n"}Password: velox1234
              </Text>
              <Text style={styles.bgcStepTitle}>Step 4</Text>
              <Text style={styles.bgcText}>
                You will see an email from Accurate CS. It will have the subject "Amazon Background Check - Screening Invitation". Please press on the email and please find the section "Please go to the following link and provide information:". Below there will be a link you will need to copy and paste onto your browser URL section. This is the form to complete and submit for your background check.
              </Text>
            </View>
          )}

          {!!application?.flex_confirmed && application?.dl_verification === "Pass" && application?.bgc === "Not Applied" && (
            <View style={[styles.bgcInstructions, { marginTop: 12, backgroundColor: "#FEF9C3", borderLeftColor: "#EAB308" }]}>
              <Text style={[styles.bgcText, { color: "#713F12" }]}>
                If you have completed all steps, please be patient as this page will update within 24-48 to reflect the progress. If it is not yet complete, you will receive a reminder.
              </Text>
            </View>
          )}

          {!!application?.flex_confirmed && application?.dl_verification === "Pass" && application?.bgc === "Pending" && (
            <View style={[styles.bgcInstructions, { backgroundColor: "#FEF9C3", borderLeftColor: "#EAB308" }]}>
              <Text style={[styles.bgcText, { color: "#713F12" }]}>
                Your background check is in progress. We will update you once it is complete.
              </Text>
            </View>
          )}

          {!!application?.flex_confirmed && application?.dl_verification === "Pass" && application?.bgc === "Pass" && !trainingSlots.length && !trainingBooked && (
            <View style={styles.dlSection}>
              <Text style={styles.dlPassText}>
                Your background check is complete. You will shortly receive the next steps. Please check again later.
              </Text>
            </View>
          )}

          {!!application?.flex_confirmed && application?.dl_verification === "Pass" && application?.bgc === "Fail" && (
            <View style={styles.dlFailSection}>
              <Text style={styles.dlFailText}>
                Unfortunately, your background check was not successful. We are unable to continue with your application. We wish you all the best!
              </Text>
            </View>
          )}

          {/* Online Training Booking */}

          {application?.training_result === "Complete" && (!application?.dcc_date || application.dcc_date === "—") && (
            <View style={styles.dlSection}>
              <Text style={styles.dlPassText}>
                Congratulations! You have completed your online training. You will shortly receive the next steps. Please check again later.
              </Text>
            </View>
          )}

          {application?.training_result === "Not Complete" && (
            <View style={styles.dlFailSection}>
              <Text style={styles.dlFailText}>
                Unfortunately, your online training was not completed successfully. We are unable to continue with your application. We wish you all the best!
              </Text>
            </View>
          )}

          {!application?.training_result && trainingBooked && !application?.training_message && !application?.training_result && (
            <View style={[styles.dtBookedSection, { backgroundColor: "#EFF6FF", borderLeftColor: "#3B82F6" }]}>
              <Ionicons name="time-outline" size={20} color="#2563EB" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={[styles.dtBookedTitle, { color: "#1E3A5F" }]}>Online Training — Date Requested</Text>
                <Text style={[styles.dtBookedDate, { color: "#1E3A5F" }]}>
                  {new Date(trainingBooked.date + "T00:00").toLocaleDateString("en-GB", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })} at {trainingBooked.time}
                </Text>
              </View>
            </View>
          )}

          {!application?.training_result && trainingBooked && !!application?.training_message && (
            <View style={styles.dtBookedSection}>
              <Ionicons name="checkmark-circle" size={20} color="#065F46" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.dtBookedTitle}>Online Training — Booked</Text>
                <Text style={styles.dtBookedDate}>
                  {new Date(trainingBooked.date + "T00:00").toLocaleDateString("en-GB", {
                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                  })} at {trainingBooked.time}
                </Text>
                <Text style={[styles.dtBookedDate, { marginTop: 8 }]}>
                  At 9am, please click on the link below and use the DISPRZ ID and Password to start your training when instructed by the trainer
                </Text>
              </View>
            </View>
          )}

          {!application?.training_result && !!application?.training_message && trainingBooked && (
            <View style={styles.dtIntroSection}>
              <Text style={styles.dtIntroText}>{application.training_message}</Text>
            </View>
          )}

          {!application?.training_result && !trainingBooked && trainingSlots.length > 0 && (
            <View style={styles.dtSlotSection}>
              <Text style={styles.dtTitle}>Online Training — Please select a date and time:</Text>
              {trainingSlots.map((slot) => {
                const key = `t-${slot.date}${slot.time}`;
                const isLoading = bookingTraining === `${slot.date}${slot.time}`;
                return (
                  <View key={key} style={styles.dtSlotItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dtSlotText}>
                        {new Date(slot.date + "T00:00").toLocaleDateString("en-GB", {
                          weekday: "short", day: "numeric", month: "short",
                        })} at {slot.time}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dtBookBtn}
                      onPress={() => handleBookTraining(slot)}
                      disabled={!!bookingTraining}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.dtBookBtnText}>Book</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
          {/* DCC — Contract Signing */}
          {application?.dcc_date === "Need to Review" && (
            <View style={styles.bgcInstructions}>
              <Text style={styles.bgcTitle}>Contracts</Text>
              <Text style={styles.bgcStepTitle}>Step 1</Text>
              <Text style={styles.bgcText}>
                Press <Text style={styles.bgcLink}>https://login.one.com/mail</Text>
              </Text>
              <Text style={styles.bgcStepTitle}>Step 2</Text>
              <Text style={styles.bgcText}>
                Log into your email{"\n"}ID: <Text style={{ fontWeight: "700" }}>{driver.amazon_id || "—"}</Text>{"\n"}Password: velox1234
              </Text>
              <Text style={[styles.bgcText, { marginTop: 8 }]}>
                You have been sent contracts to sign. Please follow the instructions above to review and sign all.
              </Text>
            </View>
          )}

          {/* Bank Details & Emergency Contact — show from DCC onwards until filled */}
          {(application?.dcc_date === "Need to Review" || application?.dcc_date === "Complete") && (
            (() => {
              const hasBankDetails = !!(driver.bank_name?.trim() && driver.sort_code?.trim() && driver.account_number?.trim());
              const hasEmergency = !!(driver.emergency_name?.trim() && driver.emergency_phone?.trim());
              const needsBank = !hasBankDetails;
              const needsEmergency = !hasEmergency;
              if (!needsBank && !needsEmergency) return null;
              return (
                <View style={[styles.bgcInstructions, { backgroundColor: "#FEF9C3", borderLeftColor: "#EAB308", marginTop: 12 }]}>
                  <Text style={[styles.bgcTitle, { color: "#713F12" }]}>Action Required</Text>
                  {needsBank && (
                    <>
                      <Text style={[styles.bgcText, { color: "#713F12" }]}>
                        Please enter your Payment & Tax Details (bank name, sort code, account number).
                      </Text>
                      <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: "#EAB308", marginTop: 6, marginBottom: needsEmergency ? 12 : 0 }]}
                        onPress={() => router.push({
                          pathname: "/request-change",
                          params: {
                            section: "Payment & Tax Details",
                            bank_current: driver.bank_name ?? "",
                            sort_current: driver.sort_code ?? "",
                            account_current: driver.account_number ?? "",
                            utr_current: driver.tax_reference ?? "",
                            vat_current: driver.vat_number ?? "",
                          },
                        })}
                      >
                        <Text style={styles.confirmBtnText}>Enter Payment Details</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {needsEmergency && (
                    <>
                      <Text style={[styles.bgcText, { color: "#713F12" }]}>
                        Please enter your Emergency Contact details.
                      </Text>
                      <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: "#EAB308", marginTop: 6 }]}
                        onPress={() => router.push({
                          pathname: "/request-change",
                          params: {
                            section: "Emergency Contact",
                            name_current: driver.emergency_name ?? "",
                            relationship_current: driver.emergency_relationship ?? "",
                            phone_current: driver.emergency_phone ?? "",
                            email_current: driver.emergency_email ?? "",
                          },
                        })}
                      >
                        <Text style={styles.confirmBtnText}>Enter Emergency Contact</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            })()
          )}

          {application?.dcc_date === "Complete" && (
            <View style={styles.dlSection}>
              <Text style={styles.dlPassText}>
                Congratulations! All steps are now complete. Your onboarding is finished and you will be activated shortly.
              </Text>
            </View>
          )}
        </Section>
      )}

      {/* ── Availability Requests ── */}
      {status === 'Active' && availRequests.length > 0 && availRequests.map((req) => {
        const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        const startD = new Date(req.start_date + "T00:00");
        const weekLabel = `Week ${req.week_number}: ${startD.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${new Date(req.end_date + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
        const isSubmitted = req.status === "submitted" || availSubmitted.has(req.id);

        // For pending: use local state; for submitted: use server data
        const getDayVal = (day: string) => {
          if (isSubmitted) return req[day] || null;
          return (availDays[req.id] || {})[day] || null;
        };

        return (
          <Section key={req.id} title={isSubmitted ? "Your Availability" : "Availability Request"}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 8 }}>{weekLabel}</Text>
            {!isSubmitted && (
              <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
                Please select your availability for each day below.
              </Text>
            )}
            {isSubmitted && (
              <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>
                Submitted. Contact your manager if you need to make changes.
              </Text>
            )}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {DAY_KEYS.map((day, i) => {
                const val = getDayVal(day);
                const isAvail = val === "A";
                const isNotAvail = val === "N";
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={isSubmitted ? undefined : () => toggleAvailDay(req.id, day)}
                    disabled={isSubmitted}
                    activeOpacity={isSubmitted ? 1 : 0.7}
                    style={{
                      flex: 1,
                      minWidth: 70,
                      paddingVertical: 12,
                      borderRadius: 8,
                      alignItems: "center",
                      backgroundColor: isAvail ? "#DCFCE7" : isNotAvail ? "#FEE2E2" : "#F3F4F6",
                      borderWidth: 2,
                      borderColor: isAvail ? "#065F46" : isNotAvail ? "#991B1B" : "#E5E7EB",
                      opacity: isSubmitted ? 0.85 : 1,
                    }}
                  >
                    <Text style={{ fontWeight: "700", fontSize: 12, color: isAvail ? "#065F46" : isNotAvail ? "#991B1B" : "#374151" }}>
                      {DAY_LABELS[i]}
                    </Text>
                    <Ionicons
                      name={isAvail ? "checkmark-circle" : isNotAvail ? "close-circle" : "ellipse-outline"}
                      size={20}
                      color={isAvail ? "#065F46" : isNotAvail ? "#991B1B" : "#9CA3AF"}
                      style={{ marginTop: 4 }}
                    />
                    <Text style={{ fontSize: 10, color: isAvail ? "#065F46" : isNotAvail ? "#991B1B" : "#9CA3AF", marginTop: 2 }}>
                      {isAvail ? "Available" : isNotAvail ? "Not Avail." : "Tap"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {!isSubmitted && (
              <>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 13,
                    minHeight: 60,
                    textAlignVertical: "top",
                    marginBottom: 12,
                  }}
                  placeholder="Notes (optional)"
                  multiline
                  value={availNotes[req.id] || ""}
                  onChangeText={(t) => setAvailNotes((prev) => ({ ...prev, [req.id]: t }))}
                />
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleSubmitAvail(req.id)}
                  disabled={availSubmitting === req.id}
                >
                  {availSubmitting === req.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.confirmBtnText}>Submit Availability</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {isSubmitted && req.notes ? (
              <Text style={{ fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>Notes: {req.notes}</Text>
            ) : null}
          </Section>
        );
      })}

      {/* Action Required — Expiry Notifications */}
      {status === 'Active' && driver && (() => {
        const parseD = (val: string | number | null) => {
          if (!val) return null;
          const n = typeof val === "string" ? Number(val) : val;
          if (typeof n === "number" && !isNaN(n) && n > 1e9) return new Date(n);
          const d = new Date(val as string);
          return isNaN(d.getTime()) ? null : d;
        };
        const daysTo = (val: string | number | null) => {
          const d = parseD(val);
          if (!d) return null;
          const now = new Date(); now.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
          return Math.round((d.getTime() - now.getTime()) / 86400000);
        };

        type Task = { id: string; title: string; desc: string; action?: () => void; done: boolean; label?: string };
        const tasks: Task[] = [];

        // Licence expiry
        if (driver.licence_expiry) {
          const days = daysTo(driver.licence_expiry);
          if (days !== null && days <= 30) {
            tasks.push({
              id: "x_licence", title: "Licence Expiring Soon",
              desc: `Your driving licence expires in ${days} day${days !== 1 ? "s" : ""}. Please upload your renewed licence.`,
              action: () => setShowLicenceUpload(true), done: false, label: "Upload",
            });
          }
        }

        // DVLA check
        if (driver.last_dvla_check) {
          const cd = parseD(driver.last_dvla_check);
          if (cd) {
            cd.setMonth(cd.getMonth() + 3);
            const days = daysTo(cd.toISOString().slice(0, 10));
            if (days !== null && days <= 30) {
              const hasCode = !!driver.dvla_check_code;
              tasks.push({
                id: "x_dvla", title: "DVLA Check Due",
                desc: hasCode ? "Your DVLA check code has been submitted. Awaiting review." : "Your DVLA check is due. Please submit your DVLA Check Code.",
                action: hasCode ? undefined : () => setShowDvlaModal(true), done: hasCode, label: hasCode ? undefined : "Submit Code",
              });
            }
          }
        }

        // RTW expiry
        if (driver.right_to_work && !["British Passport", "Birth Certificate"].includes(driver.right_to_work) && driver.visa_expiry) {
          const days = daysTo(driver.visa_expiry);
          if (days !== null && days <= 30) {
            const hasCode = !!driver.rtw_share_code_new;
            tasks.push({
              id: "x_rtw", title: "Right to Work Expiring",
              desc: hasCode ? "Your new share code has been submitted. Awaiting review." : `Your visa expires in ${days} day${days !== 1 ? "s" : ""}. Please submit your new share code.`,
              action: hasCode ? undefined : () => setShowRtwModal(true), done: hasCode, label: hasCode ? undefined : "Submit Code",
            });
          }
        }

        const pending = tasks.filter((t) => !t.done);
        if (pending.length === 0 && tasks.length === 0) return null;

        return (
          <Section
            title={
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.sectionTitle}>Action Required</Text>
                {pending.length > 0 && (
                  <View style={styles.badge}><Text style={styles.badgeText}>{pending.length}</Text></View>
                )}
              </View>
            }
          >
            {tasks.map((t) => (
              <View key={t.id} style={styles.taskRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, t.done && { opacity: 0.6 }]}>{t.title}</Text>
                  <Text style={[styles.taskDesc, t.done && { opacity: 0.6 }]}>{t.desc}</Text>
                </View>
                {!t.done && t.action && t.label && (
                  <TouchableOpacity style={styles.taskBtn} onPress={t.action}>
                    <Text style={styles.taskBtnText}>{t.label}</Text>
                  </TouchableOpacity>
                )}
                {t.done && (
                  <View style={styles.taskDone}>
                    <Ionicons name="checkmark-circle" size={16} color="#065F46" />
                    <Text style={{ color: "#065F46", fontWeight: "600", fontSize: 12 }}>Done</Text>
                  </View>
                )}
              </View>
            ))}
          </Section>
        );
      })()}
      {/* DVLA Code Modal */}
      <Modal visible={showDvlaModal} transparent animationType="fade" onRequestClose={() => setShowDvlaModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit DVLA Check Code</Text>
            <Text style={styles.modalDesc}>Please enter your DVLA check code below.</Text>
            <TextInput
              style={styles.modalInput}
              value={dvlaCodeInput}
              onChangeText={setDvlaCodeInput}
              placeholder="Enter DVLA check code"
              autoCapitalize="characters"
              maxLength={20}
            />
            <TouchableOpacity
              style={[styles.modalSubmitBtn, (!dvlaCodeInput.trim() || submittingCode) && { opacity: 0.5 }]}
              disabled={!dvlaCodeInput.trim() || submittingCode}
              onPress={async () => {
                try {
                  setSubmittingCode(true);
                  await driverActions.submitDvlaCode(dvlaCodeInput.trim());
                  await refreshProfile();
                  setDvlaCodeInput("");
                  setShowDvlaModal(false);
                  Alert.alert("Submitted", "Your DVLA Check Code has been submitted.");
                } catch (e: any) {
                  Alert.alert("Error", e.message || "Please try again.");
                } finally {
                  setSubmittingCode(false);
                }
              }}
            >
              {submittingCode ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalSubmitText}>Submit</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowDvlaModal(false); setDvlaCodeInput(""); }}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* RTW Code Modal */}
      <Modal visible={showRtwModal} transparent animationType="fade" onRequestClose={() => setShowRtwModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit New Share Code</Text>
            <Text style={styles.modalDesc}>Please enter your new share code (9 characters).</Text>
            <TextInput
              style={styles.modalInput}
              value={rtwCodeInput}
              onChangeText={setRtwCodeInput}
              placeholder="e.g., ABC123DEF"
              autoCapitalize="characters"
              maxLength={9}
            />
            <TouchableOpacity
              style={[styles.modalSubmitBtn, (!rtwCodeInput.trim() || submittingCode) && { opacity: 0.5 }]}
              disabled={!rtwCodeInput.trim() || submittingCode}
              onPress={async () => {
                try {
                  setSubmittingCode(true);
                  await driverActions.submitRtwCode(rtwCodeInput.trim());
                  await refreshProfile();
                  setRtwCodeInput("");
                  setShowRtwModal(false);
                  Alert.alert("Submitted", "Your new Share Code has been submitted.");
                } catch (e: any) {
                  Alert.alert("Error", e.message || "Please try again.");
                } finally {
                  setSubmittingCode(false);
                }
              }}
            >
              {submittingCode ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalSubmitText}>Submit</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowRtwModal(false); setRtwCodeInput(""); }}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Licence Upload Modal */}
      <Modal visible={showLicenceUpload} transparent animationType="fade" onRequestClose={() => setShowLicenceUpload(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Upload Renewed Licence</Text>
            <Text style={styles.modalDesc}>Please select your renewed driving licence document.</Text>
            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={async () => {
                try {
                  const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });
                  if (res.canceled || !res.assets?.length) return;
                  setSubmittingCode(true);
                  const file = res.assets[0];
                  await docsApi.upload({
                    driver_id: driver!.id,
                    type: "Driver's Licence",
                    file_name: file.name,
                    title: file.name?.replace(/\.[^.]+$/, "") || "Driving Licence",
                  });
                  await refreshProfile();
                  setShowLicenceUpload(false);
                  Alert.alert("Uploaded", "Your renewed licence has been uploaded.");
                } catch (e: any) {
                  Alert.alert("Error", e.message || "Upload failed.");
                } finally {
                  setSubmittingCode(false);
                }
              }}
            >
              {submittingCode ? <ActivityIndicator color="#fff" size="small" /> : (
                <>
                  <Ionicons name="cloud-upload-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.modalSubmitText}>Select & Upload</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowLicenceUpload(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------- Styles ---------- */
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
  sectionHeader: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center" },
  sectionTitle: { fontWeight: "700", color: colors.text, marginBottom: 0 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee", marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 6 },
  rowLabel: { color: "#374151" },
  rowValue: { color: "#9CA3AF", flexShrink: 1 },
  muted: { color: "#9CA3AF" },
  loadingWrap: { flex: 1, paddingTop: 32, justifyContent: "center", alignItems: "center" },
  chip: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { fontWeight: "700" },
  messageItem: { color: colors.text, marginBottom: 4 },
  firList: { marginTop: 12 },
  firItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    marginBottom: 8,
  },
  firCategory: { fontWeight: "600", color: "#92400E" },
  firUploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  firUploadText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  firDoneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  firDoneText: { color: "#065F46", fontWeight: "600", fontSize: 13 },
  flexInstructions: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  flexLink: {
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 10,
    textDecorationLine: "underline",
  },
  flexText: {
    color: "#1E3A5F",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  confirmBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  confirmedChip: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmedText: {
    color: "#065F46",
    fontWeight: "700",
    fontSize: 15,
  },
  dlSection: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#22C55E",
  },
  dlPassText: {
    color: "#065F46",
    fontSize: 14,
    lineHeight: 20,
  },
  dlFailSection: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  dlFailText: {
    color: "#991B1B",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  dtIntroSection: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  dtIntroText: {
    color: "#1E3A5F",
    fontSize: 14,
    lineHeight: 20,
  },
  dtBookedSection: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#22C55E",
    flexDirection: "row",
    alignItems: "center",
  },
  dtBookedTitle: {
    color: "#065F46",
    fontWeight: "700",
    fontSize: 15,
  },
  dtBookedDate: {
    color: "#065F46",
    fontSize: 14,
    marginTop: 2,
  },
  dtSlotSection: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  dtTitle: {
    color: "#1E3A5F",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 10,
  },
  dtSlotItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  dtSlotText: {
    color: "#1E3A5F",
    fontSize: 14,
    fontWeight: "500",
  },
  dtBookBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  dtBookBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  bgcInstructions: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  bgcTitle: {
    color: "#1E3A5F",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 8,
  },
  bgcText: {
    color: "#1E3A5F",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  bgcStepTitle: {
    color: "#1E3A5F",
    fontWeight: "700",
    fontSize: 14,
    marginTop: 6,
    marginBottom: 2,
  },
  bgcLink: {
    color: "#2563EB",
    textDecorationLine: "underline",
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
  },
  badgeText: { color: "#991B1B", fontWeight: "700", fontSize: 12 },
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  taskTitle: { color: "#111827", fontWeight: "700", marginBottom: 2 },
  taskDesc: { color: "#6B7280", fontSize: 13 },
  taskBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#2E4C1E",
    marginLeft: 8,
  },
  taskBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  taskDone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 6 },
  modalDesc: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  modalSubmitBtn: {
    flexDirection: "row",
    backgroundColor: "#2E4C1E",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubmitText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  modalCancelBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalCancelText: { color: "#6B7280", fontWeight: "600" },
});
