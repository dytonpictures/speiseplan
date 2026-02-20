import { Allergen } from '../types';

interface AllergenBadgeProps {
  allergen: Allergen;
  size?: 'sm' | 'md';
  className?: string;
}

// Farbkodierung für Allergene (a-n)
const ALLERGEN_COLORS: Record<string, string> = {
  'a': 'bg-red-500',      // Glutenhaltige Getreide
  'b': 'bg-orange-500',   // Krebstiere  
  'c': 'bg-yellow-500',   // Eier
  'd': 'bg-green-500',    // Fisch
  'e': 'bg-blue-500',     // Erdnüsse
  'f': 'bg-indigo-500',   // Soja
  'g': 'bg-purple-500',   // Milch/Laktose
  'h': 'bg-pink-500',     // Schalenfrüchte
  'i': 'bg-red-400',      // Sellerie
  'j': 'bg-orange-400',   // Senf
  'k': 'bg-yellow-400',   // Sesam
  'l': 'bg-green-400',    // Schwefeldioxid
  'm': 'bg-blue-400',     // Lupinen
  'n': 'bg-indigo-400',   // Weichtiere
};

export function AllergenBadge({ allergen, size = 'md', className = '' }: AllergenBadgeProps) {
  const colorClass = ALLERGEN_COLORS[allergen.id] || 'bg-gray-500';
  const sizeClass = size === 'sm' 
    ? 'text-xs px-1.5 py-0.5' 
    : 'text-xs px-2 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium text-white rounded ${colorClass} ${sizeClass} ${className}`}
      title={`${allergen.id}: ${allergen.name}`}
      aria-label={`Allergen ${allergen.id}: ${allergen.name}`}
    >
      {allergen.id}
    </span>
  );
}

interface AllergenListProps {
  allergens: Allergen[];
  size?: 'sm' | 'md';
  maxVisible?: number;
  className?: string;
}

export function AllergenList({ allergens, size = 'md', maxVisible, className = '' }: AllergenListProps) {
  if (!allergens?.length) return null;

  const visible = maxVisible ? allergens.slice(0, maxVisible) : allergens;
  const remaining = maxVisible && allergens.length > maxVisible 
    ? allergens.length - maxVisible 
    : 0;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visible.map(allergen => (
        <AllergenBadge
          key={allergen.id}
          allergen={allergen}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <span 
          className={`inline-flex items-center font-medium text-gray-600 bg-gray-200 rounded ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}
          title={`${remaining} weitere Allergene`}
          aria-label={`${remaining} weitere Allergene`}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}