// seletor de cor para o editor
import { useState, useEffect } from "react";

const colorPalette = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#6B7280', '#000000'
];

interface ColorSelectorProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ColorSelector({ currentColor, onColorChange, size = 'md' }: ColorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (isOpen && !(event.target as Element).closest('.color-selector')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block color-selector">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} rounded-full border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        style={{ backgroundColor: currentColor }}
        aria-label="Selecionar cor"
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 grid grid-cols-5 gap-1">
          {colorPalette.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onColorChange(color);
                setIsOpen(false);
              }}
              className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${
                currentColor === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Cor ${color}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}