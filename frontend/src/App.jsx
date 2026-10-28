import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { ShieldAlert, CloudSun, IndianRupee, BookOpen, PhoneCall, UserCheck, Stethoscope } from 'lucide-react';
import Header from './components/Header';
import VoiceInteractionBar from './components/VoiceInteractionBar';
import CropAssistantView from './components/CropAssistantView';
import WeatherAlertsView from './components/WeatherAlertsView';
import MandiPricesView from './components/MandiPricesView';
import FarmDiaryView from './components/FarmDiaryView';
import ExpertConnectView from './components/ExpertConnectView';
import FarmMemoryView from './components/FarmMemoryView';
import { TRANSLATIONS } from './constants/translations';
import { analyzeCrop, getFarmerProfile } from './services/api';
import { speechController } from './services/speech.js';

export default function App() {
  const [language, setLanguage] = useState('bn-IN');
  const [activeTab, setActiveTab] = useState('crop');
  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [currentSpokenText, setCurrentSpokenText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [prefillCase, setPrefillCase] = useState(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS['bn-IN'];

  // Load real farmer profile from MongoDB
  useEffect(() => {
    getFarmerProfile('farmer_user')
      .then(res => {
        if (res?.registered && res.profile) {
          setFarmerProfile(res.profile);
        } else {
          setFarmerProfile(null);
        }
      })
      .catch(err => console.error("Error loading real farmer profile:", err));
  }, []);

  // Intelligent Voice Router: Directs spoken queries to the right module!
  const handleVoiceQuery = async (queryText) => {
    setIsLoading(true);
    const qLower = queryText.toLowerCase();

    // 1. Weather intent
    if (
      qLower.includes('বৃষ্টি') ||
      qLower.includes('আবহাওয়া') ||
      qLower.includes('জল দিতে') ||
      qLower.includes('সেচ') ||
      qLower.includes('rain') ||
      qLower.includes('weather') ||
      qLower.includes('irrigate') ||
      qLower.includes('बारिश')
    ) {
      setActiveTab('weather');
      setIsLoading(false);
      return;
    }

    // 2. Mandi / Price intent
    if (
      qLower.includes('দাম') ||
      qLower.includes('দর') ||
      qLower.includes('বাজার') ||
      qLower.includes('price') ||
      qLower.includes('rate') ||
      qLower.includes('mandi') ||
      qLower.includes('भाव')
    ) {
      setActiveTab('mandi');
      setIsLoading(false);
      return;
    }

    // 3. Farm Diary / Sowing intent
    if (
      qLower.includes('রোপণ') ||
      qLower.includes('বুনেছি') ||
      qLower.includes('লাগিয়েছি') ||
      qLower.includes('planted') ||
      qLower.includes('sowed') ||
      qLower.includes('रोपाई')
    ) {
      setActiveTab('diary');
      setIsLoading(false);
      return;
    }

    // 4. Default: Crop Doctor & Disease Assistant (Module A)
    setActiveTab('crop');
    try {
      const res = await analyzeCrop(queryText, language, 'farmer_user');
      setDiagnosisResult(res);
      setCurrentSpokenText(res.spoken_response);

      // Speak guidance in farmer's language
      speechController.speakText(
        res.spoken_response,
        language,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    } catch (err) {
      console.error("Error analyzing crop problem:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpClarification = (followUpQuestion) => {
    const combinedQuery = `${diagnosisResult?.query || ''}। উত্তর: ${followUpQuestion}`;
    handleVoiceQuery(combinedQuery);
  };

  const handleEscalateClick = (diagResult) => {
    setPrefillCase(diagResult);
    setActiveTab('expert');
  };

  const navItems = [
    { id: 'crop', label: t.navCrop, icon: Stethoscope },
    { id: 'weather', label: t.navWeather, icon: CloudSun },
    { id: 'mandi', label: t.navMandi, icon: IndianRupee },
    { id: 'diary', label: t.navDiary, icon: BookOpen },
    { id: 'expert', label: t.navExpert, icon: PhoneCall },
    { id: 'memory', label: t.navMemory, icon: UserCheck },
  ];

  const appContent = (
    <View style={styles.appWrapper}>
      {/* App Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        farmerProfile={farmerProfile}
        onOpenProfileSetup={() => setActiveTab('memory')}
      />

      {/* Main Content Area */}
      <View style={styles.contentBody}>
        {/* Persistent Voice Assistant Bar */}
        <VoiceInteractionBar
          language={language}
          onQuerySubmit={handleVoiceQuery}
          isLoading={isLoading}
          currentSpokenText={currentSpokenText}
          isPlayingAudio={isPlayingAudio}
          setIsPlayingAudio={setIsPlayingAudio}
        />

        {/* Active Module Screen */}
        <View style={styles.tabContentArea}>
          {activeTab === 'crop' && (
            <CropAssistantView
              diagnosisResult={diagnosisResult}
              language={language}
              onFollowUpClick={handleFollowUpClarification}
              onEscalateClick={handleEscalateClick}
              setIsPlayingAudio={setIsPlayingAudio}
            />
          )}

          {activeTab === 'weather' && (
            <WeatherAlertsView
              language={language}
              setIsPlayingAudio={setIsPlayingAudio}
            />
          )}

          {activeTab === 'mandi' && (
            <MandiPricesView
              language={language}
              setIsPlayingAudio={setIsPlayingAudio}
            />
          )}

          {activeTab === 'diary' && (
            <FarmDiaryView
              language={language}
              setIsPlayingAudio={setIsPlayingAudio}
            />
          )}

          {activeTab === 'expert' && (
            <ExpertConnectView
              language={language}
              prefillCase={prefillCase}
            />
          )}

          {activeTab === 'memory' && (
            <FarmMemoryView
              language={language}
              onProfileSaved={(p) => setFarmerProfile(p)}
            />
          )}
        </View>
      </View>

      {/* Bottom Accessible Nav Bar for Low-Literacy Usability */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.navBtn, isActive && styles.navBtnActive]}
              onPress={() => setActiveTab(item.id)}
            >
              <Icon size={20} color={isActive ? '#22c55e' : '#9ca3af'} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.rootContainer}>
      {isMobileFrame ? (
        <View style={styles.phoneFrameOuter}>
          <View style={styles.phoneSpeakerNotch}>
            <View style={styles.phoneSpeaker} />
            <View style={styles.phoneCamera} />
          </View>
          <View style={styles.phoneScreen}>
            {appContent}
          </View>
        </View>
      ) : (
        <View style={styles.fullScreenWrapper}>
          {appContent}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0a1610',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  phoneFrameOuter: {
    width: '100%',
    maxWidth: 440,
    height: '96%',
    maxHeight: 880,
    backgroundColor: '#1b2a22',
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#2d3f35',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  phoneSpeakerNotch: {
    height: 22,
    backgroundColor: '#1b2a22',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  phoneSpeaker: {
    width: 50,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  phoneCamera: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#111827',
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#0f1f17',
    display: 'flex',
    flexDirection: 'column',
  },
  fullScreenWrapper: {
    width: '100%',
    height: '100%',
    maxWidth: 960,
    backgroundColor: '#0f1f17',
  },
  appWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  contentBody: {
    flex: 1,
    paddingHorizontal: 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  tabContentArea: {
    flex: 1,
    paddingBottom: 6,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#022c22',
    borderTopWidth: 1,
    borderTopColor: '#064e3b',
    paddingVertical: 8,
    paddingHorizontal: 4,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    minWidth: 54,
  },
  navBtnActive: {
    backgroundColor: '#064e3b',
  },
  navLabel: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 3,
    fontWeight: '500',
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#22c55e',
    fontWeight: '700',
  },
});
