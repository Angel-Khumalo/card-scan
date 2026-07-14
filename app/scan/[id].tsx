import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Dimensions, 
  Animated, 
  Easing,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.88;
const CARD_HEIGHT = CARD_WIDTH * 0.58;

export default function ScanningPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Retrieve the dynamic [id] parameter

  // Simulated Database Fetching State
  const [cardDetails, setCardDetails] = useState({
    title: 'Emeris Student Card',
    color: '#1a5035', // Default green from screenshot
  });

  // UI & Hardware States
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Animated pulse values
  const pulseAnimValue = useRef(new Animated.Value(1)).current;
  const pulseOpacityValue = useRef(new Animated.Value(0.8)).current;

  // 1. Core Hardware Permission Requester
  const requestHardwarePermissions = async () => {
    try {
      // In production, you will call:
      // await BleManager.requestConnectionPermissions() or NFC equivalent.
      
      console.log("Requesting NFC and BLE Peripheral advertising privileges...");
      setHasPermissions(true);
      setPermissionModalVisible(false);
      startTransmission();
    } catch (error) {
      console.error("Hardware permission request failed", error);
    }
  };

  // 2. Simulated NFC / BLE Broadcaster State
  const startTransmission = () => {
    setIsTransmitting(true);
    
    // Pulse animation loop
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnimValue, {
            toValue: 2.2,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimValue, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          })
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacityValue, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacityValue, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      ])
    ).start();
  };

  const stopTransmission = () => {
    setIsTransmitting(false);
    pulseAnimValue.setValue(1);
    pulseOpacityValue.setValue(0);
  };

  useEffect(() => {
    // If permissions are already flagged, start broadcasting immediately on mount
    if (hasPermissions) {
      startTransmission();
    }
    return () => stopTransmission();
  }, [hasPermissions]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Out button */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      {/* 1. Dynamic Card Rendered by ID */}
      <View style={[styles.cardContainer, { width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: cardDetails.color }]}>
        <Text style={styles.cardTitle}>{cardDetails.title}</Text>
        <Text style={styles.cardMeta}>ID: {id}</Text>
      </View>

      {/* 2. Concentric Wave / Transmission Area */}
      <View style={styles.broadcastArea}>
        <View style={styles.hardwareIconContainer}>
          {isTransmitting && (
            <Animated.View 
              style={[
                styles.pulseRing, 
                { 
                  transform: [{ scale: pulseAnimValue }],
                  opacity: pulseOpacityValue 
                }
              ]} 
            />
          )}
          {/* Hardware Wireless Symbol */}
          <View style={styles.iconCore}>
            <View style={styles.signalDot} />
            <View style={[styles.signalArc, styles.arcInner]} />
            <View style={[styles.signalArc, styles.arcOuter]} />
          </View>
        </View>

        <Text style={styles.statusText}>
          {isTransmitting ? "Hold near card reader" : "Transmission Paused"}
        </Text>
      </View>

      {/* Dynamic Action Trigger */}
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={isTransmitting ? stopTransmission : startTransmission}
      >
        <Text style={styles.toggleButtonText}>
          {isTransmitting ? "Turn Off Transmitter" : "Resume Emulation"}
        </Text>
      </TouchableOpacity>

      {/* 3. Hardware Access Permission Request Overlay */}
      <Modal
        visible={permissionModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.permissionSheet}>
            <View style={styles.dragIndicator} />
            <Text style={styles.sheetTitle}>Enable Wireless Credentials</Text>
            <Text style={styles.sheetDescription}>
              Aetheron requires permission to use **Bluetooth** (to broadcast to credential terminals on iOS) and **NFC** (for Android cross-compatibility) to emulate your card.
            </Text>
            
            <TouchableOpacity 
              style={styles.allowButton} 
              onPress={requestHardwarePermissions}
            >
              <Text style={styles.allowButtonText}>Allow Connection & Emulate</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setPermissionModalVisible(false);
                router.back();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Ensure you import useRef
import { useRef } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginLeft: 24,
    padding: 8,
  },
  closeText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '300',
  },
  cardContainer: {
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  cardMeta: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
  broadcastArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  hardwareIconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconCore: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
  },
  signalArc: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 100,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arcInner: {
    width: 44,
    height: 44,
  },
  arcOuter: {
    width: 76,
    height: 76,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: '#1c1c1e',
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  /* Permissions Sheet Overlay Styling */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  permissionSheet: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 50,
    paddingTop: 12,
    alignItems: 'center',
  },
  dragIndicator: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3a3a3c',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  sheetDescription: {
    fontSize: 14,
    color: '#aeaeb2',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 32,
  },
  allowButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#ffffff',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  allowButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ff453a',
    fontSize: 16,
    fontWeight: '600',
  },
});