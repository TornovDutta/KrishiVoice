import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { PhoneCall, ShieldAlert, CheckCircle, FileText, Send, UserCheck, AlertCircle } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';
import { escalateToExpert } from '../services/api';

export default function ExpertConnectView({ language, prefillCase }) {
  const [crop, setCrop] = useState(prefillCase?.crop_identified || 'Paddy (ধান)');
  const [symptoms, setSymptoms] = useState(prefillCase?.query || 'ধানের পাতায় বাদামী দাগ ও ডগা শুকিয়ে যাওয়া');
  const [notes, setNotes] = useState('');
  const [submittedCase, setSubmittedCase] = useState(prefillCase?.case || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS['bn-IN'];

  const handleEscalate = async () => {
    setIsSubmitting(true);
    try {
      const res = await escalateToExpert({
        farmer_id: 'farmer_wb_001',
        crop: crop,
        symptoms: symptoms,
        growth_stage: 'Tillering to Panicle Initiation',
        severity: 'Urgent / High',
        notes: notes
      });
      setSubmittedCase(res);
    } catch (err) {
      console.error("Error escalating case:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Kisan Call Centre Emergency Helpline Banner */}
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyTop}>
          <PhoneCall size={24} color="#ffffff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>
              {language === 'bn-IN' ? 'কিসান কল সেন্টার (টোল-ফ্রি)' : 'Kisan Call Centre (Toll-Free)'}
            </Text>
            <Text style={styles.emergencySubtitle}>
              {language === 'bn-IN'
                ? 'সরাসরি সরকারি কৃষি কর্মকর্তার সাথে কথা বলুন'
                : 'Direct spoken call with Govt Agricultural Officers'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.callNowBtn}
          onPress={() => window.open('tel:18001801551')}
        >
          <PhoneCall size={16} color="#064e3b" />
          <Text style={styles.callNowText}>1800-180-1551 এ ফোন করুন</Text>
        </TouchableOpacity>
        <Text style={styles.timingText}>সময়: প্রতিদিন সকাল ৬:০০ টা থেকে রাত ১০:০০ টা</Text>
      </View>

      {/* Generated Case Summary (if submitted or prefilled) */}
      {submittedCase ? (
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <FileText size={18} color="#22c55e" />
            <Text style={styles.summaryTitle}>
              {language === 'bn-IN' ? 'বিশেষজ্ঞ কেস সামারি (Case Summary)' : 'Expert Referral Summary'}
            </Text>
            <View style={styles.caseIdBadge}>
              <Text style={styles.caseIdText}>{submittedCase.case_id}</Text>
            </View>
          </View>

          <View style={styles.summaryDetails}>
            <Text style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>কৃষক: </Text>
              {submittedCase.farmer_profile?.name} ({submittedCase.farmer_profile?.village},{" "}
              {submittedCase.farmer_profile?.district})
            </Text>
            <Text style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>আক্রান্ত ফসল: </Text>
              {submittedCase.agronomic_details?.crop}
            </Text>
            <Text style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>বৃদ্ধির ধাপ: </Text>
              {submittedCase.agronomic_details?.stage}
            </Text>
            <Text style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>লক্ষণ: </Text>
              {submittedCase.agronomic_details?.reported_symptoms}
            </Text>
            <Text style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>ঝুঁকি মাত্রা: </Text>
              <Text style={{ color: '#f87171', fontWeight: '700' }}>
                {submittedCase.agronomic_details?.severity_assessment}
              </Text>
            </Text>
            <Text style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>প্রাথমিক এআই ইঙ্গিত: </Text>
              {submittedCase.agronomic_details?.ai_preliminary_hypothesis}
            </Text>
          </View>

          {/* Assigned Local KVK Scientist */}
          <View style={styles.kvkCard}>
            <UserCheck size={16} color="#86efac" />
            <View style={{ flex: 1 }}>
              <Text style={styles.kvkOfficer}>
                {submittedCase.contact_options?.assigned_kvk?.officer}
              </Text>
              <Text style={styles.kvkName}>
                {submittedCase.contact_options?.assigned_kvk?.name}
              </Text>
              <Text style={styles.kvkPhone}>
                ফোন: {submittedCase.contact_options?.assigned_kvk?.phone}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        /* Escalation Form */
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <AlertCircle size={18} color="#f59e0b" />
            <Text style={styles.formTitle}>
              {language === 'bn-IN' ? 'বিশেষজ্ঞ পর্যালোচনার আবেদন' : 'Request Specialist Case Review'}
            </Text>
          </View>
          <Text style={styles.formSubtitle}>
            {language === 'bn-IN'
              ? 'ফসলের রোগের জটিলতা বা অতিরিক্ত ক্ষতির ঝুঁকি থাকলে এআই সামারি তৈরি করে স্থানীয় কৃষি বিজ্ঞান কেন্দ্র (KVK)-এ পাঠানো হবে।'
              : 'When symptoms are severe or uncertain, KrishiVoice prepares a concise dossier for extension specialists.'}
          </Text>

          <Text style={styles.inputLabel}>ফসলের নাম:</Text>
          <TextInput style={styles.inputField} value={crop} onChangeText={setCrop} />

          <Text style={styles.inputLabel}>লক্ষণ ও বর্তমান অবস্থা:</Text>
          <TextInput
            style={[styles.inputField, { height: 70 }]}
            multiline
            value={symptoms}
            onChangeText={setSymptoms}
          />

          <Text style={styles.inputLabel}>অতিরিক্ত নোট (ঐচ্ছিক):</Text>
          <TextInput
            style={styles.inputField}
            placeholder="জমির মাটির অবস্থা, সারের বিবরণ ইত্যাদি"
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleEscalate}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Send size={16} color="#ffffff" />
                <Text style={styles.submitBtnText}>কেস সামারি তৈরি করে পাঠান</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emergencyCard: {
    backgroundColor: '#b91c1c',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#b91c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  emergencyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  emergencySubtitle: {
    fontSize: 12,
    color: '#fecaca',
    marginTop: 2,
  },
  callNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
  },
  callNowText: {
    color: '#991b1b',
    fontSize: 15,
    fontWeight: '800',
  },
  timingText: {
    color: '#fecaca',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#059669',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    marginLeft: 6,
  },
  caseIdBadge: {
    backgroundColor: '#022c22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  caseIdText: {
    fontSize: 11,
    color: '#86efac',
    fontWeight: '700',
  },
  summaryDetails: {
    backgroundColor: '#022c22',
    padding: 12,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  summaryRow: {
    fontSize: 12,
    color: '#ecfdf5',
    lineHeight: 18,
  },
  summaryLabel: {
    fontWeight: '700',
    color: '#86efac',
  },
  kvkCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#032e23',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#047857',
  },
  kvkOfficer: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  kvkName: {
    fontSize: 11,
    color: '#a7f3d0',
    marginTop: 2,
  },
  kvkPhone: {
    fontSize: 12,
    color: '#86efac',
    fontWeight: '600',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#047857',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#a7f3d0',
    marginBottom: 14,
    lineHeight: 17,
  },
  inputLabel: {
    fontSize: 12,
    color: '#86efac',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 8,
  },
  inputField: {
    backgroundColor: '#022c22',
    borderWidth: 1,
    borderColor: '#065f46',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ea580c',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
