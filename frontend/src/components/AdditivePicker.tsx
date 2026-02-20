import { Additive } from '../types';

interface AdditivePickerProps {
  additives: Additive[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
}

// Deutsche Namen für häufige Zusatzstoffe (E-Nummern)
const ADDITIVE_NAMES: Record<string, string> = {
  '1': 'Farbstoff',
  '2': 'Konservierungsstoff', 
  '3': 'Antioxidationsmittel',
  '4': 'Geschmacksverstärker',
  '5': 'Geschwefelt',
  '6': 'Geschwärzt',
  '7': 'Gewachst',
  '8': 'Phosphat',
  '9': 'Süßungsmittel',
  '10': 'Phenylalaninquelle',
  '11': 'Koffeinhaltig',
  '12': 'Chininhaltig',
  '13': 'Alkoholhaltig',
  '14': 'Nitritpökelsalz',
  '15': 'Milchsäure',
  '16': 'Citronensäure',
  '17': 'Ascorbinsäure',
  '18': 'Tocopherol',
  '19': 'Lecithin',
  '20': 'Johannisbrotkernmehl',
  '21': 'Guarkernmehl',
  '22': 'Xanthan',
  '23': 'Carrageen',
  '24': 'Agar'
};

export function AdditivePicker({ additives, selectedIds, onChange, className = '' }: AdditivePickerProps) {
  const handleToggle = (additiveId: string) => {
    if (selectedIds.includes(additiveId)) {
      onChange(selectedIds.filter(id => id !== additiveId));
    } else {
      onChange([...selectedIds, additiveId]);
    }
  };

  // Sortierte Zusatzstoffe
  const sortedAdditives = [...additives].sort((a, b) => {
    // Numerisch sortieren falls möglich, sonst alphabetisch
    const aNum = parseInt(a.id);
    const bNum = parseInt(b.id);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.id.localeCompare(b.id);
  });

  return (
    <fieldset className={`border border-gray-300 rounded-md p-4 ${className}`}>
      <legend className="text-sm font-medium text-gray-900 px-2">
        Zusatzstoffe auswählen
      </legend>
      
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3 max-h-60 overflow-y-auto"
        role="group"
        aria-labelledby="additive-picker-legend"
      >
        {sortedAdditives.map(additive => {
          const isSelected = selectedIds.includes(additive.id);
          const displayName = ADDITIVE_NAMES[additive.id] || additive.name;
          
          return (
            <label
              key={additive.id}
              className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors min-h-[44px] ${
                isSelected 
                  ? 'bg-orange-100 text-orange-900 border-orange-300' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(additive.id)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                aria-describedby={`additive-${additive.id}-description`}
              />
              
              <span className="flex-1 text-sm">
                <span className="font-medium">{additive.id}</span>
                {displayName && (
                  <span className="text-gray-600 ml-1">
                    - {displayName}
                  </span>
                )}
              </span>
              
              <span 
                id={`additive-${additive.id}-description`}
                className="sr-only"
              >
                Zusatzstoff {additive.id}: {displayName}
              </span>
            </label>
          );
        })}
      </div>
      
      {selectedIds.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 rounded-md border border-orange-200">
          <p className="text-sm text-orange-800">
            <strong>Ausgewählte Zusatzstoffe:</strong>{' '}
            <span className="font-mono">
              {selectedIds.sort((a, b) => {
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                if (!isNaN(aNum) && !isNaN(bNum)) {
                  return aNum - bNum;
                }
                return a.localeCompare(b);
              }).join(', ')}
            </span>
          </p>
        </div>
      )}
    </fieldset>
  );
}