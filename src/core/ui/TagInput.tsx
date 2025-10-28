import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  maxTags?: number;
  disabled?: boolean;
  helperText?: string;
}

/**
 * Composant d'input avec tags/chips pour ajouter plusieurs valeurs
 * Design moderne avec animations
 */
export default function TagInput({
  value,
  onChange,
  placeholder = 'Ajouter...',
  label,
  maxTags,
  disabled = false,
  helperText,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Supprimer le dernier tag si on appuie sur Backspace avec un input vide
      removeTag(value.length - 1);
    }
  };

  const addTag = (tag: string) => {
    if (!tag) return;
    
    // Vérifier si le tag existe déjà (insensible à la casse)
    if (value.some(t => t.toLowerCase() === tag.toLowerCase())) {
      setInputValue('');
      return;
    }

    // Vérifier le nombre maximum de tags
    if (maxTags && value.length >= maxTags) {
      return;
    }

    onChange([...value, tag]);
    setInputValue('');
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Ajouter automatiquement le tag si l'utilisateur quitte le champ
    if (inputValue.trim()) {
      addTag(inputValue.trim());
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {maxTags && (
            <span className="ml-2 text-xs text-gray-500">
              ({value.length}/{maxTags})
            </span>
          )}
        </label>
      )}

      {/* Container principal */}
      <div
        className={`
          min-h-[42px] px-3 py-2 border rounded-lg bg-white
          transition-all duration-200
          ${isFocused ? 'ring-2 ring-primary border-primary' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
        `}
      >
        {/* Tags + Input */}
        <div className="flex flex-wrap gap-2">
          {/* Tags existants */}
          {value.map((tag, index) => (
            <span
              key={index}
              className="
                inline-flex items-center gap-1 px-3 py-1 
                bg-primary/10 text-primary rounded-full
                text-sm font-medium
                animate-in fade-in slide-in-from-left-2 duration-200
              "
            >
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="
                    ml-1 p-0.5 rounded-full
                    hover:bg-primary/20 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-primary/50
                  "
                  aria-label={`Supprimer ${tag}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}

          {/* Input pour ajouter un nouveau tag */}
          {(!maxTags || value.length < maxTags) && !disabled && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              placeholder={value.length === 0 ? placeholder : ''}
              disabled={disabled}
              className="
                flex-1 min-w-[120px] outline-none bg-transparent
                text-sm placeholder:text-gray-400
              "
            />
          )}
        </div>
      </div>

      {/* Helper text */}
      {helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}

      {/* Message si limite atteinte */}
      {maxTags && value.length >= maxTags && (
        <p className="mt-1 text-xs text-amber-600">
          Nombre maximum de {maxTags} éléments atteint
        </p>
      )}
    </div>
  );
}
