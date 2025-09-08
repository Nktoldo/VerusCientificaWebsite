"use client"
import { getCategories, getSubCategories, getProducts, changeItemState, getTags, deleteItem, writeCategoryData, writeSubcategoryData } from "@/lib/databaseFunctions";
import { get, ref } from "firebase/database";
import { db } from "@/lib/firebase.mjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TagPicker } from "../components/TagPicker";
import { writeSupplierData, writeTagsData } from "@/lib/databaseFunctions";
type Item = { id: string, title?: string, img?: string, active?: boolean, category?: string }

export default function editor() {
    const router = useRouter();
    const [selected, setSelected] = useState<0 |1 | 2 | 3>(0);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, showModal] = useState(false);
    const [modalType, setModalType] = useState<"tags" | "fornecedor" | "categoria" | "subcategoria">("tags");
    const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [existingTags, setExistingTags] = useState<{[key: string]: {active: boolean, color: string}}>({});
    const [existingSuppliers, setExistingSuppliers] = useState<{[key: string]: {active: boolean, type: string}}>({});
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string>("");
    const [supplierType, setSupplierType] = useState<"Representada" | "Revenda">("Representada");
    const [tagColors, setTagColors] = useState<{[key: string]: string}>({});
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");
    const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState<string>("");
    const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<string[]>([]);

    useEffect(() => {
        if (modal) {
            getTags().then((tags) => {
                setTags(tags);
                console.log(tags);
            })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, []);

    useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                let productsData: Item[] = [];
                if (selected == 1) {
                    await getProducts()
                        .then((prods) => {
                            for (let i in prods) {
                                if (prods[i] !== null) {
                                    productsData.push({
                                        id: prods[i].id,
                                        title: prods[i].title,
                                        img: prods[i].imageUrl,
                                        active: !!prods[i].active
                                    });
                                }
                            }
                        })
                        .catch(err => {
                            console.log(err)
                        })
                    setItems(productsData);
                } else if (selected === 2) {
                    await getCategories()
                        .then(cats => {
                            const categoryList: Item[] = []
                            cats.map(cat => {
                                categoryList.push({
                                    id: cat.id,
                                    title: cat.title,
                                    active: cat.active
                                })
                            })
                            setItems(categoryList);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                } else if (selected === 3) {
                    let data = await getSubCategories({ category: "none" })
                        .then(cats => {
                            const categoryList: Item[] = []
                            cats.map(cat => {
                                categoryList.push({
                                    id: cat.id,
                                    title: cat.title,
                                    category: cat.category,
                                    active: cat.active
                                })
                            })
                            setItems(categoryList);
                        })
                        .catch((err) => {
                            console.log(err);
                        });

                } else {
                    setItems([]);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [selected]);

    const handleEdit = (productId: string) => {
        if (selected === 1) {
            // Navegar para a página de criação com o ID do produto para edição
            router.push(`/editor/criar?edit=${productId}`);
        }
    };

    const searchTags = async () => {
        try {
            const tagsSnapshot = await get(ref(db, 'filtros/tags'));
            if (tagsSnapshot.exists()) {
                const tagsData = tagsSnapshot.val();
                const tagsList = Object.keys(tagsData);
                const tagsInfo: {[key: string]: {active: boolean, color: string}} = {};
                
                tagsList.forEach(tag => {
                    tagsInfo[tag] = {
                        active: tagsData[tag].active !== false, // padrão true se não especificado
                        color: tagsData[tag].color || '#3B82F6'
                    };
                });
                
                setTags(tagsList);
                setExistingTags(tagsInfo);
                console.log('Tags carregadas:', tagsInfo);
            }
        } catch (err) {
            console.log('Erro ao carregar tags:', err);
        }
    }

    const searchSuppliers = async () => {
        try {
            const suppliersSnapshot = await get(ref(db, 'filtros/suppliers'));
            if (suppliersSnapshot.exists()) {
                const suppliersData = suppliersSnapshot.val();
                const suppliersList = Object.keys(suppliersData);
                const suppliersInfo: {[key: string]: {active: boolean, type: string}} = {};
                
                suppliersList.forEach(supplier => {
                    suppliersInfo[supplier] = {
                        active: suppliersData[supplier].active !== false, // padrão true se não especificado
                        type: suppliersData[supplier].type || 'Representada'
                    };
                });
                
                setExistingSuppliers(suppliersInfo);
                console.log('Fornecedores carregados:', suppliersInfo);
            }
        } catch (err) {
            console.log('Erro ao carregar fornecedores:', err);
        }
    }

    const searchCategories = async () => {
        try {
            const categories = await getCategories();
            const categoryList: string[] = [];
            categories.forEach(cat => {
                categoryList.push(cat.title);
            });
            setCategoriasDisponiveis(categoryList);
            console.log('Categorias carregadas:', categoryList);
        } catch (err) {
            console.log('Erro ao carregar categorias:', err);
        }
    }


    return (
        <main className="min-h-screen px-2">
            {modal && (
                <div className=" fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="animate-popin duration-200 bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            onClick={() => showModal(false)}
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-green-700">
                            {modalType === "tags" ? "Criar Tags" : 
                             modalType === "fornecedor" ? "Criar Fornecedor" :
                             modalType === "categoria" ? "Criar Categoria" :
                             "Criar Subcategoria"}
                        </h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                {modalType === "tags" && (
                                    <TagPicker 
                                        options={tags} 
                                        value={tagsSelecionadas} 
                                        onChange={(newTags) => {
                                            setTagsSelecionadas(newTags);
                                            // Capturar cores das novas tags
                                            const newColors = { ...tagColors };
                                            newTags.forEach(tag => {
                                                if (!newColors[tag]) {
                                                    newColors[tag] = '#3B82F6'; // cor padrão
                                                }
                                            });
                                            setTagColors(newColors);
                                        }}
                                        onColorChange={(tag, color) => {
                                            console.log(`Cor da tag ${tag} mudou para: ${color}`);
                                            setTagColors(prev => ({
                                                ...prev,
                                                [tag]: color
                                            }));
                                        }}
                                        select={false} 
                                    />
                                )}
                                {modalType === "categoria" && (
                                    <div className="flex flex-col gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Nome da categoria..." 
                                            value={categoriaSelecionada} 
                                            onChange={(e) => setCategoriaSelecionada(e.target.value)} 
                                            className="rounded-md h-12 w-full border border-slate-700 bg-slate-800 text-slate-100 px-3 placeholder:text-slate-500 focus:outline-blue-400"
                                        />
                                    </div>
                                )}
                                {modalType === "subcategoria" && (
                                    <div className="flex flex-col gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Nome da subcategoria..." 
                                            value={subcategoriaSelecionada} 
                                            onChange={(e) => setSubcategoriaSelecionada(e.target.value)} 
                                            className="rounded-md h-12 w-full border border-slate-700 bg-slate-800 text-slate-100 px-3 placeholder:text-slate-500 focus:outline-blue-400"
                                        />
                                        <select
                                            value={categoriaSelecionada}
                                            onChange={(e) => setCategoriaSelecionada(e.target.value)}
                                            className="rounded-md h-12 w-full border border-slate-700 bg-slate-800 text-slate-100 px-3 focus:outline-blue-400"
                                        >
                                            <option value="">Selecione uma categoria</option>
                                            {categoriasDisponiveis.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {modalType === "fornecedor" && (
                                    <div className="flex flex-col gap-2">
                                        <input type="text" placeholder="Nome do fornecedor..." value={fornecedorSelecionado} onChange={(e) => setFornecedorSelecionado(e.target.value)} className="rounded-md h-12 w-full border border-slate-700 bg-slate-800 text-slate-100 px-3 placeholder:text-slate-500 focus:outline-blue-400"/>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setSupplierType("Representada")}
                                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                                                    supplierType === "Representada"
                                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/25 transform scale-105"
                                                        : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:scale-[1.02]"
                                                }`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        supplierType === "Representada" ? "bg-white" : "bg-slate-400"
                                                    }`}></div>
                                                    <span>Representada</span>
                                                </div>
                                            </button>
                                            
                                            <button
                                                type="button"
                                                onClick={() => setSupplierType("Revenda")}
                                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
                                                    supplierType === "Revenda"
                                                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/25 transform scale-105"
                                                        : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 hover:scale-[1.02]"
                                                }`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        supplierType === "Revenda" ? "bg-white" : "bg-slate-400"
                                                    }`}></div>
                                                    <span>Revenda</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {modalType === "categoria" && (
                                    <button
                                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                                        onClick={async () => {
                                            if (!categoriaSelecionada.trim()) {
                                                alert("Por favor, digite o nome da categoria");
                                                return;
                                            }
                                            await writeCategoryData({ title: categoriaSelecionada });
                                            setCategoriaSelecionada("");
                                            // Recarregar categorias existentes
                                            await searchCategories();
                                            // Recarregar lista de itens se estiver na aba de categorias
                                            if (selected === 2) {
                                                const run = async () => {
                                                    setLoading(true);
                                                    try {
                                                        await getCategories()
                                                            .then(cats => {
                                                                const categoryList: Item[] = []
                                                                cats.map(cat => {
                                                                    categoryList.push({
                                                                        id: cat.title,
                                                                        title: cat.title,
                                                                        active: cat.active
                                                                    })
                                                                })
                                                                setItems(categoryList);
                                                            })
                                                            .catch((err) => {
                                                                console.log(err);
                                                            });
                                                    } catch (error) {
                                                        console.log(error);
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                };
                                                run();
                                            }
                                        }}
                                    >Criar Categoria</button>
                                )}
                                {modalType === "subcategoria" && (
                                    <button
                                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                                        onClick={async () => {
                                            if (!subcategoriaSelecionada.trim()) {
                                                alert("Por favor, digite o nome da subcategoria");
                                                return;
                                            }
                                            if (!categoriaSelecionada) {
                                                alert("Por favor, selecione uma categoria");
                                                return;
                                            }
                                            await writeSubcategoryData({ title: subcategoriaSelecionada, category: categoriaSelecionada });
                                            setSubcategoriaSelecionada("");
                                            setCategoriaSelecionada("");
                                            // Recarregar subcategorias existentes se estiver na aba de subcategorias
                                            if (selected === 3) {
                                                const run = async () => {
                                                    setLoading(true);
                                                    try {
                                                        let data = await getSubCategories({ category: "none" })
                                                            .then(cats => {
                                                                const categoryList: Item[] = []
                                                                cats.map(cat => {
                                                                    categoryList.push({
                                                                        id: cat.id,
                                                                        title: cat.title,
                                                                        category: cat.category,
                                                                        active: cat.active
                                                                    })
                                                                })
                                                                setItems(categoryList);
                                                            })
                                                            .catch((err) => {
                                                                console.log(err);
                                                            });
                                                    } catch (error) {
                                                        console.log(error);
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                };
                                                run();
                                            }
                                        }}
                                    >Criar Subcategoria</button>
                                )}
                                {modalType === "fornecedor" && (
                                    <button
                                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                                        onClick={async () => {
                                            await writeSupplierData({ title: fornecedorSelecionado, type: supplierType });
                                            setFornecedorSelecionado("");
                                            setSupplierType("Representada"); // Reset para padrão
                                            // Recarregar fornecedores existentes
                                            await searchSuppliers();
                                        }}
                                    >Criar Fornecedor</button>
                                )}
                                {modalType === "tags" && (
                                    <button
                                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                                        onClick={async () => {
                                            console.log(tagsSelecionadas);
                                            for (let tag of tagsSelecionadas) {
                                                await writeTagsData({ 
                                                    title: tag, 
                                                    color: tagColors[tag] || '#3B82F6',
                                                    active: true 
                                                });
                                            }
                                            // Limpar após criação
                                            setTagsSelecionadas([]);
                                            setTagColors({});
                                            // Recarregar tags existentes
                                            await searchTags();
                                        }}
                                    >Criar Tags</button>
                                )}
                            </div>
                        </div>
                        
                        {/* Lista de tags existentes */}
                        {modalType === "tags" && Object.keys(existingTags).length > 0 && (
                            <div className="mt-6 border-t border-slate-700 pt-4">
                                <h3 className="text-lg font-semibold mb-3 text-slate-300">Tags Existentes</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {Object.entries(existingTags).map(([tagName, tagInfo]) => (
                                        <div key={tagName} className="flex items-center justify-between p-3 bg-slate-800 rounded-md border border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-4 h-4 rounded-full border border-slate-600"
                                                        style={{ backgroundColor: tagInfo.color }}
                                                        title={`Cor atual: ${tagInfo.color}`}
                                                    ></div>
                                                    <input
                                                        type="color"
                                                        value={tagInfo.color}
                                                        onChange={(e) => {
                                                            // Atualizar estado local imediatamente para preview
                                                            setExistingTags(prev => ({
                                                                ...prev,
                                                                [tagName]: { ...prev[tagName], color: e.target.value }
                                                            }));
                                                        }}
                                                        onBlur={async (e) => {
                                                            // Enviar para banco apenas quando perder foco
                                                            const newColor = e.target.value;
                                                            try {
                                                                await writeTagsData({ 
                                                                    title: tagName, 
                                                                    color: newColor, 
                                                                    active: tagInfo.active 
                                                                });
                                                                console.log(`Cor da tag ${tagName} alterada para: ${newColor}`);
                                                            } catch (error) {
                                                                console.error('Erro ao alterar cor da tag:', error);
                                                                // Reverter em caso de erro
                                                                setExistingTags(prev => ({
                                                                    ...prev,
                                                                    [tagName]: { ...prev[tagName], color: existingTags[tagName].color }
                                                                }));
                                                            }
                                                        }}
                                                        className="w-6 h-6 rounded border border-slate-600 cursor-pointer"
                                                        title={`Alterar cor da tag ${tagName}`}
                                                    />
                                                </div>
                                                <span className="text-slate-200 font-medium">{tagName}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input 
                                                        type="checkbox" 
                                                        className="accent-blue-600" 
                                                        checked={tagInfo.active} 
                                                        onChange={async (e) => {
                                                            const checked = e.target.checked;
                                                            try {
                                                                // Atualizar estado local imediatamente
                                                                setExistingTags(prev => ({
                                                                    ...prev,
                                                                    [tagName]: { ...prev[tagName], active: checked }
                                                                }));
                                                                
                                                                // Atualizar no banco de dados
                                                                await changeItemState({ 
                                                                    id: tagName, 
                                                                    type: "filtros/tags", 
                                                                    state: checked 
                                                                });
                                                            } catch (error) {
                                                                console.error('Erro ao alterar estado da tag:', error);
                                                                // Reverter mudança em caso de erro
                                                                setExistingTags(prev => ({
                                                                    ...prev,
                                                                    [tagName]: { ...prev[tagName], active: !checked }
                                                                }));
                                                            }
                                                        }} 
                                                    />
                                                    <span className={tagInfo.active ? "text-green-500" : "text-red-500"}>
                                                        {tagInfo.active ? "Ativa" : "Inativa"}
                                                    </span>
                                                </label>
                                                
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Tem certeza que deseja deletar a tag "${tagName}"?`)) {
                                                            try {
                                                                await deleteItem({ id: tagName, type: "filtros/tags" });
                                                                // Remover da lista local
                                                                const newTags = { ...existingTags };
                                                                delete newTags[tagName];
                                                                setExistingTags(newTags);
                                                                console.log(`Tag "${tagName}" deletada com sucesso`);
                                                            } catch (error) {
                                                                console.error('Erro ao deletar tag:', error);
                                                                alert('Erro ao deletar tag. Tente novamente.');
                                                            }
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition border border-red-700"
                                                    title={`Deletar tag ${tagName}`}
                                                >
                                                    Deletar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Lista de fornecedores existentes */}
                        {modalType === "fornecedor" && Object.keys(existingSuppliers).length > 0 && (
                            <div className="mt-6 border-t border-slate-700 pt-4">
                                <h3 className="text-lg font-semibold mb-3 text-slate-300">Fornecedores Existentes</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto bg-black rounded-md border border-slate-700 p-2 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-700">
                                    {Object.entries(existingSuppliers).map(([supplierName, supplierInfo]) => (
                                        <div key={supplierName} className="flex items-center justify-between p-3 bg-slate-800 rounded-md border border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <span className="text-slate-200 font-medium">{supplierName}</span>
                                                <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                                                    {supplierInfo.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input 
                                                        type="checkbox" 
                                                        className="accent-blue-600" 
                                                        checked={supplierInfo.active} 
                                                        onChange={async (e) => {
                                                            const checked = e.target.checked;
                                                            try {
                                                                // Atualizar estado local imediatamente
                                                                setExistingSuppliers(prev => ({
                                                                    ...prev,
                                                                    [supplierName]: { ...prev[supplierName], active: checked }
                                                                }));
                                                                
                                                                // Atualizar no banco de dados
                                                                await changeItemState({ 
                                                                    id: supplierName, 
                                                                    type: "filtros/suppliers", 
                                                                    state: checked 
                                                                });
                                                            } catch (error) {
                                                                console.error('Erro ao alterar estado do fornecedor:', error);
                                                                // Reverter mudança em caso de erro
                                                                setExistingSuppliers(prev => ({
                                                                    ...prev,
                                                                    [supplierName]: { ...prev[supplierName], active: !checked }
                                                                }));
                                                            }
                                                        }} 
                                                    />
                                                    <span className={supplierInfo.active ? "text-green-500" : "text-red-500"}>
                                                        {supplierInfo.active ? "Ativo" : "Inativo"}
                                                    </span>
                                                </label>
                                                
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Tem certeza que deseja deletar o fornecedor "${supplierName}"?`)) {
                                                            try {
                                                                await deleteItem({ id: supplierName, type: "filtros/suppliers" });
                                                                // Remover da lista local
                                                                const newSuppliers = { ...existingSuppliers };
                                                                delete newSuppliers[supplierName];
                                                                setExistingSuppliers(newSuppliers);
                                                                console.log(`Fornecedor "${supplierName}" deletado com sucesso`);
                                                            } catch (error) {
                                                                console.error('Erro ao deletar fornecedor:', error);
                                                                alert('Erro ao deletar fornecedor. Tente novamente.');
                                                            }
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition border border-red-700"
                                                    title={`Deletar fornecedor ${supplierName}`}
                                                >
                                                    Deletar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Botão para fechar modal */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => showModal(false)}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="w-full pt-10 p-6 flex flex-col gap-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-b-2xl shadow-2xl border border-slate-700">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-blue-300">Painel do Editor</h1>
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={async () => { showModal(true); setModalType("categoria"); await searchCategories()}} className="bg-purple-800 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded transition border border-purple-800 shadow">
                            + Nova Categoria
                        </button>
                        <button onClick={async () => { showModal(true); setModalType("subcategoria"); await searchCategories()}} className="bg-indigo-800 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded transition border border-indigo-800 shadow">
                            + Nova Subcategoria
                        </button>
                        <button onClick={async () => { showModal(true); setModalType("fornecedor"); await searchSuppliers()}} className="bg-blue-800 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition border border-blue-800 shadow">
                            + Novo Fornecedor
                        </button>
                        <button onClick={async () => { showModal(true); setModalType("tags"); await searchTags()}} className="bg-blue-800 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition border border-blue-800 shadow">
                            + Nova Tag
                        </button>
                        <a href="/editor/criar" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition border border-green-800 shadow">
                            + Novo Produto
                        </a>
                    </div>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input type="text" placeholder="Buscar..." className="rounded-md h-12 w-full border border-slate-700 bg-slate-800 text-slate-100 px-3 placeholder:text-slate-500 focus:outline-blue-400" />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md h-12 px-5 border border-blue-900 shadow">Consultar</button>
                        <button className="bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-md h-12 px-5 border border-slate-700 shadow">Filtros</button>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-3 gap-2">
                        <button onClick={() => setSelected(1)} className={`rounded-md h-12 border ${selected === 1 ? "bg-blue-600/80 text-white border-blue-900" : "bg-slate-800 text-slate-200 border-slate-700"} hover:scale-[0.99] duration-150`}>Produtos</button>
                        <button onClick={() => setSelected(2)} className={`rounded-md h-12 border ${selected === 2 ? "bg-blue-600/80 text-white border-blue-900" : "bg-slate-800 text-slate-200 border-slate-700"} hover:scale-[0.99] duration-150`}>Categorias</button>
                        <button onClick={() => setSelected(3)} className={`rounded-md h-12 border ${selected === 3 ? "bg-blue-600/80 text-white border-blue-900" : "bg-slate-800 text-slate-200 border-slate-700"} hover:scale-[0.99] duration-150`}>Subcategorias</button>
                    </div>
                </div>
            </div>

            <section className="min-h-15 mt-6 overflow-x-auto">
                <div className="hidden md:grid md:grid-cols-6 items-center rounded-md border border-slate-700 bg-slate-900/60 text-slate-200">
                    <div className="col-span-2 p-3 md:border-r border-slate-700"><h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">Título</h2></div>
                    <div className="col-span-1 p-3 md:border-r border-slate-700"><h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">{selected === 3 ? "Categoria" : "Código"}</h2></div>
                    <div className="col-span-2 p-3 md:border-r border-slate-700"><h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">Imagem</h2></div>
                    <div className="col-span-1 p-3 text-center"><h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">Ações</h2></div>
                </div>

                {loading ? (
                    <div className="mt-4 grid gap-3">
                        <div className="h-16 rounded-md border border-slate-700 bg-slate-800 animate-pulse" />
                        <div className="h-16 rounded-md border border-slate-700 bg-slate-800 animate-pulse" />
                        <div className="h-16 rounded-md border border-slate-700 bg-slate-800 animate-pulse" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="mt-6 text-center text-slate-400">Nenhum resultado encontrado</div>
                ) : (
                    <div className="mt-3 grid gap-3">
                        {items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-6 items-start md:items-center gap-2 md:gap-0 rounded-md border border-slate-700 bg-slate-800/60 text-slate-100">
                                <div className="md:col-span-2 p-3 md:border-r border-slate-700">
                                    <span className="md:hidden block text-xs text-slate-400 mb-1">Título</span>
                                    {item.title ?? item.id}
                                </div>
                                <div className="md:col-span-1 p-3 md:border-r border-slate-700">
                                    <span className="md:hidden block text-xs text-slate-400 mb-1">{selected === 3 ? "Categoria" : "Código"}</span>
                                    {selected === 3 ? item.category : item.id || "— "}
                                </div>
                                <div className="md:col-span-2 p-3 md:border-r border-slate-700">
                                    <span className="md:hidden block text-xs text-slate-400 mb-1">Imagem</span>
                                    {selected === 1 && item.img ? (
                                        <img src={item.img} alt="Preview" className="w-16 h-16 object-cover rounded" />
                                    ) : "—"}
                                </div>
                                <div className="md:col-span-1 p-3 flex-grow md:flex-row items-start md:items-center justify-start md:justify-center gap-2">

                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className="accent-blue-600" checked={item.active} onChange={(e) => {
                                            const checked = e.target.checked;

                                            setItems(prev =>
                                                prev.map(p => p.id === item.id ? { ...p, active: checked } : p)
                                            );

                                            if (selected == 1) {
                                                changeItemState({ id: item.id, type: "produtos", state: checked })
                                                    .catch(() => {
                                                        setItems(prev =>
                                                            prev.map(p => p.id === item.id ? { ...p, active: !checked } : p)
                                                        );
                                                    });
                                            } else if (selected == 2) {
                                                if (item.id) {
                                                    console.log("Categoria:::", item);
                                                    console.log("Categoria", item.id);
                                                    changeItemState({ id: item.id, type: "categorias", state: checked })
                                                        .catch(() => {
                                                            setItems(prev =>
                                                                prev.map(p => p.id === item.id ? { ...p, active: !checked } : p)
                                                            );
                                                        });
                                                }
                                            } else {
                                                changeItemState({ id: item.id, type: "subcategorias", state: checked })
                                                    .catch(() => {
                                                        setItems(prev =>
                                                            prev.map(p => p.id === item.id ? { ...p, active: !checked } : p)
                                                        );
                                                    });
                                            }
                                        }} />
                                        <span>
                                            Produto <span className={item.active ? "text-green-500" : "text-red-500"}>{item.active ? "ativo" : "desativado"}</span>
                                        </span>
                                    </label>

                                    <div className="flex gap-2 md:ml-2">
                                        <button
                                            onClick={() => handleEdit(item.id || '')}
                                            className="h-8 rounded bg-green-600 hover:bg-green-700 text-white px-3 text-sm border border-green-900"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                const itemName = item.title || item.id;
                                                if (confirm(`Tem certeza que deseja deletar ${selected === 1 ? 'o produto' : selected === 2 ? 'a categoria' : 'a subcategoria'} "${itemName}"?`)) {
                                                    try {
                                                        let type = "";
                                                        if (selected === 1) type = "produtos";
                                                        else if (selected === 2) type = "categorias";
                                                        else type = "subcategorias";
                                                        
                                                        await deleteItem({ id: item.id || item.title || "", type });
                                                        
                                                        // Remover da lista local
                                                        setItems(prev => prev.filter(p => p.id !== item.id && p.title !== item.title));
                                                        
                                                        console.log(`${selected === 1 ? 'Produto' : selected === 2 ? 'Categoria' : 'Subcategoria'} "${itemName}" deletado com sucesso`);
                                                    } catch (error) {
                                                        console.error('Erro ao deletar item:', error);
                                                        alert('Erro ao deletar item. Tente novamente.');
                                                    }
                                                }
                                            }}
                                            className="h-8 rounded bg-red-600 hover:bg-red-700 text-white px-3 text-sm border border-red-900 transition"
                                        >
                                            Excluir
                                        </button>
                                        
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}