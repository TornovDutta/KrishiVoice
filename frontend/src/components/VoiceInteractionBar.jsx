import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Mic, MicOff, Volume2, Square, Send, Sparkles, AlertCircle } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';
import { speechController } from '../services/speech.js';

export default function VoiceInteractionBar({
  language,
  onQuerySubmit,
  isLoading,
  currentSpokenText,
  isPlayingAudio,
  setIsPlayingAudio
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [micNotice, setMicNotice] = useState('');
  const t = TRANSLATIONS[language] || TRANSLATIONS['bn-IN'];

  const sampleQuestions = [
    { text: t.sampleQ1, tag: "Crop" },
    { text: t.sampleQ2, tag: "Weather" },
    { text: t.sampleQ3, tag: "Mandi" },
    { text: t.sampleQ4, tag: "Diary" }
  ];

  const handleMicClick = () => {
    setMicNotice('');
    if (isRecording) {
      speechController.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      speechController.startListening(
        language,
        (transcript) => {
          setIsRecording(false);
          setTextInput(transcript);
          onQuerySubmit(transcript);
        },
        (error) => {
          setIsRecording(false);
          setMicNotice(
            language === 'bn-IN'
              ? 'মাইক্রোফোনের অনুমতি দিন অথবা নিচে সরাসরি লিখে পাঠান।'
              : 'Please enable microphone access or type your query below.'
          );
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  const handleAudioToggle = () => {
    if (isPlayingAudio) {
      speechController.stopSpeaking();
      setIsPlayingAudio(false);
    } else if (currentSpokenText) {
      setIsPlayingAudio(true);
      speechController.speakText(
        currentSpokenText,
        language,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleManualSubmit = () => {
    if (textInput.trim()) {
      onQuerySubmit(textInput.trim());
      setTextInput('');
      setMicNotice('');
    }
  };

  return (
    <View style={styles.card}>
      {/* Voice Status & Indicator */}
      <View style={styles.statusHeader}>
        <View style={styles.statusBadge}>
          <Sparkles size={14} color="#22c55e" />
          <Text style={styles.statusBadgeText}>
            {isRecording
              ? t.listening
              : isLoading
              ? t.processing
              : isPlayingAudio
              ? t.playing
              : t.tapToSpeak}
          </Text>
        </View>

        {/* Audio Play/Pause Button */}
        {currentSpokenText ? (
          <TouchableOpacity
            style={[styles.audioControlBtn, isPlayingAudio && styles.audioPlayingBtn]}
            onPress={handleAudioToggle}
          >
            {isPlayingAudio ? (
              <>
                <Square size={14} color="#ffffff" fill="#ffffff" />
                <Text style={styles.audioBtnText}>{t.pauseAudio}</Text>
              </>
            ) : (
              <>
                <Volume2 size={14} color="#ffffff" />
                <Text style={styles.audioBtnText}>{t.listenAudio}</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Giant Voice Mic Section */}
      <View style={styles.micCenterContainer}>
        <View style={styles.micButtonWrapper}>
          {isRecording && <View className="mic-ripple" />}
          
          <TouchableOpacity
            style={[
              styles.giantMicBtn,
              isRecording && styles.giantMicBtnActive,
              isLoading && styles.giantMicBtnLoading
            ]}
            onPress={handleMicClick}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : isRecording ? (
              <MicOff size={40} color="#ffffff" />
            ) : (
              <Mic size={40} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Visual equalizer waves when speaking or playing */}
        {(isRecording || isPlayingAudio) && (
          <View style={styles.equalizerRow}>
            <View className="eq-bar" />
            <View className="eq-bar" />
            <View className="eq-bar" />
            <View className="eq-bar" />
            <View className="eq-bar" />
          </View>
        )}

        <Text style={styles.micInstruction}>
          {isRecording ? t.listening : t.tapToSpeak}
        </Text>

        {micNotice ? (
          <View style={styles.micNoticeBox}>
            <AlertCircle size={13} color="#fcd34d" />
            <Text style={styles.micNoticeText}>{micNotice}</Text>
          </View>
        ) : null}
      </View>

      {/* Quick Prompts */}
      <View style={styles.sampleQuestionsSection}>
        <Text style={styles.sampleQuestionsTitle}>{t.sampleQuestionsTitle}</Text>
        <View style={styles.samplesGrid}>
          {sampleQuestions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.sampleChip}
              onPress={() => onQuerySubmit(q.text)}
            >
              <Text style={styles.sampleChipTag}>{q.tag}</Text>
              <Text style={styles.sampleChipText} numberOfLines={2}>
                "{q.text}"
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Text input alternative */}
      <View style={styles.inputBarRow}>
        <TextInput
          style={styles.textInput}
          placeholder={t.diaryPlaceholder}
          placeholderTextColor="#9ca3af"
          value={textInput}
          onChangeText={setTextInput}
          onSubmitEditing={handleManualSubmit}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !textInput.trim() && styles.sendBtnDisabled]}
          onPress={handleManualSubmit}
          disabled={!textInput.trim()}
        >
          <Send size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#064e3b',
    borderRadius: 20,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#047857',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#022c22',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#059669',
  },
  statusBadgeText: {
    color: '#86efac',
    fontSize: 12,
    fontWeight: '600',
  },
  audioControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  audioPlayingBtn: {
    backgroundColor: '#dc2626',
  },
  audioBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  micCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  micButtonWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  giantMicBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    borderWidth: 3,
    borderColor: '#6ee7b7',
  },
  giantMicBtnActive: {
    backgroundColor: '#ef4444',
    borderColor: '#fca5a5',
  },
  giantMicBtnLoading: {
    backgroundColor: '#047857',
  },
  equalizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    marginTop: 8,
  },
  micInstruction: {
    color: '#d1fae5',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  micNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#022c22',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#78350f',
  },
  micNoticeText: {
    color: '#fef08a',
    fontSize: 11,
  },
  sampleQuestionsSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#047857',
  },
  sampleQuestionsTitle: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  samplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleChip: {
    backgroundColor: '#022c22',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#065f46',
    flex: 1,
    minWidth: '46%',
  },
  sampleChipTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34d399',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  sampleChipText: {
    fontSize: 12,
    color: '#f0fdf4',
    lineHeight: 16,
  },
  inputBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#022c22',
    borderWidth: 1,
    borderColor: '#065f46',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  sendBtn: {
    backgroundColor: '#10b981',
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#065f46',
    opacity: 0.5,
  },
});
