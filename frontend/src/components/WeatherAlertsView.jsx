import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { CloudRain, Wind, Droplets, Thermometer, AlertCircle, CheckCircle2, Volume2, MapPin } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';
import { getWeather } from '../services/api';
import { speechController } from '../services/speech.js';

export default function WeatherAlertsView({ language, setIsPlayingAudio }) {
  const [district, setDistrict] = useState('Purba Bardhaman');
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = TRANSLATIONS[language] || TRANSLATIONS['bn-IN'];

  const districts = ['Purba Bardhaman', 'Hooghly', 'Nadia'];

  useEffect(() => {
    fetchWeather(district);
  }, [district, language]);

  const fetchWeather = async (dist) => {
    setIsLoading(true);
    try {
      const data = await getWeather(dist, "", language);
      setWeatherData(data);
    } catch (err) {
      console.error("Error fetching weather:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakWeather = () => {
    if (weatherData?.spoken_alert) {
      speechController.speakText(
        weatherData.spoken_alert,
        language,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Location Selector */}
      <View style={styles.districtRow}>
        <MapPin size={16} color="#34d399" />
        <Text style={styles.districtLabel}>
          {language === 'bn-IN' ? 'এলাকা বাছাই:' : 'Select District:'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 8 }}>
          {districts.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.districtChip, district === d && styles.districtChipActive]}
              onPress={() => setDistrict(d)}
            >
              <Text style={[styles.districtChipText, district === d && styles.districtChipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginVertical: 40 }} />
      ) : weatherData ? (
        <>
          {/* Main Weather Card */}
          <View style={styles.mainCard}>
            <View style={styles.mainCardTop}>
              <View>
                <Text style={styles.conditionTitle}>{weatherData.condition_bn || weatherData.condition}</Text>
                <Text style={styles.districtSubtitle}>{weatherData.district}, {weatherData.state}</Text>
              </View>
              <TouchableOpacity style={styles.playAudioBtn} onPress={handleSpeakWeather}>
                <Volume2 size={16} color="#ffffff" />
                <Text style={styles.playAudioBtnText}>{t.listenAudio}</Text>
              </TouchableOpacity>
            </View>

            {/* Weather Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Thermometer size={18} color="#f97316" />
                <Text style={styles.metricValue}>{weatherData.current_temp_c}°C</Text>
                <Text style={styles.metricLabel}>{language === 'bn-IN' ? 'তাপমাত্রা' : 'Temp'}</Text>
              </View>

              <View style={styles.metricItem}>
                <CloudRain size={18} color="#38bdf8" />
                <Text style={styles.metricValue}>{weatherData.rain_prob_tomorrow}%</Text>
                <Text style={styles.metricLabel}>{language === 'bn-IN' ? 'কাল বৃষ্টি' : 'Tomorrow Rain'}</Text>
              </View>

              <View style={styles.metricItem}>
                <Droplets size={18} color="#60a5fa" />
                <Text style={styles.metricValue}>{weatherData.humidity_pct}%</Text>
                <Text style={styles.metricLabel}>{language === 'bn-IN' ? 'আর্দ্রতা' : 'Humidity'}</Text>
              </View>

              <View style={styles.metricItem}>
                <Wind size={18} color="#a7f3d0" />
                <Text style={styles.metricValue}>{weatherData.wind_speed_kmh} km/h</Text>
                <Text style={styles.metricLabel}>{language === 'bn-IN' ? 'বাতাস' : 'Wind'}</Text>
              </View>
            </View>
          </View>

          {/* Practical Agricultural Decisions: Irrigation & Spraying */}
          <View style={styles.advisorySection}>
            {/* Irrigation Card */}
            <View style={[styles.advisoryCard, !weatherData.should_irrigate && styles.cautionCard]}>
              <View style={styles.advisoryHeader}>
                {!weatherData.should_irrigate ? (
                  <AlertCircle size={20} color="#f59e0b" />
                ) : (
                  <CheckCircle2 size={20} color="#22c55e" />
                )}
                <Text style={styles.advisoryTitle}>{t.irrigationStatus}</Text>
              </View>
              <Text style={styles.advisoryBody}>
                {weatherData.irrigation_advice_bn || weatherData.irrigation_advice_en}
              </Text>
            </View>

            {/* Chemical Spraying Card */}
            <View style={[styles.advisoryCard, !weatherData.safe_to_spray && styles.cautionCard]}>
              <View style={styles.advisoryHeader}>
                {!weatherData.safe_to_spray ? (
                  <AlertCircle size={20} color="#f59e0b" />
                ) : (
                  <CheckCircle2 size={20} color="#22c55e" />
                )}
                <Text style={styles.advisoryTitle}>{t.sprayingStatus}</Text>
              </View>
              <Text style={styles.advisoryBody}>
                {weatherData.spray_advice_bn || weatherData.spray_advice_en}
              </Text>
            </View>
          </View>

          {/* 3-Day Forecast Table */}
          <View style={styles.forecastCard}>
            <Text style={styles.forecastHeader}>
              {language === 'bn-IN' ? '৩ দিনের পূর্বাভাস' : '3-Day Agricultural Outlook'}
            </Text>
            {weatherData.forecast?.map((f, idx) => (
              <View key={idx} style={styles.forecastRow}>
                <Text style={styles.forecastDay}>{f.day_bn || f.day}</Text>
                <Text style={styles.forecastTemp}>{f.temp}</Text>
                <View style={styles.forecastRainBadge}>
                  <CloudRain size={12} color="#38bdf8" />
                  <Text style={styles.forecastRainText}>{f.rain_pct}%</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Source Citation */}
          <View style={styles.sourceBar}>
            <Text style={styles.sourceText}>সূত্র: {weatherData.source}</Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  districtLabel: {
    fontSize: 12,
    color: '#a7f3d0',
    fontWeight: '600',
    marginLeft: 4,
  },
  districtChip: {
    backgroundColor: '#022c22',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#065f46',
  },
  districtChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
  },
  districtChipText: {
    fontSize: 12,
    color: '#d1fae5',
    fontWeight: '600',
  },
  districtChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  mainCard: {
    backgroundColor: '#064e3b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#047857',
  },
  mainCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  conditionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  districtSubtitle: {
    fontSize: 12,
    color: '#a7f3d0',
    marginTop: 2,
  },
  playAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  playAudioBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#022c22',
    padding: 12,
    borderRadius: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#86efac',
    marginTop: 2,
  },
  advisorySection: {
    gap: 10,
    marginBottom: 12,
  },
  advisoryCard: {
    backgroundColor: '#064e3b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#047857',
  },
  cautionCard: {
    borderColor: '#d97706',
    backgroundColor: '#032e23',
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  advisoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  advisoryBody: {
    fontSize: 13,
    color: '#ecfdf5',
    lineHeight: 19,
  },
  forecastCard: {
    backgroundColor: '#064e3b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  forecastHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a7f3d0',
    marginBottom: 10,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#047857',
  },
  forecastDay: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    width: 80,
  },
  forecastTemp: {
    fontSize: 12,
    color: '#d1fae5',
  },
  forecastRainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#022c22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  forecastRainText: {
    fontSize: 11,
    color: '#38bdf8',
    fontWeight: '600',
  },
  sourceBar: {
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  sourceText: {
    fontSize: 11,
    color: '#6ee7b7',
  },
});
