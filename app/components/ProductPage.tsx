import Button from "@/app/components/Button";
import Image from "next/image";
import { useState, useEffect } from "react";
// import { quoteProduct } from "@/app/products/[[...slug]]/page";

export default function ProductsPage({ productId, description, imageUrl, price, tags, supplier, video, technicalInfo, title, subtitle }: { productId: string, description: string, imageUrl: string, price: number, tags: string | string[], supplier: string, video: string, technicalInfo: string, title: string, subtitle: string }) {
    return (
        <div className="w-full min-h-screen py-10 px-10 flex flex-col">
            {/* Hero com glow radial e borda gradiente */}
            <div className="relative w-full">
                <div className="pointer-events-none absolute -inset-x-24 -top-24 h-60 -z-10 bg-gradient-to-r from-sky-300/25 via-cyan-200/20 to-sky-300/25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]" />
                <div className="rounded-3xl shadow-2xl ring-1 ring-slate-200 bg-gradient-to-b from-sky-50/80 to-white p-[1px]">
                    <div className="rounded-3xl bg-white/80 backdrop-blur-md p-8">
                        <div className="flex flex-col md:flex-row gap-10">
                            {/* Imagem do produto */}
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-blue-100 bg-gradient-to-br from-blue-100/40 to-white">
                                    <Image
                                        src={imageUrl}
                                        alt={"Nao foi possivel carregar a imagem"}
                                        quality={100}
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
                                    <h2 className="text-lg text-blue-700 font-medium mb-2">
                                        Fornecido por <span className="font-bold">{supplier}</span>
                                    </h2>
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2 tracking-tight">
                                        {title}
                                    </h1>
                                    <p className="text-lg text-slate-700 mb-4">{subtitle}</p>
                                    <div className="flex flex-col justify-center gap-4 mb-6">
                                        {typeof price === "number" && (
                                            <span className="text-2xl font-bold text-blue-700">
                                                Preço: {price || "Sob consulta"}
                                            </span>
                                        )}
                                        <Button title="Solicitar orçamento" variant="primary" size="md" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Separador sutil entre capa e detalhes (sem texto) */}
            <div className="mt-10 mb-2">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* Descrição detalhada e vídeo */}
            <div
                className={`mt-12 p-8 grid gap-10 ${video ? "md:grid-cols-2" : "grid-cols-1"}`}
            >
                <div>
                    <h2 className="text-2xl font-bold text-blue-800 mb-4">Descrição</h2>
                    <div
                        className="tiptap prose prose-slate max-w-none text-base leading-relaxed prose-h1:text-sky-400 prose-h1:text-[2em] prose-h2:text-sky-500 prose-h2:text-[1.5em] prose-h3:text-sky-300 prose-h3:text-[1.2em] prose-h3:font-semibold"
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
            <div className="mt-12 bg-white/80 rounded-2xl shadow p-8">
                <h2 className="text-2xl font-bold text-blue-800 mb-6">Especificações Técnicas</h2>
                <div
                    className="tiptap prose prose-slate max-w-none text-base leading-relaxed prose-h1:text-sky-400 prose-h1:text-[2em] prose-h2:text-sky-500 prose-h2:text-[1.5em] prose-h3:text-sky-300 prose-h3:text-[1.2em] prose-h3:font-semibold"
                    dangerouslySetInnerHTML={{ __html: technicalInfo }}
                />
            </div>

            {/* Sticky action bar (desktop) */}
            <div className="hidden md:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-40 items-center gap-3 rounded-full bg-white/90 backdrop-blur-md shadow-xl ring-1 ring-slate-200 px-4 py-2">
                <span className="text-sm text-slate-600 font-medium truncate max-w-[40vw]">{title}</span>
                <Button title="Solicitar orçamento" variant="primary" size="md" />
            </div>
        </div>
    );
}
