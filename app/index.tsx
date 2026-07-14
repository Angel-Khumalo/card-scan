import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// We define our structural type so that when we connect Drizzle/Supabase later, 
// the UI knows exactly what format the data takes.
interface CardItem {
  id: string;
  title: string;
  color: string;
}

export default function CardPage() {
  const router = useRouter();

  // 1. Placeholder data arrays (empty for now to show your "no data found" states)
  const recentlyUsedCards: CardItem[] = []; // Max 3
  const allCards: CardItem[] = [];         // Max 6

  // 2. Navigation Handlers (Now safely inside the component body)
  const handleAddNavigation = () => {
    router.push("/add");
  };

  const handleMoreNavigation = () => {
    router.push("/more");
  };



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ScrollView makes sure smaller screens don't clip your content */}
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        
        {/* Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.topBarText}>CARDS</Text>
          </View>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity onPress={handleAddNavigation} activeOpacity={0.7}>
              <Image
                source={require("../assets/icons/add-square.png")}
                style={styles.headerIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMoreNavigation} activeOpacity={0.7}>
              <Image
                source={require("../assets/icons/more-square.png")}
                style={styles.headerIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. Recently Used Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Recently Used</Text>
          
          {recentlyUsedCards.length === 0 ? (
            <View style={styles.emptyCardState}>
              <Text style={styles.emptyText}>No recently used cards found</Text>
            </View>
          ) : (
            <View style={styles.recentCardsList}>
              {recentlyUsedCards.slice(0, 3).map((card) => (
                <TouchableOpacity 
                  key={card.id} 
                  style={[styles.recentCard, { backgroundColor: card.color }]}
                  activeOpacity={0.9}
                >
                  <Text style={styles.cardTitleText}>{card.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 2. All Cards Grid Section */}
        <View style={styles.section}>
          <View style={styles.card_data}>
            <Text style={styles.sectionHeader}>Frequently used cards</Text>
            <TouchableOpacity onPress={() => router.push('/cards/')}>
              <Text style={styles.sectionHeader}>View all cards</Text>
            </TouchableOpacity>
            
          </View>
          
          
          {allCards.length === 0 ? (
            <View style={styles.emptyGridState}>
              <Text style={styles.emptyText}>No cards available</Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {allCards.slice(0, 6).map((card) => (
                <TouchableOpacity 
                  key={card.id} 
                  style={[styles.gridCard, { backgroundColor: card.color }]}
                  activeOpacity={0.9}
                >
                  <Text style={styles.gridCardText} numberOfLines={2}>
                    {card.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000", // Dark black matching your uploaded design Spec
  },
  scrollContent: {
    paddingBottom: 40,
  },

  card_data:{
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    paddingRight: 4,
  },
  backText: {
    color: "#ffffff",
    fontSize: 36,
    lineHeight: 36,
    fontWeight: "300",
  },
  topBarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 1.5,
    borderBottomWidth: 3,
    borderBottomColor: "#ffffff",
    paddingBottom: 2,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  headerIcon: {
    width: 34,
    height: 34,
    tintColor: "#ffffff", // Keeps visual coherence using clean white icons
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8e8e93", // Minimalist iOS gray label
    marginBottom: 12,
  },

  sectionHeaderh2:{
    fontSize: 16,
    fontWeight: "500",
  },
  /* Card Shapes */
  recentCardsList: {
    gap: 12,
  },
  recentCard: {
    width: "100%",
    height: 116,
    borderRadius: 16,
    padding: 16,
    justifyContent: "flex-start",
  },
  cardTitleText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  /* Square Grid Layout */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridCard: {
    // Dynamically calculate square sizing across three columns with exact gap clearance
    width: (width - 48 - 24) / 3, 
    height: (width - 48 - 24) / 3,
    borderRadius: 12,
    padding: 10,
    justifyContent: "flex-start",
  },
  gridCardText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  /* Beautiful empty/no-data states */
  emptyCardState: {
    width: "100%",
    height: 116,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1c1c1e",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0c",
  },
  emptyGridState: {
    width: "100%",
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1c1c1e",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0c",
  },
  emptyText: {
    color: "#48484a",
    fontSize: 14,
  },
});