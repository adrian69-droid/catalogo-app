import { useContext } from 'react';
import { FavoritesContext } from '../contexts/FavoritesContext';

/**
 * Hook customizado para consumir o contexto global de Favoritos e Consumidos
 * Atende aos requisitos RF04 e Critérios de Qualidade de Código.
 */
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites deve ser utilizado dentro de um FavoritesProvider');
  }
  return context;
}
