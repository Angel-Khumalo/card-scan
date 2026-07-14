import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { getAllCards } from '../../lib/cardStorage';
import { Card } from '../../types/card';

function maskNumber(num: string) {
  const digits = num.replace(/\s/g, '');
  return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : num;
}

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  // reload every time the screen regains focus (e.g. after adding a card)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        const data = await getAllCards();
        if (active) {
          setCards(data);
          setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.h1}>Your Cards</Text>

      {!loading && cards.length === 0 && (
        <Text style={styles.empty}>No cards yet — add one to get started.</Text>
      )}

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/cards/${item.id}`)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardNumber}>{maskNumber(item.number)}</Text>
            <View style={styles.cardRow}>
              <Text style={styles.cardHolder}>{item.holder}</Text>
              <Text style={styles.cardExpiry}>{item.expiry}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24 },
  h1: { fontSize: 28, fontWeight: '700', marginTop: 16, marginBottom: 20 },
  empty: { color: '#8e8e93', fontSize: 15, marginTop: 40, textAlign: 'center' },
  list: { gap: 12, paddingBottom: 40 },
  card: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '600', opacity: 0.7 },
  cardNumber: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  cardHolder: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cardExpiry: { color: '#fff', fontSize: 13, fontWeight: '600' },
});