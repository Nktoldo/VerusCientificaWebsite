import Image from "next/image";

export default function ProductCardSquare({name, image, subtitle}: {name: string, image: string, subtitle: string}) {
    const hasImage = typeof image === 'string' && image.trim().length > 0;
    
    return(
        <div className="group relative w-64 min-w-[20rem] h-80 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 shadow-lg shadow-blue-500/10 border border-blue-200/40 hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 hover:-translate-y-2 transition-all duration-500 cursor-pointer">
            
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out z-10" />
            
            {/* Seção da imagem - QUADRADA com altura fixa */}
            <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                {hasImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Image 
                            src={image} 
                            alt={name} 
                            quality={95} 
                            width={200}
                            height={200}
                            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110" 
                            style={{
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-slate-500 text-xs font-medium">Sem imagem</span>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Separador elegante */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
            
            {/* Conteúdo do card */}
            <div className="flex-1 flex flex-col justify-center px-6 py-4 space-y-2 min-h-0">
                {/* Título do produto */}
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300 line-clamp-2 leading-tight">
                    {name}
                </h3>
                
                {/* Subtítulo */}
                <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-relaxed">
                    {subtitle}
                </p>
            </div>
            
            {/* Botão de ação no hover */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow duration-300">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
            
            {/* Badge de destaque */}
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 z-20">
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-full shadow-lg">
                    Ver Produto
                </span>
            </div>
            
            {/* Efeito de borda no hover */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-400/30 transition-colors duration-300" />
        </div>
    )
}
