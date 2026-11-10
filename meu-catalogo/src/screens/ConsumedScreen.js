import React from 'react';
import { View, FlatList, StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../hooks/useFavorites';

export default function ConsumedScreen({ navigation }) {
  const { consumed, loadingStorage } = useFavorites();

  if (loadingStorage) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  const renderEmptyState = () => (
    <View style={styles.center}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="bag-outline" size={42} color="#059669" />
      </View>
      <Text style={styles.emptyTitle} allowFontScaling={true}>
        Nenhum item capturado ainda
      </Text>
      <Text style={styles.emptySubtitle} allowFontScaling={true}>
        Abra a tela de detalhes de um Pokémon e registre a sua captura com uma nota de 1 a 5 estrelas!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={consumed}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={[styles.listContent, consumed.length === 0 && styles.emptyContainer]}
        renderItem={({ item }) => {
          const ratingNum = parseInt(item.rating || '5', 10);
          return (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => {
                navigation.navigate('Details', { 
                  id: item.id, 
                  name: item.name 
                });
              }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Pokémon ${item.name}, nota ${item.rating} estrelas`}
            >
              <View style={styles.imageWrapper}>
                {item.sprites?.front_default ? (
                  <Image source={{ uri: item.sprites.front_default }} style={styles.image} />
                ) : (
                  <Ionicons name="image-outline" size={24} color="#CBD5E1" />
                )}
              </View>

              <View style={styles.info}>
                <Text style={styles.name} allowFontScaling={true}>{item.name}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons 
                      key={i} 
                      name={i <= ratingNum ? "star" : "star-outline"} 
                      size={15} 
                      color={i <= ratingNum ? "#F59E0B" : "#CBD5E1"} 
                      style={{ marginRight: 2 }}
                    />
                  ))}
                  <Text style={styles.ratingNumber}>({ratingNum}/5)</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  listContent: { padding: 12, paddingBottom: 24 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginTop: 10, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 19 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3
  },
  imageWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  image: { width: 48, height: 48, resizeMode: 'contain' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', textTransform: 'capitalize', color: '#0F172A' },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingNumber: { fontSize: 12, color: '#64748B', fontWeight: '600', marginLeft: 4 }
});
