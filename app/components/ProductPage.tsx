import Button from "@/app/components/Button";
import { useState, useEffect } from "react";
import { useQuote } from "@/app/hooks/useQuote";
import { useRouter } from "next/navigation";
import { sanitizeHtml } from "@/lib/htmlSanitizer";
import { getTagsWithColors } from "@/lib/databaseFunctions";
import ProductStructuredData from "@/app/components/ProductStructuredData";

export default function ProductsPage({ productId, description, imageUrl, price, tags, supplier, video, technicalInfo, title, subtitle }: { productId: string, description: string, imageUrl: string, price: number, tags: string | string[], supplier: string, video: string, technicalInfo: string, title: string, subtitle: string }) {
    const { addProduct } = useQuote();
    const router = useRouter();
    const [tagColors, setTagColors] = useState<{[key: string]: string}>({});

    // carregar cores das tags do banco de dados
    useEffect(() => {
        const loadTagColors = async () => {
            try {
                const tagsWithColors = await getTagsWithColors();
                const colorsMap: {[key: string]: string} = {};
                
                tagsWithColors.forEach(tag => {
                    if (tag.active) {
                        colorsMap[tag.title] = tag.color;
                    }
                });
                
                setTagColors(colorsMap);
            } catch (error) {
                // erro silencioso
            }
        };

        loadTagColors();
    }, []);

    const handleQuoteRequest = () => {
        // adicionar produto à cotação
        addProduct({
            id: productId,
            title: title,
            subtitle: subtitle,
            supplier: supplier,
            imageUrl: imageUrl,
            description: description,
            price: price,
            productUrl: typeof window !== 'undefined' ? window.location.href : ''
        });

        // redirecionar para página de orçamento
        router.push('/orcamento');
    };

    // função para obter a cor de uma tag
    const getTagColor = (tagName: string): string => {
        return tagColors[tagName] || '#3B82F6'; // cor padrão
    };

    // cria cor mais escura para o texto
    const getDarkerColor = (hexColor: string): string => {
        // converte hex para RGB
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // reduz brilho em 30%
        const darkerR = Math.max(0, Math.floor(r * 0.7));
        const darkerG = Math.max(0, Math.floor(g * 0.7));
        const darkerB = Math.max(0, Math.floor(b * 0.7));
        
        // converte de volta para hex
        return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
    };

    return (
        <div className="w-full min-h-screen py-4 sm:py-6 md:py-10 px-4 sm:px-6 md:px-10 flex flex-col">
            {/* dados estruturados para SEO */}
            <ProductStructuredData 
                product={{
                    id: productId,
                    title: title,
                    subtitle: subtitle,
                    description: description,
                    imageUrl: imageUrl,
                    price: price,
                    supplier: supplier
                }}
            />
            {/* hero com glow radial e borda gradiente */}
            <div className="relative w-full">
                <div className="pointer-events-none absolute -inset-x-12 sm:-inset-x-16 md:-inset-x-24 -top-12 sm:-top-16 md:-top-24 h-40 sm:h-48 md:h-60 -z-10 bg-gradient-to-r from-sky-300/25 via-cyan-200/20 to-sky-300/25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]" />
                <div className="rounded-2xl sm:rounded-3xl shadow-2xl ring-1 ring-slate-200 bg-gradient-to-b from-sky-50/80 to-white p-[1px]">
                    <div className="rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md p-4 sm:p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10">
                            {/* imagem do produto */}
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-blue-100 bg-gradient-to-br from-blue-100/40 to-white">
                                    <img
                                        src={imageUrl}
                                        alt="Nao foi possivel carregar a imagem"
                                        className="object-contain w-full h-full"
                                        style={{ objectFit: "contain" }}
                                    />
                                </div>
                                <div className="flex gap-1 sm:gap-2 mt-3 sm:mt-4 flex-wrap justify-center">
                                    {(typeof tags === "string" ? tags.split(",").map(t => t.trim()) : tags).map((tag) => {
                                        const tagColor = getTagColor(tag);
                                        const textColor = getDarkerColor(tagColor);
                                        
                                        return (
                                            <span
                                                key={tag}
                                                className="h-fit px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shadow-sm hover:opacity-80 transition-all duration-300 cursor-pointer"
                                                style={{
                                                    backgroundColor: `${tagColor}20`, // 20 = 12.5% de opacidade
                                                    color: textColor,
                                                    border: `1px solid ${tagColor}40` // 40 = 25% de opacidade
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* detalhes do produto */}
                            <div className="flex-1 flex flex-col justify-between gap-4 sm:gap-6">
                                <div>
                                    <h2 className="text-sm sm:text-base md:text-lg text-blue-700 font-medium mb-2">
                                        Fornecido por <span className="font-bold">{supplier}</span>
                                    </h2>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-blue-900 mb-2 tracking-tight leading-tight">
                                        {title}
                                    </h1>
                                    <p className="text-base sm:text-lg text-slate-700 mb-4 leading-relaxed">{subtitle}</p>
                                    <div className="flex flex-col justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        {typeof price === "number" && (
                                            <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700">
                                                Preço: {price || "Sob consulta"}
                                            </span>
                                        )}
                                        <Button 
                                            title="Solicitar orçamento" 
                                            variant="primary" 
                                            size="md" 
                                            onClick={handleQuoteRequest}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Separador sutil entre capa e detalhes (sem texto) */}
            <div className="mt-6 sm:mt-8 md:mt-10 mb-2">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* Descrição detalhada e vídeo */}
            <div
                className={`mt-6 sm:mt-8 md:mt-12 p-4 sm:p-6 md:p-8 grid gap-6 sm:gap-8 md:gap-10`}
            >
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3 sm:mb-4">Descrição</h2>
                    <div
                        className="tiptap max-w-none text-sm sm:text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
                    />
                </div>
                {video && (
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3 sm:mb-4 w-full">Demonstração em vídeo</h2>
                        <div className="w-[80%] mx-auto">
                            <div className="relative w-full pb-[56.25%] h-0 rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full rounded-lg sm:rounded-xl"
                                    src={video}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Especificações técnicas */}
            {technicalInfo && (
            <div className="mt-6 sm:mt-8 md:mt-12 bg-white/80 rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-4 sm:mb-6">Especificações Técnicas</h2>
                <div
                    className="tiptap max-w-none text-sm sm:text-base leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(technicalInfo) }}
                    />
                </div>
            )}

            {/* Sticky action bar (mobile e desktop) */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 rounded-full bg-white/90 backdrop-blur-md shadow-xl ring-1 ring-slate-200 px-3 sm:px-4 py-2">
                <span className="text-xs sm:text-sm text-slate-600 font-medium truncate max-w-[50vw] sm:max-w-[40vw] hidden sm:block">{title}</span>
                <Button 
                    title="Solicitar orçamento" 
                    variant="primary" 
                    size="sm"
                    className="text-xs sm:text-sm px-3 sm:px-4 py-2"
                    onClick={handleQuoteRequest}
                />
            </div>
        </div>
    );
}
