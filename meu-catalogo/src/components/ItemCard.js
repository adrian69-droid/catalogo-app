import React, { useState } from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../hooks/useFavorites';

export default function ItemCard({ item, onPress }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);

  const id = item.id || (item.url ? item.url.split('/').filter(Boolean).pop() : '1');
  const imageUrl = item.imageUrl || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  const isFav = isFavorite(item.name || id);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={`Pokémon ${item.name}`}
      accessibilityRole="button"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {/* Botão de favorito no topo direito */}
      <TouchableOpacity 
        onPress={() => toggleFavorite({ ...item, id, imageUrl })} 
        style={styles.favButton}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isFav ? `Remover ${item.name} dos favoritos` : `Adicionar ${item.name} aos favoritos`}
        accessibilityState={{ selected: isFav }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#E53935" : "#94A3B8"} />
      </TouchableOpacity>

      {/* Círculo de fundo para a imagem */}
      <View style={styles.imageWrapper}>
        {!imageError ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image} 
            onError={() => setImageError(true)}
            accessible={true}
            accessibilityLabel={`Foto de ${item.name}`}
          />
        ) : (
          <Ionicons name="image-outline" size={32} color="#CBD5E1" />
        )}
      </View>

      <View style={styles.infoWrapper}>
        <Text style={styles.idBadge} allowFontScaling={true}>#{String(id).padStart(3, '0')}</Text>
        <Text style={styles.name} allowFontScaling={true} numberOfLines={1}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 6,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    position: 'relative'
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 6,
    zIndex: 2
  },
  imageWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8
  },
  image: {
    width: 76,
    height: 76,
    resizeMode: 'contain'
  },
  infoWrapper: {
    alignItems: 'center',
    width: '100%'
  },
  idBadge: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.5
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginTop: 2,
    color: '#1E293B',
    textAlign: 'center'
  }
});
