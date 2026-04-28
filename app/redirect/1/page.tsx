'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RedirectPage() {
    const nomePagina = "Ultra-freezers"
    const path = "/produtos/Ultrafreezers"
    const router = useRouter();

    useEffect(() => {
    router.push(path);
    }, [router])


    return (
        <main className="w-full h-screen bg-slate-700 flex justify-center items-center">
            <h1 className="text-white font-bold">Redirecionando para {nomePagina}...</h1>

        </main>
    )
}