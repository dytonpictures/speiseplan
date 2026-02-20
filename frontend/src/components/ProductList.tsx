import { useState } from 'react';
import { Product, Allergen, Additive } from '../types';
import { AllergenList } from './AllergenBadge';
import { ProductForm } from './ProductForm';

interface ProductListProps {
  products: Product[];
  allergens: Allergen[];
  additives: Additive[];
  onCreateProduct: (data: any) => Promise<void>;
  onUpdateProduct: (id: number, data: any) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  loading?: boolean;
}

export function ProductList({
  products,
  allergens,
  additives,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  loading = false
}: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.allergens?.some(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    product.additives?.some(a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Handle create product
  const handleCreateProduct = async (data: any) => {
    try {
      await onCreateProduct(data);
      setShowForm(false);
    } catch (error) {
      console.error('Fehler beim Erstellen des Produkts:', error);
    }
  };

  // Handle update product
  const handleUpdateProduct = async (data: any) => {
    if (!editingProduct) return;
    
    try {
      await onUpdateProduct(editingProduct.id, data);
      setEditingProduct(null);
    } catch (error) {
      console.error('Fehler beim Bearbeiten des Produkts:', error);
    }
  };

  // Handle delete product with confirmation
  const handleDeleteProduct = async (product: Product) => {
    if (deletingProductId === product.id) {
      // Second click - confirm deletion
      try {
        await onDeleteProduct(product.id);
        setDeletingProductId(null);
      } catch (error) {
        console.error('Fehler beim Löschen des Produkts:', error);
        setDeletingProductId(null);
      }
    } else {
      // First click - show confirmation
      setDeletingProductId(product.id);
      
      // Auto-cancel after 3 seconds
      setTimeout(() => {
        setDeletingProductId(prev => prev === product.id ? null : prev);
      }, 3000);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Produktverwaltung
        </h1>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neues Produkt
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <label htmlFor="product-search" className="sr-only">
          Produkte durchsuchen
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="product-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Produkte suchen..."
            className="input pl-10"
          />
        </div>
        
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            {filteredProducts.length} von {products.length} Produkten
          </p>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            {products.length === 0 ? (
              <div>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Produkte</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Erstellen Sie Ihr erstes Produkt, um zu beginnen.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-gray-900">Keine Suchergebnisse</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Versuchen Sie es mit anderen Suchbegriffen.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allergene
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zusatzstoffe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {product.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AllergenList 
                        allergens={product.allergens || []} 
                        size="sm"
                        maxVisible={5}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {product.additives?.length > 0 ? (
                        <span className="text-xs text-gray-600 font-mono">
                          {product.additives.map(a => a.id).sort().join(', ')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.multiline 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.multiline ? 'Mehrzeilig' : 'Einzeilig'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-primary hover:text-blue-700 focus:outline-none focus:underline"
                        aria-label={`${product.name} bearbeiten`}
                      >
                        Bearbeiten
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className={`focus:outline-none focus:underline ${
                          deletingProductId === product.id
                            ? 'text-red-600 hover:text-red-800 font-medium'
                            : 'text-gray-600 hover:text-red-600'
                        }`}
                        aria-label={
                          deletingProductId === product.id
                            ? `${product.name} wirklich löschen`
                            : `${product.name} löschen`
                        }
                      >
                        {deletingProductId === product.id ? 'Bestätigen?' : 'Löschen'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          <div className="text-sm text-gray-600">Produkte gesamt</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-orange-600">
            {products.filter(p => (p.allergens?.length || 0) > 0).length}
          </div>
          <div className="text-sm text-gray-600">Mit Allergenen</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">
            {products.filter(p => (p.additives?.length || 0) > 0).length}
          </div>
          <div className="text-sm text-gray-600">Mit Zusatzstoffen</div>
        </div>
      </div>

      {/* Product Form Modal */}
      {(showForm || editingProduct) && (
        <ProductForm
          product={editingProduct || undefined}
          allergens={allergens}
          additives={additives}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={handleCancelEdit}
          loading={loading}
        />
      )}
    </div>
  );
}