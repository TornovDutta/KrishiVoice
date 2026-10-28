import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AlertTriangle, CheckCircle2, ShieldAlert, BookOpen, UserPlus, HelpCircle, Volume2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';
import { speechController } from '../services/speech.js';

export default function CropAssistantView({
  diagnosisResult,
  language,
  onFollowUpClick,
  onEscalateClick,
  setIsPlayingAudio
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS['bn-IN'];

  if (!diagnosisResult) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>
          {language === 'bn-IN'
            ? 'ফসলের লক্ষণ বর্ণনা করুন'
            : language === 'hi-IN'
            ? 'फसल की समस्या बोलकर बताएं'
            : 'Describe your crop symptoms'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {language === 'bn-IN'
            ? 'মাইক্রোফোন চেপে বলুন: "আমার ধান গাছের পাতায় বাদামী দাগ হচ্ছে। কী করব?"'
            : language === 'hi-IN'
            ? 'माइक दबाकर बोलें: "मेरे धान के पौधे पर भूरे धब्बे हैं। क्या करूं?"'
            : 'Press the microphone and speak your farming query naturally.'}
        </Text>
      </View>
    );
  }

  const handlePlayVoice = (text) => {
    speechController.speakText(
      text,
      language,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Question Card */}
      <View style={styles.queryCard}>
        <Text style={styles.queryLabel}>
          {language === 'bn-IN' ? 'কৃষকের প্রশ্ন:' : language === 'hi-IN' ? 'किसान का सवाल:' : 'Farmer Question:'}
        </Text>
        <Text style={styles.queryText}>"{diagnosisResult.query}"</Text>
        <View style={styles.badgeRow}>
          <View style={styles.cropBadge}>
            <Text style={styles.cropBadgeText}>{diagnosisResult.crop_identified}</Text>
          </View>
          <View style={[styles.confidenceBadge, diagnosisResult.is_uncertain && styles.uncertainBadge]}>
            <Text style={styles.confidenceText}>
              {diagnosisResult.is_uncertain ? 'সন্দেহজনক / Clarification Needed' : `বিশ্বাসযোগ্যতা: ${Math.round(diagnosisResult.confidence * 100)}%`}
            </Text>
          </View>
        </View>
      </View>

      {/* Primary Diagnosis & Spoken Guidance */}
      <View style={styles.diagnosisCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.diseaseTitle}>{diagnosisResult.disease_name}</Text>
          <TouchableOpacity
            style={styles.playMiniBtn}
            onPress={() => handlePlayVoice(diagnosisResult.spoken_response)}
          >
            <Volume2 size={16} color="#ffffff" />
            <Text style={styles.playMiniBtnText}>{t.listenAudio}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.spokenText}>{diagnosisResult.spoken_response}</Text>

        {/* Symptoms treated as clues disclaimer */}
        <View style={styles.clueDisclaimer}>
          <HelpCircle size={15} color="#fbbf24" style={{ marginTop: 2 }} />
          <Text style={styles.clueDisclaimerText}>
            {t.uncertaintyWarning}
          </Text>
        </View>
      </View>

      {/* Multi-Turn Clarification / Follow-Up Questions */}
      {diagnosisResult.follow_up_questions && diagnosisResult.follow_up_questions.length > 0 && (
        <View style={styles.followUpCard}>
          <Text style={styles.sectionHeader}>
            {language === 'bn-IN'
              ? 'নিশ্চিত হতে সহায়ক প্রশ্নাবলী (Follow-up):'
              : 'Clarification Questions:'}
          </Text>
          {diagnosisResult.follow_up_questions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.followUpItem}
              onPress={() => onFollowUpClick(q)}
            >
              <Text style={styles.followUpIndex}>{idx + 1}</Text>
              <Text style={styles.followUpText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Safe Cultural Remedies */}
      {diagnosisResult.cultural_remedies && (
        <View style={styles.remedyCard}>
          <View style={styles.remedyHeader}>
            <CheckCircle2 size={18} color="#22c55e" />
            <Text style={styles.remedyTitle}>
              {language === 'bn-IN' ? 'প্রাথমিক নিরাপদ ও জৈব পরিচর্যা' : 'Safe Cultural & Organic Care'}
            </Text>
          </View>
          {diagnosisResult.cultural_remedies.map((r, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{r}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Regulated IPM Chemical Remedies with safeguards */}
      {diagnosisResult.chemical_remedies_safe && (
        <View style={styles.chemicalCard}>
          <View style={styles.chemicalHeader}>
            <ShieldAlert size={18} color="#f59e0b" />
            <Text style={styles.chemicalTitle}>
              {language === 'bn-IN' ? 'অনুমোদিত রোগ দমন নির্দেশিকা' : 'Safe Regulated IPM Guidance'}
            </Text>
          </View>
          {diagnosisResult.chemical_remedies_safe.map((c, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{c}</Text>
            </View>
          ))}
          <View style={styles.warningBox}>
            <AlertTriangle size={14} color="#f87171" />
            <Text style={styles.warningText}>{t.chemicalWarning}</Text>
          </View>
        </View>
      )}

      {/* Official Evidence Citation */}
      <View style={styles.citationCard}>
        <BookOpen size={16} color="#34d399" />
        <View style={{ flex: 1 }}>
          <Text style={styles.citationLabel}>{t.evidenceTitle}</Text>
          <Text style={styles.citationSource}>{diagnosisResult.citation}</Text>
        </View>
      </View>

      {/* Human Escalation Button */}
      <TouchableOpacity
        style={styles.escalateBtn}
        onPress={() => onEscalateClick(diagnosisResult)}
      >
        <UserPlus size={18} color="#ffffff" />
        <Text style={styles.escalateBtnText}>{t.escalateButton}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#047857',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#a7f3d0',
    textAlign: 'center',
    lineHeight: 18,
  },
  queryCard: {
    backgroundColor: '#022c22',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#065f46',
  },
  queryLabel: {
    fontSize: 11,
    color: '#86efac',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  queryText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginVertical: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  cropBadge: {
    backgroundColor: '#047857',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cropBadgeText: {
    fontSize: 11,
    color: '#ecfdf5',
    fontWeight: '600',
  },
  confidenceBadge: {
    backgroundColor: '#065f46',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  uncertainBadge: {
    backgroundColor: '#b45309',
  },
  confidenceText: {
    fontSize: 11,
    color: '#fef08a',
    fontWeight: '600',
  },
  diagnosisCard: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#059669',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diseaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  playMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  playMiniBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  spokenText: {
    fontSize: 14,
    color: '#ecfdf5',
    lineHeight: 22,
    marginVertical: 6,
  },
  clueDisclaimer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#022c22',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#78350f',
  },
  clueDisclaimerText: {
    fontSize: 11,
    color: '#fde68a',
    flex: 1,
    lineHeight: 16,
  },
  followUpCard: {
    backgroundColor: '#064e3b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#047857',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a7f3d0',
    marginBottom: 10,
  },
  followUpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#022c22',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#065f46',
  },
  followUpIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#047857',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 11,
    fontWeight: '700',
  },
  followUpText: {
    fontSize: 12,
    color: '#ffffff',
    flex: 1,
  },
  remedyCard: {
    backgroundColor: '#064e3b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#047857',
  },
  remedyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  remedyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#86efac',
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 3,
  },
  bulletDot: {
    color: '#34d399',
    fontSize: 14,
  },
  bulletText: {
    fontSize: 12,
    color: '#ecfdf5',
    flex: 1,
    lineHeight: 18,
  },
  chemicalCard: {
    backgroundColor: '#064e3b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#047857',
  },
  chemicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  chemicalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fcd34d',
  },
  warningBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#450a0a',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 10,
    color: '#fca5a5',
    flex: 1,
    lineHeight: 14,
  },
  citationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#022c22',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#065f46',
  },
  citationLabel: {
    fontSize: 10,
    color: '#6ee7b7',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  citationSource: {
    fontSize: 11,
    color: '#d1fae5',
    fontWeight: '500',
  },
  escalateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ea580c',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  escalateBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
