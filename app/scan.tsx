import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import ConfirmCard from '../components/modals/ConfirmCard';
import { saveCard } from '../lib/cardStorage';

// Must be called once at module load, before any NFC calls.
NfcManager.start();

export default function ScanningPage() {
  const router = useRouter();
  const { title: titleParam } = useLocalSearchParams<{ title?: string }>();

  const [isScanning, setIsScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState({
    title: '',
    number: '',
    holder: '',
    expiry: '',
    rawData: '',
  });

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    startReading();
    return () => {
      // Always cancel any pending request when leaving the screen
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  // Turns whatever NDEF records were found into our card fields.
  // No fallback/fake defaults — anything not found stays blank for the
  // user to fill in on the confirm screen.
  const parseNdefRecords = (records: any[]) => {
    const texts: string[] = [];

    for (const record of records) {
      try {
        if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT)) {
          texts.push(Ndef.text.decodePayload(record.payload));
        } else if (Ndef.isType(record, Ndef.TNF_WELL_KNOWN, Ndef.RTD_URI)) {
          texts.push(Ndef.uri.decodePayload(record.payload));
        }
      } catch {
        // skip unreadable record, don't fabricate data for it
      }
    }

    const rawData = texts.join('\n');
    const lines = rawData.split('\n').map((l) => l.trim()).filter(Boolean);

    const numberMatch = rawData.match(/\b\d{4}[ -]?\d{3,6}[ -]?\d{3,6}(?:[ -]?\d{1,4})?\b/);
    const expiryMatch = rawData.match(/\b(0[1-9]|1[0-2])\/(\d{2})\b/);
    const holderLine = lines.find((line, idx) => idx !== 0 && /^[A-Za-z\s.'-]{4,40}$/.test(line));

    return {
      title: (titleParam as string) || lines[0] || 'Scanned Card',
      number: numberMatch ? numberMatch[0] : '',
      holder: holderLine ? holderLine.toUpperCase() : '',
      expiry: expiryMatch ? expiryMatch[0] : '',
      rawData,
    };
  };

  const startReading = async () => {
    try {
      setIsScanning(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();

      if (!tag?.ndefMessage || tag.ndefMessage.length === 0) {
        Alert.alert('No data found', 'This tag has no readable NDEF data.');
        setIsScanning(false);
        await NfcManager.cancelTechnologyRequest().catch(() => {});
        return;
      }

      const parsed = parseNdefRecords(tag.ndefMessage);
      setScannedData(parsed);
      setIsScanning(false);
      setModalVisible(true);
    } catch (err) {
      // Common on Android when the request is cancelled (e.g. navigating away) — ignore quietly
      console.log('NFC read ended:', err);
      setIsScanning(false);
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  };

  const handleFinalCardSave = async (verifiedData: typeof scannedData) => {
    await saveCard({
      title: verifiedData.title,
      number: verifiedData.number,
      holder: verifiedData.holder,
      expiry: verifiedData.expiry,
      rawData: verifiedData.rawData,
    });
    setModalVisible(false);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      <View style={styles.cardPreview}>
        <Text style={styles.cardPreviewTitle}>{(titleParam as string) || 'Scan Card'}</Text>
      </View>

      <View style={styles.centerContent}>
        <Animated.View style={[styles.radioWrap, { transform: [{ scale: pulse }] }]}>
          <View style={styles.radioRing} />
          <View style={styles.radioRingInner} />
          <View style={styles.radioDot} />
        </Animated.View>
        <Text style={styles.instruction}>
          {isScanning ? 'Hold near card' : 'Preparing scanner...'}
        </Text>
      </View>

      <ConfirmCard
        visible={modalVisible}
        initialData={scannedData}
        onClose={() => setModalVisible(false)}
        onConfirm={handleFinalCardSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  backArrow: {
    fontSize: 32,
    color: '#ffffff',
    lineHeight: 32,
  },
  cardPreview: {
    marginHorizontal: 24,
    marginTop: 16,
    height: 190,
    borderRadius: 16,
    backgroundColor: '#1e5a44',
    padding: 20,
  },
  cardPreviewTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  radioWrap: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  radioRingInner: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
  },
  instruction: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
});