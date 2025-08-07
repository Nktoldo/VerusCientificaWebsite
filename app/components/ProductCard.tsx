import Image from "next/image";

export default function ProductCard({name, image}: {name: string, image: string}) {
    return(
        <div className="aspect-[4/4] w-68 flex flex-col justify-center items-center bg-white/70 border border-blue-200/30 shadow-md rounded-lg font-bold text-blue-900 text-lg tracking-wide hover:scale-105 hover:shadow-lg duration-200 transition-all select-none">
            <Image src={image} alt={name} width={100} height={100} className="w-full h-full object-contain" />
            <div className="w-4/5 my-2 border-t border-blue-200/60 rounded-full" />
            <span className="px-4 py-2">{name}</span>
        </div>
    )
}