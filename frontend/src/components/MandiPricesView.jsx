import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, ActivityIndicator, Modal } from 'react-native';
import { TrendingUp, TrendingDown, Minus, Volume2, ShieldCheck, Tag, PlusCircle, Scale, Check } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';
import { getMandiPrices, recordMandiRate } from '../services/api';
import { speechController } from '../services/speech.js';

export default function MandiPricesView({ language, setIsPlayingAudio }) {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [mandiData, setMandiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCommodity, setNewCommodity] = useState('Paddy (ধান)');
  const [newMarket, setNewMarket] = useState('Bardhaman APMC Mandi');
  const [newPrice, setNewPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS['bn-IN'];

  const filterCrops = [
    { key: '', label: language === 'bn-IN' ? 'সব ফসল' : 'All Crops' },
    { key: 'dhan', label: language === 'bn-IN' ? 'ধান (Paddy)' : 'Paddy' },
    { key: 'potato', label: language === 'bn-IN' ? 'আলু (Potato)' : 'Potato' },
    { key: 'tomato', label: language === 'bn-IN' ? 'টমেটো (Tomato)' : 'Tomato' },
    { key: 'mustard', label: language === 'bn-IN' ? 'সরিষা (Mustard)' : 'Mustard' },
    { key: 'onion', label: language === 'bn-IN' ? 'পেঁয়াজ (Onion)' : 'Onion' }
  ];

  useEffect(() => {
    fetchPrices(selectedCrop);
  }, [selectedCrop, language]);

  const fetchPrices = async (cropKey) => {
    setIsLoading(true);
    try {
      const data = await getMandiPrices(cropKey, "", language);
      setMandiData(data);
    } catch (err) {
      console.error("Error fetching mandi prices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakMandi = () => {
    if (mandiData?.spoken_summary) {
      speechController.speakText(
        mandiData.spoken_summary,
        language,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  const handleRecordNewRate = async () => {
    if (!newPrice || isNaN(newPrice)) return;
    setIsSaving(true);
    try {
      await recordMandiRate({
        commodity: newCommodity,
        market: newMarket,
        modal_price: parseFloat(newPrice),
        district: "Purba Bardhaman",
        source: "Farmer / Trader Verified Report"
      });
      setShowAddModal(false);
      setNewPrice('');
      await fetchPrices(selectedCrop);
    } catch (err) {
      console.error("Error saving rate:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Crop Filter Horizontal Scroll */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterCrops.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[styles.filterChip, selectedCrop === c.key && styles.filterChipActive]}
              onPress={() => setSelectedCrop(c.key)}
            >
              <Text style={[styles.filterText, selectedCrop === c.key && styles.filterTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Action Row: Record Real Rate & Voice Listen */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.addRateBtn}
          onPress={() => setShowAddModal(true)}
        >
          <PlusCircle size={15} color="#ffffff" />
          <Text style={styles.addRateBtnText}>
            {language === 'bn-IN' ? 'নতুন বাজার দর রেকর্ড করুন' : 'Record Local Rate'}
          </Text>
        </TouchableOpacity>

        {mandiData?.spoken_summary ? (
          <TouchableOpacity style={styles.audioPlayBtn} onPress={handleSpeakMandi}>
            <Volume2 size={15} color="#ffffff" />
            <Text style={styles.audioPlayText}>{t.listenAudio}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Official MSP Reference Card */}
      <View style={styles.mspCard}>
        <View style={styles.mspHeader}>
          <Scale size={16} color="#34d399" />
          <Text style={styles.mspTitle}>
            {language === 'bn-IN' ? 'সরকারি ন্যূনতম সহায়ক মূল্য (MSP 2026)' : 'Govt Minimum Support Price (MSP)'}
          </Text>
        </View>
        <Text style={styles.mspText}>
          ধান (সাধারণ): ₹২,৩০০ / কুইন্টাল (₹২৩.০/কেজি) • সরিষা: ₹৫,৬৫০ / কুইন্টাল (₹৫৬.৫/কেজি)
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 40 }} />
      ) : mandiData?.prices?.length > 0 ? (
        <View style={styles.cardsList}>
          {mandiData.prices.map((p, idx) => (
            <View key={idx} style={styles.priceCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.commodityName}>{p.local_name || p.commodity}</Text>
                  <Text style={styles.marketText}>
                    📍 {p.market}, {p.district}
                  </Text>
                </View>

                <View style={styles.trendBadge}>
                  <Text style={styles.trendText}>
                    তারিখ: {p.arrival_date}
                  </Text>
                </View>
              </View>

              <View style={styles.priceHighlightRow}>
                <View>
                  <Text style={styles.priceLabel}>{t.modalPrice}</Text>
                  <Text style={styles.modalPriceValue}>₹{p.modal_price}</Text>
                  <Text style={styles.unitText}>{p.unit}</Text>
                </View>

                <View style={styles.perKgBadge}>
                  <Tag size={13} color="#86efac" />
                  <Text style={styles.perKgValue}>
                    ₹{p.price_per_kg} / {t.unitKg}
                  </Text>
                </View>
              </View>

              <View style={styles.sourceRow}>
                <ShieldCheck size={13} color="#34d399" />
                <Text style={styles.sourceAuthority}>উৎস: {p.source}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyView}>
          <Text style={styles.emptyText}>
            {language === 'bn-IN'
              ? 'বর্তমানে ডেটাবেজে কোনো রেকর্ড পাওয়া যায়নি। উপরের "নতুন বাজার দর রেকর্ড করুন" বোতাম চেপে আপনার এলাকার বাজার দর যুক্ত করুন।'
              : 'No market rates recorded in database yet. Tap "Record Local Rate" above to record your local mandi price.'}
          </Text>
        </View>
      )}

      {/* Record Mandi Rate Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>নতুন বাজার দর রেকর্ড করুন</Text>

            <Text style={styles.modalLabel}>ফসলের নাম:</Text>
            <TextInput
              style={styles.modalInput}
              value={newCommodity}
              onChangeText={setNewCommodity}
            />

            <Text style={styles.modalLabel}>বাজার / মন্ডি:</Text>
            <TextInput
              style={styles.modalInput}
              value={newMarket}
              onChangeText={setNewMarket}
            />

            <Text style={styles.modalLabel}>পাইকারি দর (₹ প্রতি কুইন্টাল):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="যেমন: 2320"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={newPrice}
              onChangeText={setNewPrice}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>বাতিল</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveRateBtn}
                onPress={handleRecordNewRate}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.saveRateBtnText}>সংরক্ষণ করুন</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#022c22',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#065f46',
  },
  filterChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
  },
  filterText: {
    fontSize: 12,
    color: '#d1fae5',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  addRateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  addRateBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  audioPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  audioPlayText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  mspCard: {
    backgroundColor: '#022c22',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#065f46',
  },
  mspHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  mspTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
    textTransform: 'uppercase',
  },
  mspText: {
    fontSize: 11,
    color: '#d1fae5',
    lineHeight: 16,
  },
  cardsList: {
    gap: 12,
    marginBottom: 20,
  },
  priceCard: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#047857',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  commodityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  marketText: {
    fontSize: 12,
    color: '#a7f3d0',
    marginTop: 2,
  },
  trendBadge: {
    backgroundColor: '#022c22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 11,
    color: '#86efac',
  },
  priceHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#022c22',
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: '#86efac',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  modalPriceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  unitText: {
    fontSize: 10,
    color: '#a7f3d0',
  },
  perKgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#065f46',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  perKgValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#86efac',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#047857',
  },
  sourceAuthority: {
    fontSize: 10,
    color: '#6ee7b7',
  },
  emptyView: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#064e3b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#047857',
  },
  emptyText: {
    color: '#d1fae5',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  modalContent: {
    backgroundColor: '#064e3b',
    width: '90%',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#059669',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 12,
    color: '#86efac',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  modalInput: {
    backgroundColor: '#022c22',
    borderWidth: 1,
    borderColor: '#065f46',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#022c22',
  },
  cancelBtnText: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '600',
  },
  saveRateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#10b981',
  },
  saveRateBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
