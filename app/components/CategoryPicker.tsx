import { useState, useEffect, useRef } from "react";

type Category = {
  id: string;
  title: string;
  active?: boolean;
  category?: string; // para subcategorias, indica a qual categoria pertence
};

export function CategoryPicker({
  categories,
  subcategories,
  selectedCategories,
  selectedSubcategories,
  onCategoriesChange,
  onSubcategoriesChange,
  placeholder = 'Selecionar categorias...',
  subcategoriesPlaceholder = 'Selecionar subcategorias...',
  maxChips = 4,
}: {
  categories: Category[];
  subcategories: Category[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  onSubcategoriesChange: (subcategories: string[]) => void;
  placeholder?: string;
  subcategoriesPlaceholder?: string;
  maxChips?: number;
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [subcategoriesOpen, setSubcategoriesOpen] = useState(false);
  const [categoriesQuery, setCategoriesQuery] = useState('');
  const [subcategoriesQuery, setSubcategoriesQuery] = useState('');
  const [categoriesHoverIndex, setCategoriesHoverIndex] = useState(0);
  const [subcategoriesHoverIndex, setSubcategoriesHoverIndex] = useState(0);
  
  // refs para detectar cliques fora dos dropdowns
  const categoriesRef = useRef<HTMLDivElement>(null);
  const subcategoriesRef = useRef<HTMLDivElement>(null);

  // garante que os arrays sejam sempre válidos
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeSubcategories = Array.isArray(subcategories) ? subcategories : [];
  const safeSelectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];
  const safeSelectedSubcategories = Array.isArray(selectedSubcategories) ? selectedSubcategories : [];

  const selectedCategoriesSet = new Set(safeSelectedCategories);
  const selectedSubcategoriesSet = new Set(safeSelectedSubcategories);

  // filtra categorias pela query
  const filteredCategories = categoriesQuery
    ? safeCategories.filter((cat) =>
        cat.title.toLowerCase().includes(categoriesQuery.trim().toLowerCase())
      )
    : safeCategories;

  // filtra subcategorias pela query e pelas categorias selecionadas
  const filteredSubcategories = (() => {
    let filtered = safeSubcategories;
    
    // filtra subcategorias que pertencem às categorias selecionadas
    if (safeSelectedCategories.length > 0) {
      filtered = safeSubcategories.filter((subcat) => {
        if ('category' in subcat && subcat.category) {
          return safeSelectedCategories.includes(subcat.category);
        }
        return true;
      });
    }
    
    // aplica filtro de busca pela query
    if (subcategoriesQuery) {
      filtered = filtered.filter((subcat) =>
        subcat.title.toLowerCase().includes(subcategoriesQuery.trim().toLowerCase())
      );
    }
    
    return filtered;
  })();

  // detecta cliques fora dos dropdowns para fechá-los
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
      if (subcategoriesRef.current && !subcategoriesRef.current.contains(event.target as Node)) {
        setSubcategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function toggleCategory(categoryId: string) {
    const next = new Set(selectedCategoriesSet);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    onCategoriesChange(Array.from(next));
  }

  function toggleSubcategory(subcategoryId: string) {
    const next = new Set(selectedSubcategoriesSet);
    if (next.has(subcategoryId)) {
      next.delete(subcategoryId);
    } else {
      next.add(subcategoryId);
    }
    onSubcategoriesChange(Array.from(next));
  }

  function handleCategoriesKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!categoriesOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setCategoriesOpen(true);
      e.preventDefault();
      return;
    }
    if (!categoriesOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCategoriesHoverIndex((i) => Math.min(i + 1, filteredCategories.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCategoriesHoverIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetCategory = filteredCategories[categoriesHoverIndex];
      if (targetCategory) {
        toggleCategory(targetCategory.id);
      }
    } else if (e.key === 'Escape') {
      setCategoriesOpen(false);
    }
  }

  function handleSubcategoriesKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!subcategoriesOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setSubcategoriesOpen(true);
      e.preventDefault();
      return;
    }
    if (!subcategoriesOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSubcategoriesHoverIndex((i) => Math.min(i + 1, filteredSubcategories.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSubcategoriesHoverIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetSubcategory = filteredSubcategories[subcategoriesHoverIndex];
      if (targetSubcategory) {
        toggleSubcategory(targetSubcategory.id);
      }
    } else if (e.key === 'Escape') {
      setSubcategoriesOpen(false);
    }
  }

  // chips visíveis para categorias
  const visibleCategories = safeSelectedCategories.slice(0, maxChips);
  const hiddenCategories = Math.max(0, safeSelectedCategories.length - visibleCategories.length);

  // chips visíveis para subcategorias
  const visibleSubcategories = safeSelectedSubcategories.slice(0, maxChips);
  const hiddenSubcategories = Math.max(0, safeSelectedSubcategories.length - visibleSubcategories.length);

  return (
    <div className="flex flex-col gap-4">
      {/* Seletor de Categorias */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Categorias:</label>
        <div className="relative" ref={categoriesRef}>
          <div
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
            onClick={() => setCategoriesOpen(true)}
          >
            <div className="flex flex-wrap gap-1">
              {visibleCategories.map((categoryId) => {
                const category = safeCategories.find(cat => cat.id === categoryId);
                return (
                  <div key={categoryId} className="inline-flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-200 border border-green-800">
                      {category?.title || categoryId}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(categoryId);
                        }}
                        className="w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-green-900/60"
                        aria-label={`Remover ${category?.title || categoryId}`}
                      >
                        ×
                      </button>
                    </span>
                  </div>
                );
              })}
              {hiddenCategories > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-200 border border-slate-600">
                  +{hiddenCategories}
                </span>
              )}
              <input
                className="flex-1 min-w-[160px] bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder={placeholder}
                value={categoriesQuery}
                onChange={(e) => {
                  setCategoriesQuery(e.target.value);
                  setCategoriesOpen(true);
                  setCategoriesHoverIndex(0);
                }}
                onKeyDown={handleCategoriesKeyDown}
              />
            </div>
          </div>

          {/* Dropdown de Categorias */}
          {categoriesOpen && (
            <div className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-md border border-slate-700 bg-slate-800 shadow-2xl">
              {filteredCategories.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-400">Nenhuma categoria encontrada</div>
              ) : (
                <ul className="py-1">
                  {filteredCategories.map((category, idx) => {
                    const ativo = idx === categoriesHoverIndex;
                    const marcado = selectedCategoriesSet.has(category.id);
                    return (
                      <li
                        key={category.id}
                        onMouseEnter={() => setCategoriesHoverIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleCategory(category.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                          ${ativo ? 'bg-slate-700' : ''}
                        `}
                      >
                        <input type="checkbox" readOnly checked={marcado} />
                        <span className="text-slate-100">{category.title}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="sticky bottom-0 flex gap-2 p-2 border-t border-slate-700 bg-slate-800">
                <button
                  onClick={() => onCategoriesChange(safeCategories.map(cat => cat.id))}
                  className="text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700 text-slate-100"
                >
                  Selecionar todas
                </button>
                <button
                  onClick={() => onCategoriesChange([])}
                  className="text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700 text-slate-100"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setCategoriesOpen(false)}
                  className="ml-auto text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700 text-slate-100"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seletor de Subcategorias */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Subcategorias:</label>
        <div className="relative" ref={subcategoriesRef}>
          <div
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
            onClick={() => setSubcategoriesOpen(true)}
          >
            <div className="flex flex-wrap gap-1">
              {visibleSubcategories.map((subcategoryId) => {
                const subcategory = safeSubcategories.find(subcat => subcat.id === subcategoryId);
                return (
                  <div key={subcategoryId} className="inline-flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-900/30 text-purple-200 border border-purple-800">
                      {subcategory?.title || subcategoryId}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSubcategory(subcategoryId);
                        }}
                        className="w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-purple-900/60"
                        aria-label={`Remover ${subcategory?.title || subcategoryId}`}
                      >
                        ×
                      </button>
                    </span>
                  </div>
                );
              })}
              {hiddenSubcategories > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-200 border border-slate-600">
                  +{hiddenSubcategories}
                </span>
              )}
              <input
                className="flex-1 min-w-[160px] bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder={subcategoriesPlaceholder}
                value={subcategoriesQuery}
                onChange={(e) => {
                  setSubcategoriesQuery(e.target.value);
                  setSubcategoriesOpen(true);
                  setSubcategoriesHoverIndex(0);
                }}
                onKeyDown={handleSubcategoriesKeyDown}
              />
            </div>
          </div>

          {/* Dropdown de Subcategorias */}
          {subcategoriesOpen && (
            <div className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-md border border-slate-700 bg-slate-800 shadow-2xl">
              {filteredSubcategories.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-400">Nenhuma subcategoria encontrada</div>
              ) : (
                <ul className="py-1">
                  {filteredSubcategories.map((subcategory, idx) => {
                    const ativo = idx === subcategoriesHoverIndex;
                    const marcado = selectedSubcategoriesSet.has(subcategory.id);
                    return (
                      <li
                        key={subcategory.id}
                        onMouseEnter={() => setSubcategoriesHoverIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggleSubcategory(subcategory.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                          ${ativo ? 'bg-slate-700' : ''}
                        `}
                      >
                        <input type="checkbox" readOnly checked={marcado} />
                        <span className="text-slate-100">{subcategory.title}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="sticky bottom-0 flex gap-2 p-2 border-t border-slate-700 bg-slate-800">
                <button
                  onClick={() => onSubcategoriesChange(safeSubcategories.map(subcat => subcat.id))}
                  className="text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700 text-slate-100"
                >
                  Selecionar todas
                </button>
                <button
                  onClick={() => onSubcategoriesChange([])}
                  className="text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700 text-slate-100"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setSubcategoriesOpen(false)}
                  className="ml-auto text-xs px-3 py-1 rounded border border-slate-600 hover:bg-slate-700 text-slate-100"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
