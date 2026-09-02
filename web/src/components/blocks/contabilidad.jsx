import { useEffect, useState } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import Searcher from '../pageComponents/searcher';
import { format } from 'date-fns';
import TrackedLink from '@components/blocks/boton'

export default function Contabilidad() {
    const [contabilidad, setContabilidad] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState(null);
    const [openSubjects, setOpenSubjects] = useState({});
    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

     const showData = async () => {
        const response = await api.get('/archivos/contabilidad')
        setContabilidad(response.data)
    }

    useEffect(() => {
        showData()
    }, []);

    const getPrimaryTema = (archivo) => {
        const temas = archivo.temas ?? [];
        const parentTema = temas.find(t => !t.parent_id);
        return parentTema?.titulo ?? temas[0]?.titulo ?? 'Sin tema';
    }

    const getSubtema = (archivo) => {
        const temas = archivo.temas ?? [];
        const subtema = temas.find(t => t.parent_id);
        return subtema?.titulo ?? null;
    }

    const filteredPosts = !searchTerm 
        ? contabilidad 
        : contabilidad.filter(post => {
            const term = searchTerm.toLowerCase();
            if (post.titulo?.toLowerCase().includes(term)) return true;
            if (post.archivo?.toLowerCase().includes(term)) return true;
            if (post.temas?.some(t => t.titulo?.toLowerCase().includes(term))) return true;
            return false;
        });

    const years = [...new Set(
        filteredPosts.map(a => format(new Date(a.fecha), 'yyyy'))
    )].sort((a, b) => b - a);

    useEffect(() => {
        if (years.length > 0 && !years.includes(activeTab)) {
            setActiveTab(years[0]);
        }
    }, [years.join(',')]);

    const postsByYear = filteredPosts.filter(a =>
        format(new Date(a.fecha), 'yyyy') === activeTab
    );

    const groupedBySubject = postsByYear.reduce((grupos, contabilidad) => {
    const tema = getPrimaryTema(contabilidad);
        if (!grupos[tema]) grupos[tema] = [];
        grupos[tema].push(contabilidad);
        return grupos;
    }, {});   

    const normalizeTema = (tema) =>
        tema
            ?.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase() ?? '';

    const subjectOrder = {
        'informacion contable': 0,
        'informacion presupuestal': 1,
        'informacion programatica': 2,
        'anexos': 3,
        'ley de disciplina': 4,
    };

    const subjects = Object.keys(groupedBySubject).sort((a, b) => {
        const orderA = subjectOrder[normalizeTema(a)] ?? 999;
        const orderB = subjectOrder[normalizeTema(b)] ?? 999;

        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });

    const endOffset = itemOffset + itemsPerPage;
    const currentSubjects = subjects.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(subjects.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % subjects.length;
        setItemOffset(newOffset);
    };

    const toggleSubject = (tema) => {
        setOpenSubjects(prev => ({ ...prev, [tema]: !prev[tema] }));
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm, activeTab]);

    return (
        <div>
            <div>
           
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="¿Qué archivo quieres buscar?" />
            
            <div className='mx-auto px-2 container my-15'>
                <div className="flex gap-2 mb-5">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => { setActiveTab(year); setItemOffset(0); } }
                                className={`px-10 py-3 cursor-pointer rounded-3xl border font-extrabold text-28 transition-colors flex-shrink-0 snap-start min-w-[120px] ${activeTab === year
                                        ? 'bg-etiqueta-sec text-tertiary border-tertiary'
                                        : 'bg-etiqueta-ter text-titulo border border-titulo hover:border-tertiary hover:text-tertiary hover:bg-etiqueta-sec'}`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
                
                <div className='border-card rounded-2xl p-5'>
                    {currentSubjects.length === 0 && (
                        <p>No hay resultados.</p>
                    )}

                    {currentSubjects.map((tema) => {
                        const items = groupedBySubject[tema];
                        const isOpen = openSubjects[tema] ?? false;

                        return (
                            <div key={tema} className='bg-card rounded-2xl mb-4 p-4'>
                                <button
                                    onClick={() => toggleSubject(tema)}
                                    className="w-full flex justify-between items-center px-4 py-3 text-left text-28 text-primary font-extrabold"
                                >
                                    <span>{tema}</span>
                                    <span className="flex items-center gap-8">
                                        <span className="bg-etiqueta-sec text-tertiary border border-tertiary font-bold px-5 py-2 rounded-2xl text-22">
                                            {items.length}
                                        </span>
                                        <div className='col-span-1 bg-white shadow-lg h-[25px] w-[25px] rounded-full flex items-center justify-center transition-shadow duration-300 hover:shadow-xl'>
                                            <span className={`line-md--chevron-down text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></span>
                                        </div>
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="px-4 pb-3 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {items.map((contabilidad) => (
                                                <div key={contabilidad.id} className='bg-white border border-card rounded-2xl p-5 group bg-etiqueta-sec hover:border-tertiary group'>
                                                    <div className='flex'>
                                                        <TrackedLink to={contabilidad.archivo} className="" target="_blank" rel="noopener noreferrer">
                                                            <div className="col-span-1  group-hover:bg-tertiary group-hover:rounded-full w-[32px] h-[32px] p-1 flex items-center justify-center">
                                                                <span className="material-symbols--download group-hover:bg-white!"></span>
                                                            </div> 
                                                        </TrackedLink>

                                                        <p className='ml-5 text-22 text-titulo group-hover:text-tertiary'>{contabilidad.titulo}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    </div>
                </div>
                                          
            </div>
                               
        </div>
    )
}