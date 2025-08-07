import Image from "next/image";
import Link from "next/link";
import { verusData } from "@/public/data/meta/verusData";


export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <Image
                                src="/assets/logo.png"
                                alt="Verus Científica Logo"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <h3 className="text-xl font-bold">{verusData.title}</h3>
                        </div>
                        <p className="text-gray-300 mb-4 leading-relaxed">
                            Especialistas em fornecer soluções completas para laboratórios,
                            oferecendo equipamentos de última geração e produtos de alta qualidade.
                        </p>
                        <div className="flex space-x-4">
                            {/* Instagram */}
                            <a href="https://www.instagram.com/veruscientifica/" className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                                </svg>
                            </a>
                            {/* LinkedIn */}
                            {/* <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a> */}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/produtos" className="text-gray-300 hover:text-white transition-colors">
                                    Produtos
                                </Link>
                            </li>
                            <li>
                                <Link href="/#sobre" className="text-gray-300 hover:text-white transition-colors">
                                    Sobre Nós
                                </Link>
                            </li>
                            <li>
                                <Link href="/orcamento" className="text-gray-300 hover:text-white transition-colors">
                                    Contato
                                </Link>
                            </li>
                            <li>
                                <Link href="/#linhas" className="text-gray-300 hover:text-white transition-colors">
                                    Nossas Linhas
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contato</h4>
                        <div className="space-y-2 text-gray-300">
                            <p>📧 {verusData.email_principal || "contato@veruscientifica.com.br"}</p>
                            <p>📞 {verusData.telefone_principal || "(11) 99999-9999"}</p>
                            <p>📍 {verusData.adr || "São Paulo, SP - Brasil"}</p>
                        </div>
                    </div>
                </div>

                {/* Google Maps */}
                <div className="mt-12">
                    <h4 className="text-lg font-semibold mb-4 text-center">Nossa Localização</h4>
                    <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55398.38576440502!2d-51.197853479642255!3d-29.795012000000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x951968eda5d3a201%3A0x5eaff8cfc4e39f47!2sUniversidade%20do%20Vale%20do%20Rio%20dos%20Sinos%20-%20Campus%20S%C3%A3o%20Leopoldo!5e0!3m2!1spt-BR!2sbr!4v1751922683033!5m2!1spt-BR!2sbr" width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Localização da Verus Científica"
                        ></iframe>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 {verusData.title}. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
