import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import ItemCard from '../components/ItemCard';
import { useAuth } from '../hooks/useAuth';

export default function CatalogScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [nextUrl, setNextUrl] = useState('pokemon?limit=20&offset=0');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const { logout } = useAuth();

  const loadItems = useCallback(async (url = 'pokemon?limit=20&offset=0', isRefresh = false) => {
    if (loading) {
      if (isRefresh) setRefreshing(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const response = await api.get(url);
      if (isRefresh) {
        setItems(response.data.results);
      } else {
        setItems(prev => [...prev, ...response.data.results]);
      }
      setNextUrl(response.data.next);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  useEffect(() => {
    loadItems('pokemon?limit=20&offset=0', true);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadItems('pokemon?limit=20&offset=0', true);
  };

  const handleLoadMore = () => {
    if (nextUrl && !loading) {
      const endpoint = nextUrl.replace('https://pokeapi.co/api/v2/', '');
      loadItems(endpoint);
    }
  };

  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigation.navigate('Search', { query: trimmed });
    }
  };

  if (error && items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={56} color="#94A3B8" />
        <Text style={styles.errorText} allowFontScaling={true}>
          Falha ao carregar catálogo. Verifique sua conexão.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => loadItems('pokemon?limit=20&offset=0', true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente carregar o catálogo"
        >
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de busca controlada com botão Buscar (RF08) */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput 
            style={styles.searchBar} 
            placeholder="Buscar por nome ou número (ex: #025)..." 
            placeholderTextColor="#94A3B8"
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            allowFontScaling={true}
            accessible={true}
            accessibilityLabel="Campo de busca de pokémon"
          />
        </View>
        <TouchableOpacity 
          style={styles.searchBtn} 
          onPress={handleSearch}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Botão de busca"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.searchBtnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de navegação rápida com estilo de pílula */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Favorites')} 
          style={[styles.pill, styles.pillFav]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Abrir favoritos"
        >
          <Ionicons name="heart" size={15} color="#E11D48" style={{ marginRight: 5 }} />
          <Text style={styles.pillFavText}>Favoritos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Consumed')} 
          style={[styles.pill, styles.pillCaptured]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Abrir pokémons capturados"
        >
          <Ionicons name="bag" size={15} color="#059669" style={{ marginRight: 5 }} />
          <Text style={styles.pillCapturedText}>Capturados</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={logout} 
          style={[styles.pill, styles.pillLogout]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <Ionicons name="log-out-outline" size={16} color="#64748B" style={{ marginRight: 4 }} />
          <Text style={styles.pillLogoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Grade com FlatList (RF01) */}
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const id = item.url ? item.url.split('/').filter(Boolean).pop() : '1';
          return (
            <ItemCard 
              item={{ ...item, id }} 
              onPress={() => navigation.navigate('Details', { id, name: item.name })} 
            />
          );
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator size="large" color="#E53935" style={{ marginVertical: 20 }} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8
  },
  searchBar: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0
  },
  searchBtn: {
    backgroundColor: '#E53935',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    justifyContent: 'center'
  },
  searchBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    justifyContent: 'space-between'
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20
  },
  pillFav: { backgroundColor: '#FFF1F2' },
  pillFavText: { color: '#E11D48', fontWeight: '700', fontSize: 12 },
  pillCaptured: { backgroundColor: '#ECFDF5' },
  pillCapturedText: { color: '#059669', fontWeight: '700', fontSize: 12 },
  pillLogout: { backgroundColor: '#F1F5F9' },
  pillLogoutText: { color: '#64748B', fontWeight: '700', fontSize: 12 },
  listContent: { padding: 6, paddingBottom: 24 },
  errorText: { fontSize: 15, color: '#64748B', textAlign: 'center', marginVertical: 14 },
  retryButton: { backgroundColor: '#E53935', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 }
});
