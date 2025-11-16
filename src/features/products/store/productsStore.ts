// Store temporairement désactivé - à refactoriser avec les nouveaux types SKU
// TODO: Refactoriser ce store pour utiliser les types SKU au lieu de Product

// Export d'un store vide pour éviter les erreurs d'import
export const useProductsStore = () => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {},
  reset: () => {},
});
