import { useState, useEffect } from "react";



export function TagPicker({
    options,
    select,
    value,
    onChange,
    onColorChange,
    placeholder = 'Buscar tags...',
    maxChips = 6,
  }: {
    options: string[];
    select: boolean;
    value: string[];
    onChange: (next: string[]) => void;
    onColorChange?: (tag: string, color: string) => void;
    placeholder?: string;
    maxChips?: number;
  }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [hoverIndex, setHoverIndex] = useState(0);
    const [newTagInput, setNewTagInput] = useState('');
    const [newTagColor, setNewTagColor] = useState('#3B82F6');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [tagColors, setTagColors] = useState<{[key: string]: string}>({});
    const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

    // fechar seletor de cores ao clicar fora
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (activeColorPicker) {
          const target = event.target as Element;
          // não fechar se clicou dentro do seletor de cores
          if (!target.closest('.color-selector-popup')) {
            setActiveColorPicker(null);
          }
        }
      };

      if (activeColorPicker) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [activeColorPicker]);
  
    // paleta de cores predefinida (8 cores, 2 tons cada)
    const colorPalette = [
      { name: 'Azul Claro', value: '#60A5FA' },
      { name: 'Azul Escuro', value: '#1E40AF' },
      { name: 'Vermelho Claro', value: '#F87171' },
      { name: 'Vermelho Escuro', value: '#B91C1C' },
      { name: 'Roxo Claro', value: '#A78BFA' },
      { name: 'Roxo Escuro', value: '#6B21A8' },
      { name: 'Rosa Claro', value: '#F472B6' },
      { name: 'Rosa Escuro', value: '#BE185D' },
      { name: 'Verde Claro', value: '#4ADE80' },
      { name: 'Verde Escuro', value: '#15803D' },
      { name: 'Cinza Claro', value: '#9CA3AF' },
      { name: 'Cinza Escuro', value: '#374151' },
      { name: 'Laranja Claro', value: '#FB923C' },
      { name: 'Laranja Escuro', value: '#C2410C' },
      { name: 'Amarelo Claro', value: '#FBBF24' },
      { name: 'Amarelo Escuro', value: '#D97706' },
    ];

    // garantir que options e value sejam sempre arrays
    const safeOptions = Array.isArray(options) ? options : [];
    const safeValue = Array.isArray(value) ? value : [];
  
    const selecionadas = new Set(safeValue);
    const filtradas = (query
      ? safeOptions.filter((t) =>
          t.toLowerCase().includes(query.trim().toLowerCase())
        )
      : safeOptions
    ).slice(0, 200); // segurança se houver muitas tags
  
    function toggle(tag: string) {
      if (!select) return; // em modo de criação, não permite seleção
      const next = new Set(selecionadas);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      onChange(Array.from(next));
    }

    function addNewTag() {
      if (newTagInput.trim() && !safeValue.includes(newTagInput.trim())) {
        // em modo de criação, adiciona a nova tag à lista de opções
        const newTag = newTagInput.trim();
        const newTags = [...safeValue, newTag];
        
        // definir cor padrão para a nova tag
        const newColors = {
          ...tagColors,
          [newTag]: newTagColor
        };
        setTagColors(newColors);
        
        // notificar componente pai sobre as novas tags e cores
        onChange(newTags);
        if (onColorChange) {
          onColorChange(newTag, newTagColor);
        }
        
        setNewTagInput('');
        setShowColorPicker(false);
      }
    }

    function handleNewTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addNewTag();
      }
    }
  
    function addIfMatchesEnter() {
      if (!select) return; // em modo de criação, não permite seleção
      const list = filtradas || [];
      const alvo = list[hoverIndex] ?? list[0];
      if (alvo) toggle(alvo);
    }
  
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
        setOpen(true);
        e.preventDefault();
        return;
      }
      if (!open) return;
  
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHoverIndex((i) => Math.min(i + 1, (filtradas || []).length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHoverIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        addIfMatchesEnter();
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
  
    // chips visíveis + contador
    const visiveis = safeValue.slice(0, maxChips);
    const escondidas = Math.max(0, safeValue.length - visiveis.length);

    // componente de seletor de cores minimalista
    const ColorSelector = ({ currentColor, onColorChange, isOpen, onToggle }: {
      currentColor: string;
      onColorChange: (color: string) => void;
      isOpen: boolean;
      onToggle: () => void;
    }) => (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="w-6 h-6 rounded border border-slate-600 cursor-pointer hover:border-slate-400 transition-colors"
          style={{ backgroundColor: currentColor }}
          title="Escolher cor"
        />
        {isOpen && (
          <div className="color-selector-popup absolute top-8 left-0 z-50 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
            <div className="grid grid-cols-4 gap-2 w-32">
              {colorPalette.map((color) => (
                <button
                  key={color.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onColorChange(color.value);
                    onToggle();
                  }}
                  className="w-6 h-6 rounded border border-slate-500 hover:border-white hover:scale-110 transition-all duration-200"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  
    return (
      <div className="w-full">
        {/* input + chips */}
        <div
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
          onClick={() => setOpen(true)}
        >
          <div className="flex flex-wrap gap-1">
            {visiveis.map((tag) => (
              <div key={tag} className="inline-flex items-center gap-1">
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-900/30 text-blue-200 border border-blue-800"
                >
                  {tag}
                  {!select && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = safeValue.filter(t => t !== tag);
                        onChange(next);
                        // remover cor da tag removida
                        const newColors = { ...tagColors };
                        delete newColors[tag];
                        setTagColors(newColors);
                      }}
                      className="w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-blue-900/60"
                      aria-label={`Remover ${tag}`}
                    >
                      ×
                    </button>
                  )}
                </span>
                {!select && onColorChange && (
                  <ColorSelector
                    currentColor={tagColors[tag] || '#3B82F6'}
                    onColorChange={(newColor) => {
                      // atualizar estado local imediatamente
                      setTagColors(prev => ({
                        ...prev,
                        [tag]: newColor
                      }));
                      // notificar componente pai
                      onColorChange(tag, newColor);
                    }}
                    isOpen={activeColorPicker === tag}
                    onToggle={() => setActiveColorPicker(activeColorPicker === tag ? null : tag)}
                  />
                )}
              </div>
            ))}
            {escondidas > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-200 border border-slate-600">
                +{escondidas}
              </span>
            )}
  
            {select ? (
              <input
                className="flex-1 min-w-[160px] bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  setHoverIndex(0);
                }}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <input
                className="flex-1 min-w-[160px] bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Digite uma nova tag e pressione Enter..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleNewTagKeyDown}
              />
            )}
          </div>
        </div>


  
        {/* dropdown - apenas para modo de seleção */}
        {open && select && (
          <div className="mt-2 max-h-64 overflow-auto rounded-md border border-slate-700 bg-slate-800 shadow-2xl">
            {filtradas.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">Nenhuma tag encontrada</div>
            ) : (
              <ul className="py-1">
                {filtradas.map((tag, idx) => {
                  const ativo = idx === hoverIndex;
                  const marcado = selecionadas.has(tag);
                  return (
                    <li
                      key={tag}
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggle(tag)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                        ${ativo ? 'bg-slate-700' : ''}
                      `}
                    >
                      
                        <input type="checkbox" readOnly checked={marcado} />
                      
                      <span className="text-slate-100">{tag}</span>
                    </li>
                  );
                })}
              </ul>
            )}
  
            {/* ações rápidas */}
            
            <div className="sticky bottom-0 flex gap-2 p-2 border-t border-slate-700 bg-slate-800">
              <button
                onClick={() => onChange(safeOptions)}
                className="text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700 text-slate-100"
              >
                Selecionar tudo
              </button>
              <button
                onClick={() => onChange([])}
                className="text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700 text-slate-100"
              >
                Limpar
              </button>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700 text-slate-100"
              >
                Fechar
              </button>
            </div>
            
          </div>
        )}
      </div>
    );
  }
  