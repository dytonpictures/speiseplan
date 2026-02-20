import { useState, useEffect } from 'react';
import { Product, ProductFormData, Allergen, Additive } from '../types';
import { AllergenPicker } from './AllergenPicker';
import { AdditivePicker } from './AdditivePicker';

interface ProductFormProps {
  product?: Product; // Für Bearbeitung
  allergens: Allergen[];
  additives: Additive[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProductForm({ 
  product, 
  allergens, 
  additives, 
  onSubmit, 
  onCancel, 
  loading = false 
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    multiline: false,
    allergenIds: [],
    additiveIds: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with product data for editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        multiline: product.multiline,
        allergenIds: product.allergens?.map(a => a.id) || [],
        additiveIds: product.additives?.map(a => a.id) || []
      });
    }
  }, [product]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Produktname ist erforderlich';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Produktname darf maximal 100 Zeichen lang sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Fehler beim Speichern des Produkts:', error);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      multiline: false,
      allergenIds: [],
      additiveIds: []
    });
    setErrors({});
  };

  const isEditing = !!product;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Produkt bearbeiten' : 'Neues Produkt'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Dialog schließen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Product Name */}
            <div>
              <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-2">
                Produktname *
              </label>
              <input
                id="product-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`input ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="z.B. Vollkornbrot mit Käse"
                maxLength={100}
                aria-describedby={errors.name ? 'name-error' : undefined}
                required
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.name}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.name.length}/100 Zeichen
              </p>
            </div>

            {/* Multiline Option */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={formData.multiline}
                  onChange={(e) => setFormData(prev => ({ ...prev, multiline: e.target.checked }))}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mehrzeiliges Produkt
                </span>
              </label>
              <p className="mt-1 text-sm text-gray-500 ml-7">
                Aktivieren, wenn das Produkt in mehreren Zeilen angezeigt werden soll
              </p>
            </div>

            {/* Allergens */}
            <AllergenPicker
              allergens={allergens}
              selectedIds={formData.allergenIds}
              onChange={(ids) => setFormData(prev => ({ ...prev, allergenIds: ids }))}
            />

            {/* Additives */}
            <AdditivePicker
              additives={additives}
              selectedIds={formData.additiveIds}
              onChange={(ids) => setFormData(prev => ({ ...prev, additiveIds: ids }))}
            />

            {/* Preview */}
            {formData.name.trim() && (
              <div className="bg-gray-50 p-4 rounded-md border">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Vorschau</h4>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium">{formData.name}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {formData.allergenIds.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formData.allergenIds.sort().map(id => (
                          <span key={id} className="allergen-badge bg-danger">
                            {id}
                          </span>
                        ))}
                      </div>
                    )}
                    {formData.additiveIds.length > 0 && (
                      <span className="text-xs text-gray-600">
                        Zusatzstoffe: {formData.additiveIds.sort((a, b) => {
                          const aNum = parseInt(a);
                          const bNum = parseInt(b);
                          if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                          return a.localeCompare(b);
                        }).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
                disabled={loading}
              >
                Abbrechen
              </button>
              
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Zurücksetzen
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Speichern...
                </span>
              ) : (
                isEditing ? 'Änderungen speichern' : 'Produkt erstellen'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}