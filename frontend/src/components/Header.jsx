import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Smartphone, Monitor, Globe, UserCheck, UserPlus } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';

export default function Header({
  language,
  setLanguage,
  isMobileFrame,
  setIsMobileFrame,
  farmerProfile,
  onOpenProfileSetup
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS['bn-IN'];

  const languages = [
    { code: 'bn-IN', label: 'বাংলা' },
    { code: 'hi-IN', label: 'हिन्दी' },
    { code: 'en-IN', label: 'English' }
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🌾</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>{t.appName}</Text>
            <Text style={styles.brandSubtitle}>{t.appTagline}</Text>
          </View>
        </View>

        {/* View mode toggle & language */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.frameToggleBtn}
            onPress={() => setIsMobileFrame(!isMobileFrame)}
            title="Toggle Phone Frame Simulation"
          >
            {isMobileFrame ? (
              <Monitor size={16} color="#86efac" />
            ) : (
              <Smartphone size={16} color="#86efac" />
            )}
            <Text style={styles.frameToggleText}>
              {isMobileFrame ? "Full Width" : "Mobile Frame"}
            </Text>
          </TouchableOpacity>

          {/* Language Selector Chips */}
          <View style={styles.langSelector}>
            <Globe size={15} color="#4ade80" style={{ marginRight: 4 }} />
            {languages.map((l) => (
              <TouchableOpacity
                key={l.code}
                onPress={() => setLanguage(l.code)}
                style={[
                  styles.langChip,
                  language === l.code && styles.langChipActive
                ]}
              >
                <Text
                  style={[
                    styles.langChipText,
                    language === l.code && styles.langChipTextActive
                  ]}
                >
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Real Farmer Status Bar */}
      <TouchableOpacity
        style={styles.farmerContextBar}
        onPress={onOpenProfileSetup}
        activeOpacity={0.8}
      >
        {farmerProfile ? (
          <>
            <UserCheck size={14} color="#22c55e" style={{ marginRight: 6 }} />
            <Text style={styles.farmerContextText} numberOfLines={1}>
              {farmerProfile.native_name || farmerProfile.name} • {farmerProfile.district}, {farmerProfile.state} •{" "}
              {farmerProfile.active_crops?.[0]?.crop_name || "ফসল যুক্ত করুন"} ({farmerProfile.land_size_bigha || '0'} বিঘা)
            </Text>
          </>
        ) : (
          <>
            <UserPlus size={14} color="#f59e0b" style={{ marginRight: 6 }} />
            <Text style={[styles.farmerContextText, { color: '#fde047' }]}>
              {language === 'bn-IN'
                ? 'খামারের প্রোফাইল সেট করুন (নিজের নাম ও ফসলের তথ্য দিন)'
                : 'Setup Your Farm Profile (Enter your name and active crops)'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#064e3b',
    borderBottomWidth: 1,
    borderBottomColor: '#047857',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#34d399',
  },
  logoIcon: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#a7f3d0',
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  frameToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#065f46',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#059669',
  },
  frameToggleText: {
    fontSize: 12,
    color: '#d1fae5',
    fontWeight: '600',
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#022c22',
    padding: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#065f46',
  },
  langChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 16,
  },
  langChipActive: {
    backgroundColor: '#10b981',
  },
  langChipText: {
    fontSize: 12,
    color: '#a7f3d0',
    fontWeight: '600',
  },
  langChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  farmerContextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#022c22',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#064e3b',
  },
  farmerContextText: {
    fontSize: 12,
    color: '#86efac',
    fontWeight: '500',
    flex: 1,
  },
});
