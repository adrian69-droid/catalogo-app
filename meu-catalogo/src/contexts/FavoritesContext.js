import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FavoritesContext = createContext();

const FAVORITES_KEY = '@Catalog:favorites';
const CONSUMED_KEY = '@Catalog:consumed';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [consumed, setConsumed] = useState([]);
  const [loadingStorage, setLoadingStorage] = useState(true);

  // Carregamento inicial em useEffect sem exibir dados zerados prematuramente (RF06)
  useEffect(() => {
    async function loadData() {
      try {
        const favs = await AsyncStorage.getItem(FAVORITES_KEY);
        const cons = await AsyncStorage.getItem(CONSUMED_KEY);
        if (favs) setFavorites(JSON.parse(favs));
        if (cons) setConsumed(JSON.parse(cons));
      } catch (e) {
        console.error('Erro ao carregar dados do armazenamento local', e);
      } finally {
        setLoadingStorage(false);
      }
    }
    loadData();
  }, []);

  const isFavorite = (nameOrId) => {
    if (!nameOrId) return false;
    const search = String(nameOrId).toLowerCase();
    return favorites.some(
      (fav) => String(fav.name).toLowerCase() === search || String(fav.id) === search
    );
  };

  const toggleFavorite = async (item) => {
    try {
      let updated;
      const exists = favorites.some(
        (fav) => String(fav.name).toLowerCase() === String(item.name).toLowerCase()
      );

      if (exists) {
        updated = favorites.filter(
          (fav) => String(fav.name).toLowerCase() !== String(item.name).toLowerCase()
        );
      } else {
        const id = item.id || (item.url ? item.url.split('/').filter(Boolean).pop() : undefined);
        const cleanItem = {
          name: item.name,
          id: id,
          url: item.url || (id ? `https://pokeapi.co/api/v2/pokemon/${id}/` : ''),
          imageUrl: item.imageUrl || (id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` : undefined),
        };
        updated = [...favorites, cleanItem];
      }

      setFavorites(updated);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Erro ao atualizar favoritos', e);
    }
  };

  const addConsumed = async (item, rating) => {
    try {
      const id = item.id || (item.url ? item.url.split('/').filter(Boolean).pop() : undefined);
      const cleanItem = {
        name: item.name,
        id: id,
        rating: rating || '5',
        sprites: {
          front_default:
            item.sprites?.front_default ||
            (id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` : null),
        },
        url: item.url || (id ? `https://pokeapi.co/api/v2/pokemon/${id}/` : ''),
      };
      const updated = [
        ...consumed.filter((c) => String(c.name).toLowerCase() !== String(item.name).toLowerCase()),
        cleanItem,
      ];
      setConsumed(updated);
      await AsyncStorage.setItem(CONSUMED_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Erro ao salvar item consumido', e);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        consumed,
        toggleFavorite,
        addConsumed,
        isFavorite,
        loadingStorage,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites deve ser utilizado dentro de um FavoritesProvider');
  }
  return context;
};
