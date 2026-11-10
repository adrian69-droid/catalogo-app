import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';

const TYPE_COLORS = {
  grass: '#10B981',
  fire: '#EF4444',
  water: '#3B82F6',
  electric: '#F59E0B',
  poison: '#8B5CF6',
  bug: '#84CC16',
  normal: '#94A3B8',
  ground: '#D97706',
  fairy: '#F472B6',
  fighting: '#DC2626',
  psychic: '#EC4899',
  rock: '#78716C',
  ghost: '#6B21A8',
  ice: '#06B6D4',
  dragon: '#6366F1',
  dark: '#334155',
  steel: '#64748B',
  flying: '#0284C7'
};

export default function DetailsScreen({ route, navigation }) {
  const { id, name } = route.params || {};
  const [details, setDetails] = useState(null);
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('5');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { isFavorite, toggleFavorite, addConsumed } = useFavorites();

  const sanitizeText = (raw) => {
    if (!raw) return '';
    return raw
      .replace(/<[^>]*>?/gm, '')
      .replace(/[\f\n\r\t]/g, ' ')
      .trim();
  };

  const fetchDetails = useCallback(async () => {
    const rawIdentifier = id || (name ? name.toLowerCase() : null);
    if (!rawIdentifier) {
      setError(true);
      setLoading(false);
      return;
    }

    // Limpa '#' e zeros à esquerda se for número (ex: '#001' -> '1')
    let identifier = String(rawIdentifier).trim().toLowerCase().replace(/^#\s*/, '').trim();
    if (/^\d+$/.test(identifier)) {
      const parsedId = parseInt(identifier, 10);
      if (parsedId > 0) {
        identifier = String(parsedId);
      }
    }

    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`pokemon/${identifier}`);
      setDetails(res.data);

      navigation.setOptions({ 
        title: `${res.data.name.toUpperCase()} #${String(res.data.id).padStart(3, '0')}` 
      });

      try {
        const speciesRes = await api.get(`pokemon-species/${identifier}`);
        const ptEntry = speciesRes.data.flavor_text_entries?.find(
          (e) => e.language.name === 'pt-br' || e.language.name === 'en'
        );
        if (ptEntry) {
          setDescription(sanitizeText(ptEntry.flavor_text));
        }
      } catch (speciesErr) {
        // Fallback silencioso
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, name, navigation]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleSaveConsumed = () => {
    if (!details) return;
    const parsedRating = parseInt(rating, 10);
    const validRating = (parsedRating >= 1 && parsedRating <= 5) ? String(parsedRating) : '5';

    addConsumed(details, validRating);
    const message = `Pokémon marcado como capturado com nota ${validRating} ⭐!`;
    if (Platform.OS === 'web') alert(message);
    else Alert.alert('Sucesso', message);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E53935" />
        <Text style={styles.loadingText} allowFontScaling={true}>Carregando Pokémon...</Text>
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        <Text style={styles.errorText} allowFontScaling={true}>
          Falha ao carregar detalhes do Pokémon.
        </Text>
        <TouchableOpacity 
          style={styles.retryBtn} 
          onPress={fetchDetails}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Tentar carregar os detalhes novamente"
        >
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFav = isFavorite(details.name || details.id);
  const spriteUrl = details.sprites?.other?.['official-artwork']?.front_default ||
                    details.sprites?.front_default ||
                    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${details.id}.png`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Imagem em tamanho maior com círculo de destaque */}
      <View style={styles.imageCard}>
        <View style={styles.imageWrapper}>
          {!imageError ? (
            <Image 
              source={{ uri: spriteUrl }} 
              style={styles.image} 
              onError={() => setImageError(true)}
              accessible={true}
              accessibilityLabel={`Imagem ampliada de ${details.name}`}
            />
          ) : (
            <Ionicons name="image-outline" size={64} color="#CBD5E1" />
          )}
        </View>

        {/* Botão flutuante de favoritar */}
        <TouchableOpacity 
          style={styles.floatingFav}
          onPress={() => toggleFavorite({ 
            id: details.id, 
            name: details.name, 
            imageUrl: spriteUrl 
          })}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          accessibilityState={{ selected: isFav }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={26} color="#E53935" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title} allowFontScaling={true}>{details.name}</Text>
      <Text style={styles.idSub} allowFontScaling={true}>Nº {String(details.id).padStart(3, '0')}</Text>

      {/* Badges de Tipo com cores da Pokédex (RF03) */}
      <View style={styles.typesRow}>
        {details.types?.map((t, idx) => {
          const typeColor = TYPE_COLORS[t.type.name.toLowerCase()] || '#64748B';
          return (
            <View key={idx} style={[styles.typeBadge, { backgroundColor: typeColor }]}>
              <Text style={styles.typeText} allowFontScaling={true}>{t.type.name}</Text>
            </View>
          );
        })}
      </View>

      {/* Descrição em card limpo (RF03) */}
      {description ? (
        <View style={styles.descCard}>
          <Text style={styles.descText} allowFontScaling={true}>"{description}"</Text>
        </View>
      ) : null}

      {/* Grade de Atributos Físicos (RF03) */}
      <View style={styles.attributesCard}>
        <View style={styles.attributeItem}>
          <Text style={styles.attributeLabel} allowFontScaling={true}>Peso</Text>
          <Text style={styles.attributeValue} allowFontScaling={true}>{(details.weight / 10).toFixed(1)} kg</Text>
        </View>
        <View style={[styles.attributeItem, styles.attributeBorder]}>
          <Text style={styles.attributeLabel} allowFontScaling={true}>Altura</Text>
          <Text style={styles.attributeValue} allowFontScaling={true}>{(details.height / 10).toFixed(1)} m</Text>
        </View>
        <View style={styles.attributeItem}>
          <Text style={styles.attributeLabel} allowFontScaling={true}>XP Base</Text>
          <Text style={styles.attributeValue} allowFontScaling={true}>{details.base_experience || '-'}</Text>
        </View>
      </View>

      {/* Habilidades (RF03) */}
      {details.abilities?.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle} allowFontScaling={true}>Habilidades</Text>
          <Text style={styles.sectionContent} allowFontScaling={true}>
            {details.abilities.map(a => a.ability.name).join(' • ')}
          </Text>
        </View>
      )}

      {/* Caixa de Captura com Avaliação (RF07) */}
      <View style={styles.consumeBox}>
        <Text style={styles.consumeTitle} allowFontScaling={true}>
          🎒 Registrar Captura (Item Consumido)
        </Text>
        <Text style={styles.consumeSubtitle} allowFontScaling={true}>
          Sua nota pessoal para este Pokémon:
        </Text>
        
        <View style={styles.ratingRow}>
          {['1', '2', '3', '4', '5'].map((star) => {
            const active = rating === star;
            return (
              <TouchableOpacity 
                key={star}
                style={[styles.starBtn, active && styles.starBtnActive]}
                onPress={() => setRating(star)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Nota ${star} estrelas`}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.starText, active && styles.starTextActive]}>
                  {star} ★
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity 
          style={styles.consumeButton} 
          onPress={handleSaveConsumed}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Confirmar captura do pokémon"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.consumeBtnText} allowFontScaling={true}>
            Confirmar Captura
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center', backgroundColor: '#F8FAFC', flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748B' },
  errorText: { fontSize: 15, color: '#DC2626', textAlign: 'center', marginVertical: 12 },
  retryBtn: { backgroundColor: '#E53935', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  imageCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    marginVertical: 8
  },
  imageWrapper: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: { width: 150, height: 150, resizeMode: 'contain' },
  floatingFav: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    padding: 8
  },
  title: { fontSize: 26, fontWeight: '800', textTransform: 'capitalize', color: '#0F172A', marginTop: 10 },
  idSub: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 2 },
  typesRow: { flexDirection: 'row', marginTop: 10, marginBottom: 12 },
  typeBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, marginHorizontal: 4 },
  typeText: { color: '#FFFFFF', fontWeight: '700', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 },
  descCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    width: '100%',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  descText: { fontSize: 14, color: '#475569', fontStyle: 'italic', lineHeight: 20, textAlign: 'center' },
  attributesCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  attributeItem: { flex: 1, alignItems: 'center' },
  attributeBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' },
  attributeLabel: { fontSize: 12, color: '#64748B', textTransform: 'uppercase', fontWeight: '600' },
  attributeValue: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 14,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 4 },
  sectionContent: { fontSize: 15, color: '#0F172A', textTransform: 'capitalize', fontWeight: '600' },
  consumeBox: {
    marginTop: 10,
    width: '100%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  consumeTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  consumeSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  starBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 52,
    alignItems: 'center'
  },
  starBtnActive: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  starText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  starTextActive: { color: '#B45309' },
  consumeButton: { backgroundColor: '#059669', paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  consumeBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 }
});
