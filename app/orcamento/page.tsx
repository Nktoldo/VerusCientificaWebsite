'use client';
import { useState, useEffect } from 'react';
import { verusData } from "@/public/data/meta/verusData";
import NavBar from '../components/NavBar';
import { useQuote } from '../hooks/useQuote';

export default function OrcamentoPage() {
    const { products, removeProduct, clearProducts, isLoaded } = useQuote();
    const [primeiraCompra, setPrimeiraCompra] = useState(true);
    const [tipoPessoa, setTipoPessoa] = useState('Fisica');
    const [formData, setFormData] = useState({
        tipoPessoa: 'Fisica',
        primeiraCompra: "Sim",
        nome: '',
        dataNascimento: '',
        empresa: '',
        cpf: '',
        cnpj: '',
        telefone: '',
        email: '',
        cargo: '',
        departamento: '',
        predio: '',
        laboratorio: '',
        estado: '',
        cep: '',
        endereco: "",
        numeroComplemento: "",
        cidade: '',
        mensagem: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showProductReminder, setShowProductReminder] = useState(false);

    // funções para auto-save
    const saveFormData = (data: typeof formData) => {
        try {
            localStorage.setItem('orcamentoFormData', JSON.stringify(data));
        } catch (error) {
        }
    };

    const loadFormData = () => {
        try {
            const savedData = localStorage.getItem('orcamentoFormData');
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
        }
        return null;
    };

    const clearSavedFormData = () => {
        try {
            localStorage.removeItem('orcamentoFormData');
        } catch (error) {
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value
        };
        setFormData(newFormData);
        // auto-save após cada mudança
        saveFormData(newFormData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/orcamento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    products
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSubmitSuccess(true);
                clearProducts();
                // limpar dados salvos após envio bem-sucedido
                clearSavedFormData();
                setFormData({
                    tipoPessoa: "Fisica",
                    primeiraCompra: "Sim",
                    nome: '',
                    empresa: '',
                    cpf: '',
                    cnpj: '',
                    telefone: '',
                    email: '',
                    dataNascimento: '',
                    cargo: '',
                    departamento: '',
                    predio: '',
                    laboratorio: '',
                    cep: '',
                    endereco: "",
                    numeroComplemento: "",
                    estado: '',
                    cidade: '',
                    mensagem: ''
                });
            } else {
                alert('Erro ao enviar orçamento. Tente novamente.');
            }
        } catch (error) {
            alert('Erro ao enviar orçamento. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSwitchChange = (campo: string, valor: string) => {
        const newFormData = { ...formData, [campo]: valor };
        setFormData(newFormData);
        saveFormData(newFormData);
    }

    const formatPhone = (value: string) => {
        const phone = value.replace(/\D/g, '');
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    const handleCloseReminder = () => {
        setShowProductReminder(false);
        localStorage.setItem('hasSeenProductReminder', 'true');
    };

    // carregar dados salvos quando o componente for montado
    useEffect(() => {
        const savedData = loadFormData();
        if (savedData) {
            setFormData(savedData);
        }
    }, []);

    useEffect(() => {
        if (submitSuccess) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [submitSuccess]);

    // mostrar popup de lembrete quando houver produtos no carrinho
    useEffect(() => {
        if (isLoaded && products.length > 0) {
            const hasSeenReminder = localStorage.getItem('hasSeenProductReminder');
            if (!hasSeenReminder) {
                setShowProductReminder(true);
            }
        }
    }, [isLoaded, products.length]);

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-white mb-4">Orçamento Enviado!</h2>
                    <p className="text-blue-100 mb-6">
                        Seu orçamento foi enviado com sucesso. Nossa equipe entrará em contato em breve.
                    </p>
                    <button
                        onClick={() => setSubmitSuccess(false)}
                        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Enviar Novo Orçamento
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 relative overflow-hidden">
            <NavBar />

            {/* popup de lembrete de produto */}
            {showProductReminder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 animate-in fade-in-0 zoom-in-95 duration-300">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🛒</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Lembre-se de Especificar o Produto!
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Você tem <strong>{products.length}</strong> produto{products.length > 1 ? 's' : ''} no seu carrinho.
                                Para um orçamento mais preciso, não esqueça de especificar detalhes como:
                            </p>
                            <ul className="text-left text-gray-600 mb-6 space-y-2">
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">•</span>
                                    Quantidade desejada
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">•</span>
                                    Especificações técnicas
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">•</span>
                                    Prazo de entrega
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-500">•</span>
                                    Outros detalhes relevantes
                                </li>
                            </ul>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseReminder}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Entendi!
                                </button>
                                <button
                                    onClick={() => {
                                        setShowProductReminder(false);
                                        // não marcar como visto para mostrar novamente se necessário
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Lembrar depois
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 text-4xl animate-bounce">📧</div>
                <div className="absolute top-20 right-20 text-3xl animate-pulse">📋</div>
                <div className="absolute bottom-20 left-20 text-3xl animate-bounce">💼</div>
                <div className="absolute bottom-10 right-10 text-4xl animate-pulse">📞</div>
                <div className="absolute top-1/2 left-1/4 text-2xl animate-bounce">📝</div>
                <div className="absolute top-1/3 right-1/4 text-3xl animate-pulse">🎯</div>
            </div>

            {/* geometric patterns */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-32 h-32 border-2 border-white rotate-45"></div>
                <div className="absolute top-20 right-0 w-24 h-24 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-0 left-1/4 w-40 h-40 border-2 border-white transform rotate-12"></div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen py-12">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-6xl w-full mx-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Solicitar Orçamento
                        </h1>
                        <p className="text-blue-100 text-lg mb-2">
                            Preencha o formulário abaixo e nossa equipe entrará em contato em breve
                        </p>
                        <p className="text-blue-200 text-sm">
                            * Campos obrigatórios
                        </p>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* lista de produtos - design mais clean */}
                        <div className="space-y-6">
                            {!isLoaded ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                                    <p className="text-blue-200 mt-2">Carregando...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <></>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-white">
                                            Produtos Selecionados
                                        </h2>
                                        {products.length > 0 && (
                                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                {products.length}
                                            </span>
                                        )}
                                    </div>
                                    {products.map((product) => (
                                        <div key={product.id} className="group bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all duration-200">
                                            <div className="flex gap-3 items-start">
                                                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white/10 flex-shrink-0">
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.title}
                                                        className="object-contain w-full h-full"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-white text-sm leading-tight mb-1 line-clamp-2">
                                                        {product.title}
                                                    </h3>
                                                    <p className="text-xs text-blue-200 mb-1 line-clamp-1">
                                                        {product.subtitle}
                                                    </p>
                                                    <p className="text-xs text-blue-300">
                                                        {product.supplier}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeProduct(product.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-200 text-sm p-1"
                                                    title="Remover produto"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <a
                                        href="https://www.veruscientifica.com.br/produtos"
                                        className="inline-flex items-center gap-2 text-blue-300 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-blue-300 hover:decoration-white underline-offset-2"
                                    >
                                        <span>+</span>
                                        Adicionar mais produtos
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* formulário */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    { /* Tipo pessoa */}
                                    <div>
                                        <label htmlFor="tipoPessoa" className="block text-white font-semibold mb-2">Tipo de Pessoa *</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTipoPessoa("Fisica")
                                                    handleSwitchChange("tipoPessoa", "Fisica");
                                                }}
                                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${tipoPessoa === "Fisica"
                                                    ? "bg-slate-900 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                            >
                                                Pessoa Física
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTipoPessoa("Juridica");
                                                    handleSwitchChange("tipoPessoa", "Juridica");
                                                }}
                                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${tipoPessoa === "Juridica"
                                                    ? "bg-slate-900 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                            >
                                                Pessoa Jurídica
                                            </button>
                                        </div>
                                    </div>

                                    { /* Tipo pessoa */}
                                    <div>
                                        <label htmlFor="primeiraCompra" className="block text-white font-semibold mb-2">Primeira Compra?</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPrimeiraCompra(true);
                                                    handleSwitchChange("primeiraCompra", "Sim");
                                                }}
                                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${primeiraCompra === true
                                                    ? "bg-green-900 text-white"
                                                    : "bg-white text-gray-700 hover:bg-gray-200"
                                                    }`}
                                            >
                                                Sim
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPrimeiraCompra(false);
                                                    handleSwitchChange("primeiraCompra", "Não");
                                                }}
                                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${primeiraCompra === false
                                                    ? "bg-red-900 text-white"
                                                    : "bg-white text-gray-700 hover:bg-gray-200"
                                                    }`}
                                            >
                                                Não
                                            </button>
                                        </div>
                                    </div>

                                    {/* Nome */}
                                    <div>
                                        <label htmlFor="nome" className="block text-white font-semibold mb-2">
                                            Nome *
                                        </label>
                                        <input
                                            type="text"
                                            id="nome"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                            placeholder="Digite seu nome completo"
                                        />
                                    </div>

                                    {/* CPF */}
                                    {tipoPessoa == "Fisica" && (
                                        <div>
                                            <label htmlFor="cpf" className="block text-white font-semibold mb-2">
                                                CPF *
                                            </label>
                                            <input
                                                type="text"
                                                id="cpf"
                                                name="cpf"
                                                value={formData.cpf}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                                placeholder="000.000.000-00"
                                                maxLength={14}
                                            />
                                        </div>
                                    )}
                                    {/* CNPJ */}
                                    {tipoPessoa == "Juridica" && (
                                        <div>
                                            <label htmlFor="cnpj" className="block text-white font-semibold mb-2">
                                                CNPJ *
                                            </label>
                                            <input
                                                type="text"
                                                id="cnpj"
                                                name="cnpj"
                                                value={formData.cnpj}
                                                onChange={handleInputChange}
                                                required
                                                maxLength={18}
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                                placeholder="00.000.000/0000-00"
                                            />
                                        </div>
                                    )}


                                    {/* telefone */}
                                    <div>
                                        <label htmlFor="telefone" className="block text-white font-semibold mb-2">
                                            Telefone *
                                        </label>
                                        <input
                                            type="tel"
                                            id="telefone"
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={(e) => {
                                                const formatted = formatPhone(e.target.value);
                                                const newFormData = { ...formData, telefone: formatted };
                                                setFormData(newFormData);
                                                saveFormData(newFormData);
                                            }}
                                            required
                                            maxLength={15}
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>

                                    {/* data nascimento */}
                                    {(tipoPessoa == "Fisica" && primeiraCompra == true) && (
                                    <div>
                                        <label htmlFor="dataNascimento" className="block text-white font-semibold mb-2">
                                            Data de nascimento *
                                        </label>
                                        <input
                                            type="date"
                                            id="dataNascimento"
                                            name="dataNascimento"
                                            value={formData.dataNascimento}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                        placeholder="DD/MM/AAAA"
                                        />
                                    </div>
                                    )}

                                    {/* email */}
                                    <div>
                                        <label htmlFor="email" className="block text-white font-semibold mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                            placeholder="seu@email.com"
                                        />
                                    </div>

                                    {/* empresa */}
                                    <div>
                                        <label htmlFor="empresa" className="block text-white font-semibold mb-2">
                                            Empresa *
                                        </label>
                                        <input
                                            type="text"
                                            id="empresa"
                                            name="empresa"
                                            value={formData.empresa}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                            placeholder="Nome da sua empresa"
                                        />
                                    </div>

                                    {/* informações necessarias somente na primeira compra */}
                                    {/* cargo */}
                                    {primeiraCompra == true && (
                                        <div>
                                            <label htmlFor="cargo" className="block text-white font-semibold mb-2">
                                                Cargo *
                                            </label>
                                            <input
                                                type="text"
                                                id="cargo"
                                                name="cargo"
                                                value={formData.cargo}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                                placeholder="Seu cargo na empresa"
                                            />
                                        </div>
                                    )}

                                    {/* departamento */}
                                    {primeiraCompra == true && (
                                        <div>
                                            <label htmlFor="departamento" className="block text-white font-semibold mb-2">
                                                Departamento *
                                            </label>
                                            <input
                                                type="text"
                                                id="departamento"
                                                name="departamento"
                                                value={formData.departamento}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                                placeholder="Nome do departamento"
                                            />
                                        </div>
                                    )}

                                    {/* prédio */}
                                    {primeiraCompra == true && (
                                        <div>
                                            <label htmlFor="predio" className="block text-white font-semibold mb-2">
                                                Prédio
                                            </label>
                                            <input
                                                type="text"
                                                id="predio"
                                                name="predio"
                                                value={formData.predio}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                                placeholder="Nome ou número do prédio"
                                            />
                                        </div>
                                    )}

                                    {/* laboratório/sala */}
                                    {primeiraCompra == true && (
                                        <div>
                                            <label htmlFor="laboratorio" className="block text-white font-semibold mb-2">
                                                Laboratório/Sala
                                            </label>
                                            <input
                                                type="text"
                                                id="laboratorio"
                                                name="laboratorio"
                                                value={formData.laboratorio}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                                placeholder="Nome ou número da sala/laboratório"
                                            />
                                        </div>
                                    )}

                                    {/* CEP */}
                                    {primeiraCompra == true && (
                                        <div>
                                            <label htmlFor="cep" className="block text-white font-semibold mb-2">
                                                CEP *
                                            </label>
                                            <input
                                                type="text"
                                                id="cep"
                                                name="cep"
                                                maxLength={9}
                                                minLength={8}
                                                value={formData.cep}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                                placeholder="00000-000"
                                            />
                                        </div>
                                    )}

                                    {/* estado */}
                                    {primeiraCompra == true && (
                                        <div>
                                            <label htmlFor="estado" className="block text-white font-semibold mb-2">
                                                Estado *
                                            </label>
                                            <select
                                                id="estado"
                                                name="estado"
                                                value={formData.estado}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                            >
                                                <option value="" className="text-gray-800">Selecione o estado</option>
                                                <option value="AC" className="text-gray-800">Acre</option>
                                                <option value="AL" className="text-gray-800">Alagoas</option>
                                                <option value="AP" className="text-gray-800">Amapá</option>
                                                <option value="AM" className="text-gray-800">Amazonas</option>
                                                <option value="BA" className="text-gray-800">Bahia</option>
                                                <option value="CE" className="text-gray-800">Ceará</option>
                                                <option value="DF" className="text-gray-800">Distrito Federal</option>
                                                <option value="ES" className="text-gray-800">Espírito Santo</option>
                                                <option value="GO" className="text-gray-800">Goiás</option>
                                                <option value="MA" className="text-gray-800">Maranhão</option>
                                                <option value="MT" className="text-gray-800">Mato Grosso</option>
                                                <option value="MS" className="text-gray-800">Mato Grosso do Sul</option>
                                                <option value="MG" className="text-gray-800">Minas Gerais</option>
                                                <option value="PA" className="text-gray-800">Pará</option>
                                                <option value="PB" className="text-gray-800">Paraíba</option>
                                                <option value="PR" className="text-gray-800">Paraná</option>
                                                <option value="PE" className="text-gray-800">Pernambuco</option>
                                                <option value="PI" className="text-gray-800">Piauí</option>
                                                <option value="RJ" className="text-gray-800">Rio de Janeiro</option>
                                                <option value="RN" className="text-gray-800">Rio Grande do Norte</option>
                                                <option value="RS" className="text-gray-800">Rio Grande do Sul</option>
                                                <option value="RO" className="text-gray-800">Rondônia</option>
                                                <option value="RR" className="text-gray-800">Roraima</option>
                                                <option value="SC" className="text-gray-800">Santa Catarina</option>
                                                <option value="SP" className="text-gray-800">São Paulo</option>
                                                <option value="SE" className="text-gray-800">Sergipe</option>
                                                <option value="TO" className="text-gray-800">Tocantins</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* cidade */}
                                    {primeiraCompra == true && (
                                        <div>
                                            <label htmlFor="cidade" className="block text-white font-semibold mb-2">
                                                Cidade *
                                            </label>
                                            <input
                                                type="text"
                                                id="cidade"
                                                name="cidade"
                                                value={formData.cidade}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                                placeholder="Nome da cidade"
                                            />
                                        </div>
                                    )}

                                    {/* endereco */}
                                    {primeiraCompra == true && (
                                        <div>
                                            <label htmlFor="endereco" className="block text-white font-semibold mb-2">
                                                Endereço *
                                            </label>
                                            <input
                                                type="text"
                                                id="endereco"
                                                name="endereco"
                                                value={formData.endereco}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                                placeholder="Endereço completo (rua, número, complemento)"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* mensagem */}
                                <div>
                                    <label htmlFor="mensagem" className="block text-white font-semibold mb-2">
                                        Detalhes do Orçamento *
                                    </label>
                                    <textarea
                                        id="mensagem"
                                        name="mensagem"
                                        value={formData.mensagem}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none"
                                        placeholder="Descreva os equipamentos ou produtos que você precisa, especificações técnicas, quantidade, prazo de entrega desejado e qualquer outra informação relevante para o orçamento..."
                                    />
                                </div>

                                {/* submit button */}
                                <div className="text-center pt-4 space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${isSubmitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                                                Enviando...
                                            </div>
                                        ) : (
                                            'Enviar Orçamento'
                                        )}
                                    </button>

                                    {/* botão para limpar dados salvos */}
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
                                                    clearSavedFormData();
                                                    setFormData({
                                                        tipoPessoa: 'Fisica',
                                                        primeiraCompra: "Sim",
                                                        nome: '',
                                                        empresa: '',
                                                        cpf: '',
                                                        cnpj: '',
                                                        telefone: '',
                                                        email: '',
                                                        dataNascimento: '',
                                                        cargo: '',
                                                        departamento: '',
                                                        cep: '',
                                                        endereco: "",
                                                        numeroComplemento: "",
                                                        predio: '',
                                                        laboratorio: '',
                                                        estado: '',
                                                        cidade: '',
                                                        mensagem: ''
                                                    });
                                                }
                                            }}
                                            className="text-blue-300 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-blue-300 hover:decoration-white underline-offset-2"
                                        >
                                            Limpar formulário
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-8 pt-6 border-t border-white/20 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl text-blue-400">💬</span>
                            <span className="text-lg font-bold text-white drop-shadow">Prefere falar diretamente conosco?</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center text-base mt-2">
                            <a
                                href={`mailto:${verusData.email_principal || "contato@veruscientifica.com.br"}`}
                                className="flex items-center gap-2 bg-blue-700/80 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
                            >
                                <span>📧</span>
                                <span>{verusData.email_principal || "contato@veruscientifica.com.br"}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
