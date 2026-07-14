// lib/cardStorage.ts
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Card } from '../types/card';

const INDEX_KEY = 'card_index';
const cardKey = (id: string) => `card_${id}`;

async function getIndex(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(INDEX_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function setIndex(ids: string[]) {
  await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(ids));
}

export async function getAllCards(): Promise<Card[]> {
  const ids = await getIndex();
  const cards = await Promise.all(
    ids.map(async (id) => {
      const raw = await SecureStore.getItemAsync(cardKey(id));
      return raw ? (JSON.parse(raw) as Card) : null;
    })
  );
  return cards
    .filter((c): c is Card => c !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getCard(id: string): Promise<Card | null> {
  const raw = await SecureStore.getItemAsync(cardKey(id));
  return raw ? JSON.parse(raw) : null;
}

export async function saveCard(card: Omit<Card, 'id' | 'createdAt'>): Promise<Card> {
  const newCard: Card = {
    ...card,
    id: Crypto.randomUUID(),
    createdAt: Date.now(),
  };
  await SecureStore.setItemAsync(cardKey(newCard.id), JSON.stringify(newCard));
  const ids = await getIndex();
  ids.push(newCard.id);
  await setIndex(ids);
  return newCard;
}

export async function updateCard(card: Card): Promise<void> {
  await SecureStore.setItemAsync(cardKey(card.id), JSON.stringify(card));
}

export async function deleteCard(id: string): Promise<void> {
  await SecureStore.deleteItemAsync(cardKey(id));
  const ids = await getIndex();
  await setIndex(ids.filter((i) => i !== id));
}