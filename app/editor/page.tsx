"use client"
import { buscarProdutos } from "@/lib/sendDataTest";
import { getCategories, getSubCategories } from "@/lib/sendDataTest";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { useState, useEffect } from "react";

type Item = { id?: string, title?: string, img?: string }

export default function editor() {
    // buscarProdutos()
    const [selected, setSelected] = useState<1 | 2 | 3>(1);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearchType = async () => {
        setLoading(true);
        try {
            switch (selected) {
                case 2:
                    let data = await getCategories();
                    console.log(data)
                    console.log((data ?? []).map((t) => ({ id: t, title: t })))
                    setItems((data ?? []).map((t) => ({ id: t, title: t })))
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen px-2">
            <div className="w-full h-30 px-2 py-4">
                <div className="w-full h-full shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-brightness-125 backdrop-contrast-125 backdrop-saturate-150 rounded-md bg-white grid grid-cols-5">
                    <div className="flex justify-around items-center col-span-3 gap-10 px-5">
                        <input type="text" placeholder="Search..." className="rounded-md h-12 w-full border-1 px-1" />
                        <button className="bg-blue-500 text-white shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-brightness-125 backdrop-contrast-125 backdrop-saturate-150 rounded-md py-3 px-5 duration-200 hover:scale-95">Consultar</button>
                        <button className="bg-green-500 text-white shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-brightness-125 backdrop-contrast-125 backdrop-saturate-150 rounded-md py-3 px-5 duration-200 hover:scale-95">Filtros</button>
                    </div>
                    <div className="col-span-2 flex justify-around flex-row items-center border-r-1">
                        <button onClick={async () => setSelected(1)} className={`shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-brightness-125 backdrop-contrast-125 backdrop-saturate-150 rounded-md ${selected == 1 ? "bg-blue-600/80 text-white" : "bg-white text-black"} p-3 duration-300 h-full w-full hover:scale-95`}>Produtos</button>
                        <button onClick={() => { setSelected(2); handleSearchType }} className={`shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-brightness-125 backdrop-contrast-125 backdrop-saturate-150 rounded-md ${selected == 2 ? "bg-blue-600/80 text-white" : "bg-white text-black"} p-3 duration-300 h-full w-full hover:scale-95`}>Categorias</button>
                        <button onClick={() => setSelected(3)} className={`shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-brightness-125 backdrop-contrast-125 backdrop-saturate-150 rounded-md ${selected == 3 ? "bg-blue-600/80 text-white" : "bg-white text-black"} p-3 duration-300 h-full w-full hover:scale-95`}>Subcategorias</button>
                    </div>
                </div>
            </div>

            <section className="border-1 min-h-15">
                <div className=" min-h-15 shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-brightness-125 backdrop-contrast-125 backdrop-saturate-150 rounded-md border-b-1 border-blue-400 col-span-5 duration-200  grid grid-cols-6">
                    <div className="border-r-1 col-span-2 flex justify-center items-center"><h1 className="text-2xl">Titulo do produto</h1></div>
                    <div className="border-r-1 col-span-1 flex justify-center items-center"><h1 className="text-2xl">Cod. Referencia</h1></div>
                    <div className="border-r-1 col-span-2 flex justify-center items-center"><h1 className="text-2xl">Foto</h1></div>
                    <div className=" col-span-1 p-3 flex flex-col gap-2 flex justify-center items-center"><h1 className="text-2xl">Menu edicao</h1></div>
                </div>

                <div className=" min-h-30 shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-brightness-125 backdrop-contrast-125 backdrop-saturate-150 rounded-md border-b-1 border-blue-400 col-span-5 duration-200  grid grid-cols-6">
                    <div className="border-r-1 col-span-2"></div>
                    <div className="border-r-1 col-span-1"></div>
                    <div className="border-r-1 col-span-2"></div>
                    <div className=" col-span-1 p-3 flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input type="checkbox" name="activated" id="activated" />
                            <label htmlFor="activated">Produto {true ? <span className="text-green-600">ativo</span> : <span className="text-red-600">desativado</span>}</label>
                        </div>
                        <div className="flex gap-3">
                            <button className=" h-8 rounded-sm bg-green-300 px-4 border-1 border-green-800 hover:scale-95 duration-200">Editar</button>
                            <button className=" h-8 rounded-sm bg-red-300 px-4 border-1 border-red-800">Excluir</button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div><p>Loading</p></div>
                ) : items.length === 0 ? (
                    <div><p>Nenhum Resultado encontrado</p></div>
                ) : (
                    items.map((cats) => (
                        <div className=" min-h-30 shadow-[0_4px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-brightness-125 backdrop-contrast-125 backdrop-saturate-150 rounded-md border-b-1 border-blue-400 col-span-5 duration-200  grid grid-cols-6">
                            <div className="border-r-1 col-span-5">{cats.id}</div>
                            <div className=" col-span-1 p-3 flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <input type="checkbox" name="activated" id="activated" />
                                    <label htmlFor="activated">Produto {true ? <span className="text-green-600">ativo</span> : <span className="text-red-600">desativado</span>}</label>
                                </div>
                                <div className="flex gap-3">
                                    <button className=" h-8 rounded-sm bg-green-300 px-4 border-1 border-green-800 hover:scale-95 duration-200">Editar</button>
                                    <button className=" h-8 rounded-sm bg-red-300 px-4 border-1 border-red-800">Excluir</button>
                                </div>
                            </div>
                        </div>
                    ))
                )
                }

            </section>
        </main>
    );
}