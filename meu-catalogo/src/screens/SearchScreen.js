import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import ItemCard from '../components/ItemCard';

export default function SearchScreen({ route, navigation }) {
  const query = route.params?.query || '';
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const performSearch = useCallback(async () => {
    // Tratamento para permitir busca por # e número (ex: "#1", "#001", "025", "# 25")
    let cleanQuery = query.trim().toLowerCase().replace(/^#\s*/, '').trim();
    
    if (!cleanQuery) {
      setError(true);
      setLoading(false);
      return;
    }

    // Se for um número, remove zeros à esquerda para casar com a PokeAPI (ex: "001" -> "1")
    if (/^\d+$/.test(cleanQuery)) {
      const parsedId = parseInt(cleanQuery, 10);
      if (parsedId > 0) {
        cleanQuery = String(parsedId);
      }
    }

    setLoading(true);
    setError(false);
    try {
      const response = await api.get(`pokemon/${cleanQuery}`);
      setResult([{ 
        id: response.data.id, 
        name: response.data.name, 
        url: `https://pokeapi.co/api/v2/pokemon/${response.data.id}/`,
        imageUrl: response.data.sprites?.other?.['official-artwork']?.front_default ||
                  response.data.sprites?.front_default ||
                  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${response.data.id}.png`
      }]);
    } catch (err) {
      setError(true);
      setResult([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText} allowFontScaling={true}>
          Buscando Pokémon "{query}"...
        </Text>
      </View>
    );
  }

  const renderEmptyState = () => (
    <View style={styles.center}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="search-outline" size={42} color="#94A3B8" />
      </View>
      <Text style={styles.emptyTitle} allowFontScaling={true}>
        Nenhum resultado encontrado
      </Text>
      <Text style={styles.emptySubtitle} allowFontScaling={true}>
        Não encontramos nenhum Pokémon com o termo "{query}". Você pode buscar pelo nome (ex: Pikachu) ou pelo número (ex: #25, #001 ou 25).
      </Text>
      <TouchableOpacity 
        style={styles.retryBtn} 
        onPress={() => navigation.goBack()}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Voltar para o catálogo"
      >
        <Text style={styles.retryBtnText}>Voltar para o Catálogo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={result}
        keyExtractor={(item) => String(item.id || item.name)}
        numColumns={2}
        contentContainerStyle={[styles.listContent, result.length === 0 && styles.emptyContainer]}
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
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginTop: 10, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 19 },
  retryBtn: { marginTop: 16, backgroundColor: '#E53935', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 }
});
