import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { User, Sprout, MapPin, Database, MessageSquare, ShieldCheck, UserPlus, Save, Edit3 } from 'lucide-react';
import { getFarmerProfile, onboardFarmer, getFarmerHistory } from '../services/api';

export default function FarmMemoryView({ language, onProfileSaved }) {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Purba Bardhaman');
  const [village, setVillage] = useState('');
  const [cropName, setCropName] = useState('Paddy (ধান)');
  const [variety, setVariety] = useState('Swarna (MTU 7029)');
  const [landBigha, setLandBigha] = useState('4.5');
  const [soilType, setSoilType] = useState('Alluvial Loam (পলি দোআঁশ)');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMemory();
  }, []);

  const loadMemory = async () => {
    setIsLoading(true);
    try {
      const [profData, histData] = await Promise.all([
        getFarmerProfile("farmer_user"),
        getFarmerHistory("farmer_user")
      ]);
      if (profData?.registered && profData.profile) {
        setProfile(profData.profile);
        setName(profData.profile.name || '');
        setPhone(profData.profile.phone || '');
        setDistrict(profData.profile.district || 'Purba Bardhaman');
        setVillage(profData.profile.village || '');
        setLandBigha(String(profData.profile.land_size_bigha || ''));
        setSoilType(profData.profile.soil_type || '');
        if (profData.profile.active_crops?.[0]) {
          setCropName(profData.profile.active_crops[0].crop_name || '');
          setVariety(profData.profile.active_crops[0].variety || '');
        }
      } else {
        setProfile(null);
        setIsEditing(true); // Open onboarding form directly
      }
      setHistory(histData.history || []);
    } catch (err) {
      console.error("Error loading farmer memory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        native_name: name.trim(),
        phone: phone.trim(),
        state: "West Bengal",
        district: district.trim(),
        village: village.trim(),
        preferred_language: language,
        land_size_bigha: parseFloat(landBigha) || 0,
        land_size_acre: Math.round(((parseFloat(landBigha) || 0) / 3.0) * 10) / 10,
        soil_type: soilType,
        active_crops: [
          {
            crop_name: cropName,
            variety: variety,
            season: "Aman / Kharif",
            sowing_date: "2026-07-15",
            field_name: "Field 1",
            growth_stage: "Tillering to Panicle Initiation"
          }
        ]
      };
      const res = await onboardFarmer(payload, "farmer_user");
      if (res?.profile) {
        setProfile(res.profile);
        setIsEditing(false);
        if (onProfileSaved) onProfileSaved(res.profile);
      }
    } catch (err) {
      console.error("Error saving farmer profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 40 }} />
      ) : isEditing || !profile ? (
        /* Real Farmer Onboarding / Profile Setup Form */
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <UserPlus size={20} color="#22c55e" />
            <Text style={styles.formTitle}>
              {language === 'bn-IN' ? 'আপনার খামারের প্রোফাইল সেট করুন' : 'Setup Your Real Farm Profile'}
            </Text>
          </View>
          <Text style={styles.formSubtitle}>
            {language === 'bn-IN'
              ? 'আপনার নিজের নাম ও ফসলের তথ্য দিন। কৃষিবয়েস এই তথ্য মনে রাখবে যাতে প্রতিবার জিজ্ঞাসা করতে না হয়।'
              : 'Enter your authentic farmer details. KrishiVoice will remember this to deliver personalized agronomic advice.'}
          </Text>

          <Text style={styles.inputLabel}>কৃষকের নাম (Farmer Name):</Text>
          <TextInput
            style={styles.inputField}
            placeholder="যেমন: অমল কুমার দাস"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.inputLabel}>ফোন নম্বর (Phone Number):</Text>
          <TextInput
            style={styles.inputField}
            placeholder="+91 98765 43210"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>জেলা (District):</Text>
              <TextInput
                style={styles.inputField}
                value={district}
                onChangeText={setDistrict}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>গ্রাম (Village):</Text>
              <TextInput
                style={styles.inputField}
                placeholder="গ্রামের নাম"
                placeholderTextColor="#9ca3af"
                value={village}
                onChangeText={setVillage}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>বর্তমান চাষের ফসল (Primary Crop):</Text>
          <TextInput
            style={styles.inputField}
            value={cropName}
            onChangeText={setCropName}
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>ফসলের জাত (Variety):</Text>
              <TextInput
                style={styles.inputField}
                value={variety}
                onChangeText={setVariety}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>জমির পরিমাণ (বিঘা):</Text>
              <TextInput
                style={styles.inputField}
                keyboardType="numeric"
                value={landBigha}
                onChangeText={setLandBigha}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>মাটির বৈশিষ্ট্য (Soil Type):</Text>
          <TextInput
            style={styles.inputField}
            value={soilType}
            onChangeText={setSoilType}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveProfile}
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Save size={16} color="#ffffff" />
                <Text style={styles.saveBtnText}>
                  {language === 'bn-IN' ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save Farm Profile'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        /* Display Authenticated Profile */
        <>
          <View style={styles.farmerCard}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <User size={28} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.farmerName}>{profile.native_name || profile.name}</Text>
                <Text style={styles.farmerPhone}>{profile.phone || 'ফোন নম্বর সংযুক্ত নেই'}</Text>
                <View style={styles.locRow}>
                  <MapPin size={13} color="#86efac" />
                  <Text style={styles.locText}>
                    {profile.village ? `${profile.village}, ` : ''}{profile.district}, {profile.state}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                <Edit3 size={14} color="#86efac" />
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>জমির পরিমাণ</Text>
                <Text style={styles.statValue}>{profile.land_size_bigha} বিঘা</Text>
                <Text style={styles.statSub}>({profile.land_size_acre} একর)</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>মাটির বৈশিষ্ট্য</Text>
                <Text style={styles.statValue}>{profile.soil_type || 'সাধারণ'}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>ভাষা পছন্দ</Text>
                <Text style={styles.statValue}>বাংলা (bn-IN)</Text>
              </View>
            </View>
          </View>

          {/* Active Crops in Farm Memory */}
          <Text style={styles.sectionTitle}>
            {language === 'bn-IN' ? 'সংরক্ষিত বর্তমান ফসল (Active Crops)' : 'Active Crops in Farm Memory'}
          </Text>

          <View style={styles.cropsGrid}>
            {profile.active_crops?.map((c, idx) => (
              <View key={idx} style={styles.cropCard}>
                <View style={styles.cropCardTop}>
                  <Sprout size={18} color="#22c55e" />
                  <Text style={styles.cropName}>{c.crop_name}</Text>
                </View>
                <Text style={styles.cropDetail}>
                  <Text style={styles.detailLabel}>জাত (Variety): </Text>
                  {c.variety}
                </Text>
                <Text style={styles.cropDetail}>
                  <Text style={styles.detailLabel}>মৌসুম: </Text>
                  {c.season}
                </Text>
                <Text style={styles.cropDetail}>
                  <Text style={styles.detailLabel}>জমি: </Text>
                  {c.field_name}
                </Text>
                <Text style={styles.cropDetail}>
                  <Text style={styles.detailLabel}>রোপণের তারিখ: </Text>
                  {c.sowing_date}
                </Text>
                <View style={styles.stageBadge}>
                  <Text style={styles.stageText}>পর্যায়: {c.growth_stage}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.advantageCard}>
            <ShieldCheck size={18} color="#34d399" />
            <Text style={styles.advantageText}>
              {language === 'bn-IN'
                ? 'কৃষিবয়েস আপনার ফসলের জাত ও রোপণের তারিখ মনে রাখে, তাই বারবার একই তথ্য না চেয়ে সরাসরি প্রাসঙ্গিক পরামর্শ প্রদান করে।'
                : 'KrishiVoice remembers your crops, soil type, and planting dates with your consent to make every voice advice immediate and contextual.'}
            </Text>
          </View>

          {/* Past Conversation Memory from MongoDB */}
          <Text style={styles.sectionTitle}>
            {language === 'bn-IN' ? 'পূর্ববর্তী কথোপকথন ও পরামর্শ হিস্ট্রি' : 'Conversation History'}
          </Text>

          {history.length > 0 ? (
            <View style={styles.historyList}>
              {history.map((h, idx) => (
                <View key={idx} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <MessageSquare size={14} color="#86efac" />
                    <Text style={styles.historyTime}>{h.created_at?.slice(0, 16) || 'Today'}</Text>
                  </View>
                  <Text style={styles.historyQuery}>"{h.query}"</Text>
                  {h.result?.disease_name && (
                    <Text style={styles.historyDisease}>
                      শনাক্ত: {h.result.disease_name}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noHistoryText}>
              {language === 'bn-IN'
                ? 'এখনো কোনো হিস্ট্রি সংরক্ষিত হয়নি। মাইক বোতাম চেপে নিজের প্রশ্ন বলুন।'
                : 'No conversation history logged yet. Press the mic to ask a farming query.'}
            </Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formCard: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#059669',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 16,
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
    fontSize: 11,
    color: '#86efac',
    fontWeight: '600',
    marginBottom: 3,
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
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  farmerCard: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#059669',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#34d399',
  },
  farmerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  farmerPhone: {
    fontSize: 12,
    color: '#a7f3d0',
    marginTop: 1,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  locText: {
    fontSize: 12,
    color: '#86efac',
  },
  editBtn: {
    backgroundColor: '#022c22',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#065f46',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#022c22',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#86efac',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  statSub: {
    fontSize: 10,
    color: '#a7f3d0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a7f3d0',
    marginBottom: 10,
  },
  cropsGrid: {
    gap: 10,
    marginBottom: 14,
  },
  cropCard: {
    backgroundColor: '#064e3b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#047857',
  },
  cropCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cropName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  cropDetail: {
    fontSize: 12,
    color: '#ecfdf5',
    lineHeight: 18,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#86efac',
  },
  stageBadge: {
    backgroundColor: '#022c22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  stageText: {
    fontSize: 11,
    color: '#6ee7b7',
    fontWeight: '600',
  },
  advantageCard: {
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
  advantageText: {
    fontSize: 12,
    color: '#a7f3d0',
    flex: 1,
    lineHeight: 17,
  },
  historyList: {
    gap: 8,
    marginBottom: 20,
  },
  historyCard: {
    backgroundColor: '#064e3b',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#047857',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 10,
    color: '#86efac',
  },
  historyQuery: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  historyDisease: {
    fontSize: 11,
    color: '#fde047',
    marginTop: 4,
    fontWeight: '600',
  },
  noHistoryText: {
    color: '#a7f3d0',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 20,
  },
});
