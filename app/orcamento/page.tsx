'use client';
import { useState, useEffect } from 'react';
import { verusData } from "@/public/data/meta/verusData";

export default function OrcamentoPage() {
    const [formData, setFormData] = useState({
        nome: '',
        empresa: '',
        telefone: '',
        email: '',
        cargo: '',
        departamento: '',
        predio: '',
        laboratorio: '',
        estado: '',
        cidade: '',
        mensagem: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                setSubmitSuccess(true);
                setFormData({
                    nome: '',
                    empresa: '',
                    telefone: '',
                    email: '',
                    cargo: '',
                    departamento: '',
                    predio: '',
                    laboratorio: '',
                    estado: '',
                    cidade: '',
                    mensagem: ''
                });
            } else {
                alert('Erro ao enviar orçamento. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar orçamento. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPhone = (value: string) => {
        const phone = value.replace(/\D/g, '');
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    useEffect(() => {
        if (submitSuccess) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [submitSuccess]);

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
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 text-4xl animate-bounce">📧</div>
                <div className="absolute top-20 right-20 text-3xl animate-pulse">📋</div>
                <div className="absolute bottom-20 left-20 text-3xl animate-bounce">💼</div>
                <div className="absolute bottom-10 right-10 text-4xl animate-pulse">📞</div>
                <div className="absolute top-1/2 left-1/4 text-2xl animate-bounce">📝</div>
                <div className="absolute top-1/3 right-1/4 text-3xl animate-pulse">🎯</div>
            </div>

            {/* Geometric Patterns */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-32 h-32 border-2 border-white rotate-45"></div>
                <div className="absolute top-20 right-0 w-24 h-24 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-0 left-1/4 w-40 h-40 border-2 border-white transform rotate-12"></div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen py-12">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-3xl w-full mx-4">
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            {/* Empresa */}
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

                            {/* Telefone */}
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
                                        setFormData(prev => ({ ...prev, telefone: formatted }));
                                    }}
                                    required
                                    maxLength={15}
                                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            {/* Email */}
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

                            {/* Cargo */}
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

                            {/* Departamento */}
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

                            {/* Prédio */}
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

                            {/* Laboratório/Sala */}
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

                            {/* Estado */}
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

                            {/* Cidade */}
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
                        </div>

                        {/* Mensagem */}
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

                        {/* Submit Button */}
                        <div className="text-center pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                                    isSubmitting
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
                        </div>
                    </form>

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