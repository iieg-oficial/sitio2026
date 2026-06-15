import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';

export default function Flashes() {
    const [flashes, setFlashes] = useState([])
    const [lastFlash, setLastFlash] = useState(null)
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'desc_jal', 'desc_nac', 'periocidad', 'fuente'];
    const [activeTab, setActiveTab] = useState("Todos");

    const fetchFlashes = async () => {
        const response = await api.get('/flashes')
        setFlashes(response.data.flashes)
    }

    const fetchLastFlash = async () => {
        const response = await api.get('/flashes/last')
        setLastFlash(response.data[0] || null)
    }

    useEffect(() => {
        fetchFlashes()
        fetchLastFlash()
        console.log('Flashes fetched:', lastFlash)
    }, []);

    const filteredFlashes = !searchTerm 
        ? flashes 
        : flashes.filter(post => {
            return keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], post);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    const types = [...new Set(
        filteredFlashes.flatMap(post => post.temas?.map(tema => tema.titulo) || [])
    )].filter(Boolean).sort();

    const filteredFlashesByType = activeTab === "Todos"
        ? filteredFlashes
        : filteredFlashes.filter(post => post.temas?.some(tema => tema.titulo === activeTab));

        const [itemOffset, setItemOffset] = useState(0);
        const itemsPerPage = 12;

        const endOffset = itemOffset + itemsPerPage;
        const currentFlashes = filteredFlashesByType.slice(itemOffset, endOffset);
        const pageCount = Math.ceil(filteredFlashesByType.length / itemsPerPage);

        const handlePageClick = (event) => {
            const newOffset = (event.selected * itemsPerPage) % filteredFlashesByType.length;
            setItemOffset(newOffset);
        };

        useEffect(() => {
            setItemOffset(0);
        }, [searchTerm, activeTab]);

        const handleTabClick = (tab) => {
            setActiveTab(tab);
            setItemOffset(0);
        };

        useEffect(() => {
            setItemOffset(0);
        }, [searchTerm, activeTab]);

    return (
        <div>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder='¿qué quieres buscas?'/>
     
            {lastFlash && (
                <div className='bg-blue-100 border-2 border-blue-400 rounded-lg p-4 mb-4 h-96'>
                    <h3>Último Flash</h3>
                    <p>{lastFlash.titulo}</p>
                </div>
            )}
     
            
            <div className="flex gap-2 my-15 mx-auto container px-2">

                <button
                    onClick={() => { setActiveTab("Todos"); setItemOffset(0); }}
                    className={`px-10 py-3 cursor-pointer rounded-3xl border font-extrabold text-28 transition-colors flex-shrink-0 snap-start min-w-[120px] ${activeTab === "Todos"
                            ? 'bg-blue-bg-etiqueta-sec text-tertiary border-tertiary'
                            : 'bg-etiqueta-sec text-tertiary border-tertiary'
                    }`}
                >
                    Todos
                </button>
                {types.map(type => (
                    <button
                        key={type}
                        onClick={() => { setActiveTab(type); setItemOffset(0); } }
                        className={`px-10 py-3 cursor-pointer rounded-3xl border font-extrabold text-28 transition-colors flex-shrink-0 snap-start min-w-[120px] ${activeTab === type
                                ? 'bg-blue-bg-etiqueta-sec text-tertiary border-tertiary'
                                : 'bg-etiqueta-sec text-tertiary border-tertiary'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>


            {currentFlashes.map(flash => (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-pink-500 rounded-lg p-4' key={flash.id}>
                    <div className='md:col-span-2'><h3>{flash.titulo}</h3></div>
                    <div className='border-2 border-gray-200 rounded-lg p-4'>
                        <h3>Jalisco</h3>
                        <p>{flash.desc_jal}</p>
                    </div>
                    <div className='border-2 border-gray-200 rounded-lg p-4'>
                        <h3>Nacional</h3>
                        <p>{flash.desc_nac}</p>
                    </div>
                    <div className='md:col-span-2 border-2 border-gray-200 rounded-lg p-4'>
                        <p>periocidad: {flash.periocidad}</p>
                        <p>Link: {flash.link}</p>
                        <p>Fuente: {flash.fuente}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}