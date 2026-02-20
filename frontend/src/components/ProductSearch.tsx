import { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { AllergenList } from './AllergenBadge';

interface ProductSearchProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onCustomText?: (text: string) => void;
  placeholder?: string;
  className?: string;
  allowCustom?: boolean;
}

export function ProductSearch({ 
  products, 
  onSelect, 
  onCustomText,
  placeholder = 'Produkt suchen oder eingeben...',
  className = '',
  allowCustom = true
}: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter products based on search query
  const filteredProducts = query.trim() 
    ? products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10) // Limit to 10 results for performance
    : [];

  // Handle product selection
  const handleSelect = (product: Product) => {
    setQuery(product.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect(product);
  };

  // Handle custom text entry
  const handleCustomEntry = () => {
    if (query.trim() && allowCustom && onCustomText) {
      onCustomText(query.trim());
      setQuery('');
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredProducts.length - (allowCustom && query.trim() ? 0 : 1)
            ? prev + 1
            : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
          handleSelect(filteredProducts[selectedIndex]);
        } else if (selectedIndex === filteredProducts.length && allowCustom && query.trim()) {
          handleCustomEntry();
        }
        break;
        
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const showResults = isOpen && (filteredProducts.length > 0 || (allowCustom && query.trim()));

  return (
    <div className={`relative ${className}`} role="combobox" aria-expanded={isOpen}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          setSelectedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="input"
        autoComplete="off"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-label="Produktsuche"
      />

      {showResults && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
          aria-label="Suchergebnisse"
        >
          {filteredProducts.map((product, index) => (
            <li
              key={product.id}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-primary text-white' : 'hover:bg-gray-50'
              }`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelect(product)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{product.name}</span>
                {product.allergens?.length > 0 && (
                  <AllergenList 
                    allergens={product.allergens} 
                    size="sm"
                    maxVisible={3}
                  />
                )}
              </div>
              
              {product.additives?.length > 0 && (
                <div className="text-xs mt-1 opacity-75">
                  Zusatzstoffe: {product.additives.map(a => a.id).join(', ')}
                </div>
              )}
            </li>
          ))}
          
          {allowCustom && query.trim() && (
            <li
              className={`px-3 py-2 cursor-pointer border-t border-gray-200 italic ${
                selectedIndex === filteredProducts.length 
                  ? 'bg-green-100 text-green-800' 
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
              role="option"
              aria-selected={selectedIndex === filteredProducts.length}
              onClick={handleCustomEntry}
            >
              <div className="flex items-center">
                <span className="mr-2">✏️</span>
                Als Freitext eingeben: "{query}"
              </div>
            </li>
          )}
          
          {filteredProducts.length === 0 && (!allowCustom || !query.trim()) && (
            <li className="px-3 py-2 text-gray-500 italic">
              Keine Produkte gefunden
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

// Vereinfachte Version für reine Anzeige
interface ProductDisplayProps {
  product: Product;
  onRemove?: () => void;
  className?: string;
}

export function ProductDisplay({ product, onRemove, className = '' }: ProductDisplayProps) {
  return (
    <div className={`flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md ${className}`}>
      <div className="flex-1">
        <div className="font-medium">{product.name}</div>
        
        <div className="flex items-center gap-2 mt-1">
          {product.allergens?.length > 0 && (
            <AllergenList allergens={product.allergens} size="sm" maxVisible={5} />
          )}
          
          {product.additives?.length > 0 && (
            <span className="text-xs text-gray-500">
              Zusatzstoffe: {product.additives.map(a => a.id).join(', ')}
            </span>
          )}
        </div>
      </div>
      
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-2 p-1 text-gray-400 hover:text-red-600 focus:text-red-600"
          aria-label={`${product.name} entfernen`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}