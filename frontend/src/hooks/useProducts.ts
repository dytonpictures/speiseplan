import { useState, useEffect, useCallback } from 'react';
import { Product, Allergen, Additive, ProductFormData } from '../types';

// Import der Wails-Funktionen (werden zur Laufzeit verfügbar sein)
// @ts-ignore - Wails-Bindings werden zur Laufzeit generiert
import { GetProducts, GetProduct, CreateProduct, UpdateProduct, DeleteProduct, GetAllergens, GetAdditives } from '../../wailsjs/go/main/App';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [additives, setAdditives] = useState<Additive[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Alle Produkte laden
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const productList = await GetProducts();
      setProducts(productList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Produkte');
    } finally {
      setLoading(false);
    }
  }, []);

  // Stammdaten laden (Allergene und Zusatzstoffe)
  const loadMasterData = useCallback(async () => {
    try {
      const [allergenList, additiveList] = await Promise.all([
        GetAllergens(),
        GetAdditives()
      ]);
      
      setAllergens(allergenList);
      setAdditives(additiveList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Stammdaten');
    }
  }, []);

  // Einzelnes Produkt laden
  const getProduct = async (id: number): Promise<Product | null> => {
    try {
      const product = await GetProduct(id);
      return product;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Produkts');
      return null;
    }
  };

  // Neues Produkt erstellen
  const createProduct = async (data: ProductFormData): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newProduct = await CreateProduct(
        data.name,
        data.multiline,
        data.allergenIds,
        data.additiveIds
      );
      
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen des Produkts');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Produkt bearbeiten
  const updateProduct = async (id: number, data: ProductFormData): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedProduct = await UpdateProduct(
        id,
        data.name,
        data.multiline,
        data.allergenIds,
        data.additiveIds
      );
      
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Bearbeiten des Produkts');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Produkt löschen
  const deleteProduct = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await DeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Produkts');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Produkte durchsuchen
  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) return products;
    
    const searchTerm = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      (product.allergens || []).some(a => a.name.toLowerCase().includes(searchTerm)) ||
      (product.additives || []).some(a => a.name.toLowerCase().includes(searchTerm))
    );
  };

  // Produkte nach Allergenen filtern
  const filterByAllergen = (allergenId: string): Product[] => {
    return products.filter(product =>
      (product.allergens || []).some(a => a.id === allergenId)
    );
  };

  // Produkte nach Zusatzstoffen filtern
  const filterByAdditive = (additiveId: string): Product[] => {
    return products.filter(product =>
      (product.additives || []).some(a => a.id === additiveId)
    );
  };

  // Allergen nach ID suchen
  const getAllergenById = (id: string): Allergen | undefined => {
    return allergens.find(a => a.id === id);
  };

  // Zusatzstoff nach ID suchen
  const getAdditiveById = (id: string): Additive | undefined => {
    return additives.find(a => a.id === id);
  };

  // Prüfen ob Produkt Allergene enthält
  const hasAllergens = (product: Product): boolean => {
    return product.allergens && product.allergens.length > 0;
  };

  // Prüfen ob Produkt Zusatzstoffe enthält
  const hasAdditives = (product: Product): boolean => {
    return product.additives && product.additives.length > 0;
  };

  // Initial laden
  useEffect(() => {
    loadProducts();
    loadMasterData();
  }, [loadProducts, loadMasterData]);

  return {
    // State
    products,
    allergens,
    additives,
    loading,
    error,
    
    // Aktionen
    loadProducts,
    loadMasterData,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Suche/Filter
    searchProducts,
    filterByAllergen,
    filterByAdditive,
    
    // Helper
    getAllergenById,
    getAdditiveById,
    hasAllergens,
    hasAdditives,
    
    // Clear error
    clearError: () => setError(null)
  };
}

// Separater Hook für Autocomplete/Search
export function useProductSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const { products, searchProducts } = useProducts();

  const results = searchProducts(query);
  const selectedProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId) 
    : null;

  const selectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setQuery(product.name);
  };

  const clearSelection = () => {
    setSelectedProductId(null);
    setQuery('');
  };

  return {
    query,
    setQuery,
    results,
    selectedProduct,
    selectProduct,
    clearSelection,
    hasSelection: selectedProductId !== null
  };
}