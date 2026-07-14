import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';

interface ConfirmCardProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (finalData: { title: string; number: string; holder: string; expiry: string; rawData: string }) => void;
  initialData: {
    title: string;
    number: string;
    holder: string;
    expiry: string;
    rawData: string;
  };
}

export default function ConfirmCard({ visible, onClose, onConfirm, initialData }: ConfirmCardProps) {
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [rawData, setRawData] = useState('');

  // Sync internal state whenever new initialData is passed in (critical for scanning updates)
  useEffect(() => {
    if (visible) {
      setTitle(initialData.title);
      setNumber(initialData.number);
      setHolder(initialData.holder);
      setExpiry(initialData.expiry);
      setRawData(initialData.rawData);
    }
  }, [initialData, visible]);

  const handleConfirm = () => {
    onConfirm({ title, number, holder, expiry, rawData });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.modalContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.pullBar} />

          <Text style={styles.headerTitle}>Confirm card details</Text>
          <Text style={styles.headerSubtitle}>
            Double-check what was scanned — fix anything that looks wrong before saving.
          </Text>

          <View style={styles.form}>
            {/* Card Nickname */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Nickname</Text>
              <TextInput 
                style={styles.input} 
                value={title} 
                onChangeText={setTitle} 
                placeholder="e.g., Student ID, Gym Membership"
                placeholderTextColor="#aeaeae"
              />
            </View>

            {/* Card Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Card Number / UID</Text>
              <TextInput 
                style={styles.input} 
                value={number} 
                onChangeText={setNumber} 
                placeholder="Number as printed on the card"
                placeholderTextColor="#aeaeae"
                keyboardType="numeric"
              />
            </View>

            {/* Holder Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Holder Name</Text>
              <TextInput 
                style={styles.input} 
                value={holder} 
                onChangeText={setHolder} 
                placeholder="Full name as printed"
                placeholderTextColor="#aeaeae"
                autoCapitalize="characters"
              />
            </View>

            {/* Expiry Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput 
                style={styles.input} 
                value={expiry} 
                onChangeText={setExpiry} 
                placeholder="MM/YY (leave blank if none)"
                placeholderTextColor="#aeaeae"
              />
            </View>

            {/* OCR Raw Captured Text */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Raw Scanned Text</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={rawData} 
                onChangeText={setRawData} 
                multiline
                numberOfLines={4}
                placeholder="Full text read from the card will appear here"
                placeholderTextColor="#aeaeae"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.8}>
            <Text style={styles.confirmButtonText}>Confirm & Save</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pullBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#e5e5ea',
    marginTop: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#efeff4',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  confirmButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#000000',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});