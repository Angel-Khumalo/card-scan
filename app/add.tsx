import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import ConfirmCard from '../components/modals/ConfirmCard';
import { saveCard } from '../lib/cardStorage';

export default function AddPage() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [modalVisible, setModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [scannedData, setScannedData] = useState({
    title: '',
    number: '',
    holder: '',
    expiry: '',
    rawData: '',
  });

  // Native permission check
  if (!permission) {
    return <View style={styles.fallbackContainer}><ActivityIndicator size="large" color="#000" /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionBody}>We need camera privileges to instantly scan and extract your card data offline.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Parses real OCR text into card fields. No fake fallbacks —
  // if something can't be confidently found, it's left blank and the
  // user fills it in on the confirm screen.
  const parseCardText = (rawText: string) => {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // Card-style number: groups of 4-6 digits, 12-19 digits total (covers
    // payment cards, student/member IDs, etc.) — NOT matching magstripe
    // track data specifically, since we're reading the printed face only.
    const numberMatch = rawText.match(/\b\d{4}[ -]?\d{3,6}[ -]?\d{3,6}(?:[ -]?\d{1,4})?\b/);

    const expiryMatch = rawText.match(/\b(0[1-9]|1[0-2])\/(\d{2})\b/);

    // A plausible name line: mostly letters/spaces, reasonable length,
    // not the same as the title line.
    const holderLine = lines.find((line, idx) => {
      if (idx === 0) return false; // skip the title line
      return /^[A-Za-z\s.'-]{4,40}$/.test(line);
    });

    return {
      title: lines[0] ? lines[0] : '',
      number: numberMatch ? numberMatch[0] : '',
      holder: holderLine ? holderLine.toUpperCase() : '',
      expiry: expiryMatch ? expiryMatch[0] : '',
      rawData: rawText,
    };
  };

  const handleCaptureAndScan = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      const result = await TextRecognition.recognize(photo.uri);
      const rawText = result.text ?? '';

      if (!rawText.trim()) {
        Alert.alert(
          'No text detected',
          'Try again with better lighting, or enter the details manually.'
        );
        setIsProcessing(false);
        return;
      }

      const parsedData = parseCardText(rawText);
      setScannedData(parsedData);
      setIsProcessing(false);
      setModalVisible(true);
    } catch (err) {
      console.error('Capture/OCR failed:', err);
      Alert.alert('Scan failed', 'Something went wrong reading the card. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleManualEntry = () => {
    setScannedData({
      title: '',
      number: '',
      holder: '',
      expiry: '',
      rawData: '',
    });
    setModalVisible(true);
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
      {/* Header */}
      <View style={styles.container_header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.h2}>Add a new card</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Live Viewfinder Feed */}
      <View style={styles.viewfinderWrapper}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          ref={cameraRef}
          facing="back"
        >
          {/* Card alignment overlay mask */}
          <View style={styles.maskContainer}>
            <View style={styles.maskFrame} />
            <Text style={styles.maskLabel}>Center card inside frame</Text>
          </View>
        </CameraView>

        {isProcessing && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Extracting text...</Text>
          </View>
        )}
      </View>

      {/* Action Area */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.captureBtn, isProcessing && styles.disabledBtn]}
          onPress={handleCaptureAndScan}
          disabled={isProcessing}
        >
          <Text style={styles.captureBtnText}>Capture & Scan Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manualButton}
          onPress={handleManualEntry}
          activeOpacity={0.8}
        >
          <Text style={styles.manualButtonText}>Add card details manually</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  container_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backBtn: {
    paddingRight: 8,
  },
  backArrow: {
    fontSize: 38,
    color: '#000',
    lineHeight: 38,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
  },
  viewfinderWrapper: {
    flex: 1,
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  maskContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  maskFrame: {
    width: '85%',
    height: '55%',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  maskLabel: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  captureBtn: {
    width: '100%',
    height: 54,
    backgroundColor: '#007aff',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledBtn: {
    backgroundColor: '#8e8e93',
  },
  manualButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#000000',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#ffffff',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionBody: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});