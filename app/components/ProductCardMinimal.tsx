import Image from "next/image";

export default function ProductCardMinimal({name, image, subtitle}: {name: string, image: string, subtitle: string}) {
    const hasImage = typeof image === 'string' && image.trim().length > 0;
    
    return(
        <div className="group relative aspect-square w-64 min-w-[16rem] overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-900/5 border border-gray-100 hover:shadow-2xl hover:shadow-gray-900/10 hover:scale-105 transition-all duration-700 cursor-pointer ">
            
            {/* Imagem do produto */}
            <div className="relative w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {hasImage ? (
                    <Image 
                        src={image} 
                        alt={name} 
                        quality={95} 
                        fill 
                        priority 
                        className="object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-2" 
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Conteúdo do card */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                    {name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                    {subtitle}
                </p>
            </div>
            
            {/* Ícone de ação */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    )
}
