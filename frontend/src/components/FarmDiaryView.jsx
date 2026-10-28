import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CheckCircle2, Circle, Calendar, Volume2, PlusCircle, Clock, Tag } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';
import { getReminders, toggleReminder, addVoiceDiaryLog } from '../services/api';
import { speechController } from '../services/speech.js';

export default function FarmDiaryView({ language, setIsPlayingAudio }) {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const t = TRANSLATIONS[language] || TRANSLATIONS['bn-IN'];

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const data = await getReminders("farmer_user");
      setReminders(data.reminders || []);
    } catch (err) {
      console.error("Error loading reminders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (reminderId, currentStatus) => {
    const nextStatus = !currentStatus;
    setReminders(prev =>
      prev.map(r => (r.reminder_id === reminderId ? { ...r, completed: nextStatus } : r))
    );
    try {
      await toggleReminder(reminderId, nextStatus);
    } catch (err) {
      console.error("Error toggling reminder:", err);
    }
  };

  const handleVoiceLogQuick = async () => {
    setIsLoading(true);
    try {
      const spoken = language === 'bn-IN'
        ? "আমি ১৫ জুলাই মাঠে স্বর্ণা ধান রোপণ করেছি"
        : "I planted Swarna paddy on 15 July";
      const res = await addVoiceDiaryLog(spoken, language, "farmer_user");
      setStatusMessage(res.message);
      await loadReminders();
      speechController.speakText(
        res.message,
        language,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    } catch (err) {
      console.error("Error adding voice log:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakTask = (rem) => {
    const textToSpeak = `${rem.title_bn || rem.title}। ${rem.description_bn || rem.description}`;
    speechController.speakText(
      textToSpeak,
      language,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Quick Voice Log Action Banner */}
      <View style={styles.logActionCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.logCardTitle}>
            {language === 'bn-IN' ? 'নতুন ফসল বা কাজ ডায়েরিতে যোগ করুন' : 'Log Real Farming Activity'}
          </Text>
          <Text style={styles.logCardSubtitle}>
            {language === 'bn-IN'
              ? 'বলুন: "আমি ১৫ জুলাই ধান রোপণ করেছি"'
              : 'Say: "I planted paddy on 15 July"'}
          </Text>
        </View>
        <TouchableOpacity style={styles.quickLogBtn} onPress={handleVoiceLogQuick}>
          <PlusCircle size={16} color="#ffffff" />
          <Text style={styles.quickLogBtnText}>
            {language === 'bn-IN' ? 'লগ করুন' : 'Log Activity'}
          </Text>
        </TouchableOpacity>
      </View>

      {statusMessage ? (
        <View style={styles.statusToast}>
          <Text style={styles.statusToastText}>{statusMessage}</Text>
        </View>
      ) : null}

      {/* Reminders List */}
      <Text style={styles.sectionTitle}>
        {language === 'bn-IN' ? 'ফসলের পরিচর্যা ও সার প্রয়োগ সূচি' : 'Crop Activity & Fertilizer Reminders'}
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 30 }} />
      ) : reminders.length > 0 ? (
        <View style={styles.remindersList}>
          {reminders.map((rem) => {
            const isDone = rem.completed;
            return (
              <View key={rem.reminder_id} style={[styles.reminderCard, isDone && styles.reminderCardDone]}>
                <View style={styles.reminderTop}>
                  <TouchableOpacity
                    style={styles.checkBtn}
                    onPress={() => handleToggle(rem.reminder_id, isDone)}
                  >
                    {isDone ? (
                      <CheckCircle2 size={24} color="#22c55e" />
                    ) : (
                      <Circle size={24} color="#94a3b8" />
                    )}
                  </TouchableOpacity>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reminderTitle, isDone && styles.textStrikethrough]}>
                      {rem.title_bn || rem.title}
                    </Text>
                    <View style={styles.badgeRow}>
                      <View style={styles.cropBadge}>
                        <Tag size={11} color="#86efac" />
                        <Text style={styles.cropBadgeText}>{rem.crop}</Text>
                      </View>
                      <View style={styles.dateBadge}>
                        <Calendar size={11} color="#60a5fa" />
                        <Text style={styles.dateBadgeText}>{rem.due_date}</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.playTaskBtn} onPress={() => handleSpeakTask(rem)}>
                    <Volume2 size={16} color="#a7f3d0" />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.reminderDesc, isDone && styles.textMuted]}>
                  {rem.description_bn || rem.description}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {language === 'bn-IN' ? 'কোনো রিমাইন্ডার নির্ধারিত নেই' : 'No Reminders Scheduled'}
          </Text>
          <Text style={styles.emptyText}>
            {language === 'bn-IN'
              ? 'উপরের "লগ করুন" বোতাম চেপে বা মুখে বলুন আপনার রোপণের তারিখ, এআই স্বয়ংক্রিয়ভাবে সার ও পরিচর্যা সূচি তৈরি করবে।'
              : 'Log your crop planting date above or via voice, and KrishiVoice will automatically compute your fertilizer & pest care calendar.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logActionCard: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#059669',
  },
  logCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  logCardSubtitle: {
    fontSize: 12,
    color: '#a7f3d0',
    marginTop: 2,
  },
  quickLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  quickLogBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusToast: {
    backgroundColor: '#022c22',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  statusToastText: {
    color: '#86efac',
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a7f3d0',
    marginBottom: 10,
  },
  remindersList: {
    gap: 10,
    marginBottom: 20,
  },
  reminderCard: {
    backgroundColor: '#064e3b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#047857',
  },
  reminderCardDone: {
    opacity: 0.65,
    backgroundColor: '#032e23',
    borderColor: '#065f46',
  },
  reminderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkBtn: {
    marginTop: 2,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  textMuted: {
    color: '#6b7280',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cropBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#022c22',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cropBadgeText: {
    fontSize: 10,
    color: '#86efac',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#022c22',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dateBadgeText: {
    fontSize: 10,
    color: '#93c5fd',
  },
  playTaskBtn: {
    padding: 6,
  },
  reminderDesc: {
    fontSize: 12,
    color: '#d1fae5',
    lineHeight: 18,
    marginTop: 8,
    paddingLeft: 36,
  },
  emptyCard: {
    backgroundColor: '#064e3b',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#047857',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#d1fae5',
    textAlign: 'center',
    lineHeight: 18,
  },
});
