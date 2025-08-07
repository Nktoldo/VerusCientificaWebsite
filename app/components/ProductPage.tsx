import Button from "@/app/components/Button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { quoteProduct } from "@/app/products/[[...slug]]/page";

export default function ProductsPage({ productId, description, imageUrl, price, tags, supplier, video, technicalInfo, title, subtitle }: { productId: string, description: string, imageUrl: string, price: number, tags: string | string[], supplier: string, video: string, technicalInfo: string, title: string, subtitle: string }) {
    console.log("passou aqui")
    console.log(productId, description, imageUrl, price, tags, supplier, video, technicalInfo, title, subtitle)
    return (
        <>
            <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-10 px-2">
                <div className="max-w-6xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row gap-10">
                    {/* Imagem do produto */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-blue-100 bg-gradient-to-br from-blue-100/40 to-white">
                                <Image
                                    src={imageUrl}
                                    alt={"Nao foi possivel carregar a imagem"}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                        </div>
                        <div className="flex gap-2 mt-4 flex-wrap">
                            {(typeof tags === "string" ? tags.split(",").map(t => t.trim()) : tags).map((tag) => (
                                <span
                                    key={tag}
                                    className="h-fit px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shadow-sm hover:bg-blue-200 hover:text-blue-800 transition-all duration-300 cursor-pointer"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Detalhes do produto */}
                    <div className="flex-1 flex flex-col justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2 tracking-tight">
                                {title}
                            </h1>
                            <h2 className="text-lg text-blue-700 font-medium mb-2">
                                Fornecido por <span className="font-bold">{supplier}</span>
                            </h2>
                            <p className="text-lg text-slate-700 mb-4">{subtitle}</p>
                            <div className="flex items-center gap-4 mb-6">
                                {typeof price === "number" && (
                                    <span className="text-2xl font-bold text-blue-700">
                                        R$ {Number(price).toLocaleString("pt-BR")}
                                    </span>
                                )}
                                <Button title="Solicitar orçamento" variant="primary" size="md" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-blue-800 mb-2">Principais Características</h3>
                            <div className="text-slate-600 text-base break-words">
                                {/* {typeof technicalInfo === 'string' && technicalInfo}
                                {typeof technicalInfo === 'object' && technicalInfo !== null && !Array.isArray(technicalInfo) && JSON.stringify(technicalInfo)}
                                {Array.isArray(technicalInfo) && JSON.stringify(technicalInfo)} */}
                                <p>[ver]</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Descrição detalhada e vídeo */}
                <div
                    className={`max-w-6xl mx-auto mt-12 grid gap-10 ${
                        video ? "md:grid-cols-2" : "grid-cols-1"
                    }`}
                >
                    <div>
                        <h2 className="text-2xl font-bold text-blue-800 mb-4">Descrição Completa</h2>
                        <div 
                            className="tiptap text-base text-slate-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    </div>
                    {video && (
                        <div>
                            <h2 className="text-2xl font-bold text-blue-800 mb-4">Demonstração em vídeo</h2>
                            <div className="relative w-full pb-[56.25%] h-0 rounded-xl overflow-hidden shadow-lg">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full rounded-xl"
                                    src={video}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                ></iframe>
                            </div>
                        </div>
                    )}
                </div>

                {/* Especificações técnicas */}
                <div className="max-w-6xl mx-auto mt-12 bg-white/80 rounded-2xl shadow p-8">
                    <h2 className="text-2xl font-bold text-blue-800 mb-6">Especificações Técnicas</h2>
                    <div 
                            className="tiptap text-base text-slate-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: technicalInfo }}
                        />
                    
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                        <div className="flex items-center gap-2 bg-blue-50 rounded p-2">
                            <span className="font-semibold text-blue-700">Capacidade:</span>
                            <span>500 mL</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 rounded p-2">
                            <span className="font-semibold text-blue-700">Material:</span>
                            <span>Aço inox</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 rounded p-2">
                            <span className="font-semibold text-blue-700">Voltagem:</span>
                            <span>110V/220V</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 rounded p-2">
                            <span className="font-semibold text-blue-700">Potência:</span>
                            <span>100W</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 rounded p-2">
                            <span className="font-semibold text-blue-700">Dimensões:</span>
                            <span>20 x 15 x 10 cm</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 rounded p-2">
                            <span className="font-semibold text-blue-700">Peso:</span>
                            <span>2.5 kg</span>
                        </div>
                    </div> */}
                </div>
            </div>
            <style jsx global>{`
                .tiptap h1 {
                    font-size: 2em;
                    color: #38bdf8;
                }

                .tiptap h2 {
                    font-size: 1.5em;
                    color: #0ea5e9;
                }

                .tiptap h3 {
                    font-size: 1.2em;
                    color: #7dd3fc;
                    font-weight: 600;
                }

                .tiptap .reference {
                    font-size: 0.95em;
                    color: #60a5fa;
                    font-style: italic;
                    border-left: 3px solid #60a5fa;
                    padding-left: 0.75em;
                    margin-top: 0.5em;
                }

                .tiptap table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin-top: 1.5rem;
                    margin-bottom: 1.5rem;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    border: 1px solid #e5e7eb;
                }

                .tiptap th, .tiptap td {
                    padding: 12px 16px;
                    text-align: left;
                    border-bottom: 1px solid #f3f4f6;
                }

                .tiptap th {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    font-weight: 600;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .tiptap td {
                    background-color: white;
                    color: #374151;
                    font-size: 0.875rem;
                }

                .tiptap tr:hover td {
                    background-color: #f8fafc;
                }

                .tiptap tr:last-child td {
                    border-bottom: none;
                }
            `}</style>
        </>
    );
}



