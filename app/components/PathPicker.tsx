import { useState, useEffect, useRef } from "react";

type Category = {
  id: string;
  title: string;
  active?: boolean;
  category?: string; // Para subcategorias, indica a qual categoria pertence
};

type ProductPath = {
  id: string;
  category: string;
  subcategory?: string; // Agora será o ID da subcategoria
  subcategoryTitle?: string; // Título da subcategoria para exibição
  displayName: string;
};

export function PathPicker({
  categories,
  subcategories,
  selectedPaths,
  onPathsChange,
  placeholder = 'Selecionar categoria...',
  subcategoriesPlaceholder = 'Selecionar subcategoria (opcional)...',
}: {
  categories: Category[];
  subcategories: Category[];
  selectedPaths: ProductPath[];
  onPathsChange: (paths: ProductPath[]) => void;
  placeholder?: string;
  subcategoriesPlaceholder?: string;
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [subcategoriesOpen, setSubcategoriesOpen] = useState(false);
  const [categoriesQuery, setCategoriesQuery] = useState('');
  const [subcategoriesQuery, setSubcategoriesQuery] = useState('');
  const [categoriesHoverIndex, setCategoriesHoverIndex] = useState(0);
  const [subcategoriesHoverIndex, setSubcategoriesHoverIndex] = useState(0);
  
  // Estados para o caminho sendo construído
  const [tempCategory, setTempCategory] = useState<string>('');
  const [tempSubcategory, setTempSubcategory] = useState<string>('');
  const [availableSubcategories, setAvailableSubcategories] = useState<Category[]>([]);
  
  // Refs para detectar cliques fora dos dropdowns
  const categoriesRef = useRef<HTMLDivElement>(null);
  const subcategoriesRef = useRef<HTMLDivElement>(null);

  // Garantir que os arrays sejam sempre válidos
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeSubcategories = Array.isArray(subcategories) ? subcategories : [];
  const safeSelectedPaths = Array.isArray(selectedPaths) ? selectedPaths : [];

  // Filtrar categorias baseado na query
  const filteredCategories = categoriesQuery
    ? safeCategories.filter((cat) =>
        cat.title.toLowerCase().includes(categoriesQuery.trim().toLowerCase())
      )
    : safeCategories;

  // Filtrar subcategorias baseado na query E na categoria temporária selecionada
  const filteredSubcategories = (() => {
    let filtered = availableSubcategories;
    
    // Aplicar filtro de busca se houver query
    if (subcategoriesQuery) {
      filtered = filtered.filter((subcat) =>
        subcat.title.toLowerCase().includes(subcategoriesQuery.trim().toLowerCase())
      );
    }
    
    return filtered;
  })();

  // Atualizar subcategorias disponíveis quando categoria temporária muda
  useEffect(() => {
    if (tempCategory) {
      const filtered = safeSubcategories.filter((subcat) => {
        if ('category' in subcat && subcat.category) {
          return subcat.category === tempCategory;
        }
        return false;
      });
      setAvailableSubcategories(filtered);
    } else {
      setAvailableSubcategories([]);
    }
    // Limpar subcategoria temporária quando categoria muda
    setTempSubcategory('');
  }, [tempCategory, safeSubcategories]);

  // Detectar cliques fora dos dropdowns para fechá-los
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

  function selectCategory(categoryId: string) {
    const category = safeCategories.find(cat => cat.id === categoryId);
    if (category) {
      setTempCategory(categoryId);
      setCategoriesOpen(false);
      setCategoriesQuery('');
    }
  }

  function selectSubcategory(subcategoryId: string) {
    const subcategory = availableSubcategories.find(subcat => subcat.id === subcategoryId);
    if (subcategory) {
      setTempSubcategory(subcategoryId);
      setSubcategoriesOpen(false);
      setSubcategoriesQuery('');
    }
  }

  function addPath() {
    if (!tempCategory) return;

    const category = safeCategories.find(cat => cat.id === tempCategory);
    const subcategory = tempSubcategory ? availableSubcategories.find(subcat => subcat.id === tempSubcategory) : null;

    if (category) {
      const newPath: ProductPath = {
        id: `${tempCategory}-${tempSubcategory || 'none'}-${Date.now()}`,
        category: category.title,
        subcategory: subcategory?.id, // Salvar o ID da subcategoria
        subcategoryTitle: subcategory?.title, // Salvar o título para exibição
        displayName: subcategory ? `${category.title} > ${subcategory.title}` : category.title
      };

      // Verificar se o caminho já existe
      const pathExists = safeSelectedPaths.some(path => 
        path.category === newPath.category && path.subcategory === newPath.subcategory
      );

      if (!pathExists) {
        onPathsChange([...safeSelectedPaths, newPath]);
      }

      // Limpar seleções temporárias
      setTempCategory('');
      setTempSubcategory('');
      setAvailableSubcategories([]);
    }
  }

  function removePath(pathId: string) {
    onPathsChange(safeSelectedPaths.filter(path => path.id !== pathId));
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
        selectCategory(targetCategory.id);
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
        selectSubcategory(targetSubcategory.id);
      }
    } else if (e.key === 'Escape') {
      setSubcategoriesOpen(false);
    }
  }

  const selectedCategory = safeCategories.find(cat => cat.id === tempCategory);
  const selectedSubcategory = availableSubcategories.find(subcat => subcat.id === tempSubcategory);

  return (
    <div className="flex flex-col gap-4">
      {/* Exibição dos caminhos selecionados */}
      {safeSelectedPaths.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-200">Caminhos do Produto:</label>
          <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-md border border-slate-700">
            {safeSelectedPaths.map((path) => (
              <div key={path.id} className="inline-flex items-center gap-1">
                <span className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-blue-900/30 text-blue-200 border border-blue-800">
                  {path.displayName}
                  <button
                    onClick={() => removePath(path.id)}
                    className="w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-blue-900/60 ml-1"
                    aria-label={`Remover caminho ${path.displayName}`}
                  >
                    ×
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seletor de Categoria */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Categoria:</label>
        <div className="relative" ref={categoriesRef}>
          <div
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
            onClick={() => setCategoriesOpen(true)}
          >
            <div className="flex items-center gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-green-900/30 text-green-200 border border-green-800">
                  {selectedCategory.title}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTempCategory('');
                      setTempSubcategory('');
                    }}
                    className="w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-green-900/60"
                    aria-label={`Remover ${selectedCategory.title}`}
                  >
                    ×
                  </button>
                </span>
              )}
              <input
                className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
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
                    return (
                      <li
                        key={category.id}
                        onMouseEnter={() => setCategoriesHoverIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectCategory(category.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                          ${ativo ? 'bg-slate-700' : ''}
                        `}
                      >
                        <span className="text-slate-100">{category.title}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="sticky bottom-0 flex gap-2 p-2 border-t border-slate-700 bg-slate-800">
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

      {/* Seletor de Subcategoria (só aparece se categoria foi selecionada) */}
      {tempCategory && (
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-200">Subcategoria (opcional):</label>
          <div className="relative" ref={subcategoriesRef}>
            <div
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
              onClick={() => setSubcategoriesOpen(true)}
            >
              <div className="flex items-center gap-2">
                {selectedSubcategory && (
                  <span className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-purple-900/30 text-purple-200 border border-purple-800">
                    {selectedSubcategory.title}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTempSubcategory('');
                      }}
                      className="w-4 h-4 inline-flex items-center justify-center rounded-full hover:bg-purple-900/60"
                      aria-label={`Remover ${selectedSubcategory.title}`}
                    >
                      ×
                    </button>
                  </span>
                )}
                <input
                  className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
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
                      return (
                        <li
                          key={subcategory.id}
                          onMouseEnter={() => setSubcategoriesHoverIndex(idx)}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectSubcategory(subcategory.id)}
                          className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                            ${ativo ? 'bg-slate-700' : ''}
                          `}
                        >
                          <span className="text-slate-100">{subcategory.title}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="sticky bottom-0 flex gap-2 p-2 border-t border-slate-700 bg-slate-800">
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
      )}

      {/* Botão para adicionar caminho */}
      {tempCategory && (
        <button
          onClick={addPath}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition border border-green-800 shadow"
        >
          Adicionar Caminho: {selectedCategory?.title} {selectedSubcategory ? `> ${selectedSubcategory.title}` : ''}
        </button>
      )}
    </div>
  );
}
