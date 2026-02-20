import { Allergen } from '../types';

interface AllergenPickerProps {
  allergens: Allergen[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
}

// Deutsche Namen für Allergene (nach EU-Verordnung)
const ALLERGEN_NAMES: Record<string, string> = {
  'a': 'Glutenhaltige Getreide',
  'b': 'Krebstiere',
  'c': 'Eier', 
  'd': 'Fisch',
  'e': 'Erdnüsse',
  'f': 'Soja',
  'g': 'Milch/Laktose',
  'h': 'Schalenfrüchte',
  'i': 'Sellerie',
  'j': 'Senf',
  'k': 'Sesam',
  'l': 'Schwefeldioxid',
  'm': 'Lupinen', 
  'n': 'Weichtiere'
};

export function AllergenPicker({ allergens, selectedIds, onChange, className = '' }: AllergenPickerProps) {
  const handleToggle = (allergenId: string) => {
    if (selectedIds.includes(allergenId)) {
      onChange(selectedIds.filter(id => id !== allergenId));
    } else {
      onChange([...selectedIds, allergenId]);
    }
  };

  // Sortierte Allergene (a-n)
  const sortedAllergens = [...allergens].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <fieldset className={`border border-gray-300 rounded-md p-4 ${className}`}>
      <legend className="text-sm font-medium text-gray-900 px-2">
        Allergene auswählen
      </legend>
      
      <div 
        className="grid grid-cols-2 gap-3 mt-3"
        role="group"
        aria-labelledby="allergen-picker-legend"
      >
        {sortedAllergens.map(allergen => {
          const isSelected = selectedIds.includes(allergen.id);
          const displayName = ALLERGEN_NAMES[allergen.id] || allergen.name;
          
          return (
            <label
              key={allergen.id}
              className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition-colors min-h-[44px] ${
                isSelected 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(allergen.id)}
                className="hidden"
                aria-describedby={`allergen-${allergen.id}-description`}
              />
              
              <span 
                className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${
                  isSelected ? 'bg-white text-primary' : 'bg-danger text-white'
                }`}
                aria-hidden="true"
              >
                {allergen.id}
              </span>
              
              <span className="flex-1 text-sm font-medium">
                {displayName}
              </span>
              
              <span 
                id={`allergen-${allergen.id}-description`}
                className="sr-only"
              >
                Allergen {allergen.id}: {displayName}
              </span>
            </label>
          );
        })}
      </div>
      
      {selectedIds.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Ausgewählte Allergene:</strong>{' '}
            {selectedIds.sort().join(', ')}
          </p>
        </div>
      )}
    </fieldset>
  );
}