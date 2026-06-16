import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
        <div className='px-2'>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder='¿qué quieres buscas?'/>
     
            {lastFlash && (
                <div className='rounded-2xl p-5 lg:p-14 mb-4 mx-auto container bg-[#F5F5F5] mt-15'>
                    <h3 className='text-28 text-primary'>{lastFlash.titulo}</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
                        <div className='bg-white rounded-2xl p-8'>
                            <h4>Jalisco</h4>
                            <div dangerouslySetInnerHTML={{__html: lastFlash.desc_jal}} className='mt-5 prose max-w-none' />
                        </div>
                        <div className='bg-white rounded-2xl p-6'>
                            <h4>Nacional</h4>
                            <div dangerouslySetInnerHTML={{__html: lastFlash.desc_nac}} className='mt-5 prose max-w-none' />
                        </div>
                        <div className='md:col-span-2 flex gap-4 flex-wrap mt-5'>
                            <p className='bg-[#F5F5F5] text-body rounded-2xl px-4 py-2 text-14'>{lastFlash.periocidad}</p>
                            <p className='bg-[#D1D1D1] text-body rounded-2xl px-4 py-2 text-14'>{format(new Date(lastFlash.fecha_publicacion), "d 'de' MMMM 'de' yyyy", { locale: es })}</p> 
                            <p className='bg-[#E5E0E0] text-body rounded-2xl px-4 py-2 text-14'>{lastFlash.fuente}</p>
                        </div>
                    </div>
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
                <div className='rounded-2xl p-5 lg:p-14 mb-4 mx-auto container bg-[#F5F5F5] mt-15'>
                    <h3 className='text-28 text-primary'>{flash.titulo}</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
                        <div className='bg-white rounded-2xl p-8'>
                            <h4>Jalisco</h4>
                            <div dangerouslySetInnerHTML={{__html: flash.desc_jal}} className='mt-5 prose max-w-none' />
                        </div>
                        <div className='bg-white rounded-2xl p-6'>
                            <h4>Nacional</h4>
                            <div dangerouslySetInnerHTML={{__html: flash.desc_nac}} className='mt-5 prose max-w-none' />
                        </div>
                        <div className='md:col-span-2 flex gap-4 flex-wrap mt-5'>
                            <p className='bg-[#F5F5F5] text-body rounded-2xl px-4 py-2 text-14'>{flash.periocidad}</p>
                            <p className='bg-[#D1D1D1] text-body rounded-2xl px-4 py-2 text-14'>{format(new Date(flash.fecha_publicacion), "d 'de' MMMM 'de' yyyy", { locale: es })}</p> 
                            <p className='bg-[#E5E0E0] text-body rounded-2xl px-4 py-2 text-14'>{flash.fuente}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}