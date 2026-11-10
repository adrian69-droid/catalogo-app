import React from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../hooks/useFavorites';
import ItemCard from '../components/ItemCard';

export default function FavoritesScreen({ navigation }) {
  const { favorites, loadingStorage } = useFavorites();

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
        <Ionicons name="heart-outline" size={42} color="#E11D48" />
      </View>
      <Text style={styles.emptyTitle} allowFontScaling={true}>
        Nenhum favorito salvo ainda
      </Text>
      <Text style={styles.emptySubtitle} allowFontScaling={true}>
        Toque no coração de qualquer Pokémon no catálogo para adicioná-lo aqui aos seus favoritos!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => `${item.name}-${item.id || index}`}
        numColumns={2}
        contentContainerStyle={[styles.listContent, favorites.length === 0 && styles.emptyContainer]}
        renderItem={({ item }) => (
          <ItemCard 
            item={item} 
            onPress={() => navigation.navigate('Details', { id: item.id, name: item.name })} 
          />
        )}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  listContent: { padding: 6, paddingBottom: 20 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginTop: 10, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 19 }
});
