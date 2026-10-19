import { useEffect, useState, useCallback } from 'react'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';
import { format } from 'date-fns';
import TrackedLink from '@components/blocks/boton'

export default function Contabilidad() {
    const [contabilidad, setContabilidad] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState(null);
    const [openSubjects, setOpenSubjects] = useState({});
    const [itemOffset, setItemOffset] = useState(0);
    const [activeSubtema, setActiveSubtema] = useState({});
    const itemsPerPage = 12;

    const showData = useCallback(async () => {
        try {
            const response = await api.get('/archivos/contabilidad', {
                params: { _t: new Date().getTime() } // Parámetro anti-caché
            });
            const data = response.data || [];
            // Ordenar por ID descendente para colocar lo más reciente primero
            const sorted = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
            setContabilidad(sorted);
        } catch (error) {
            console.error('Error al cargar archivos de contabilidad:', error);
        }
    }, []);

    useEffect(() => {
        showData();

        // Escuchador de evento focus para reflejar cambios inmediatamente al volver a la pestaña
        const handleFocus = () => {
            showData();
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [showData]);

    const getPrimaryTema = (archivo) => {
        const temas = archivo.temas ?? [];
        if (temas.length === 0) return null;

        const temaPadre = temas.find((tema) => {
            const parentId = Number(tema?.parent_id ?? 0);
            return !tema?.parent_id || parentId === 0 || Number.isNaN(parentId);
        });

        return temaPadre ?? temas[0];
    }

    const getSubtema = (archivo) => {
        const temas = archivo.temas ?? [];
        const temaPadre = getPrimaryTema(archivo);
        if (!temaPadre) return [];

        return temas.filter((tema) => {
            if (!tema?.parent_id) return false;
            return Number(tema.parent_id) === Number(temaPadre.id);
        });
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
        filteredPosts.map(a => (a.fecha ? format(new Date(a.fecha), 'yyyy') : ''))
    )].filter(Boolean).sort((a, b) => b - a);

    useEffect(() => {
        if (years.length > 0 && !years.includes(activeTab)) {
            setActiveTab(years[0]);
        }
    }, [years.join(',')]);

    const postsByYear = filteredPosts.filter(a =>
        a.fecha && format(new Date(a.fecha), 'yyyy') === activeTab
    );

    const groupedBySubject = postsByYear.reduce((grupos, itemContabilidad) => {
        const tema = getPrimaryTema(itemContabilidad)?.titulo ?? 'Sin tema';
        if (!grupos[tema]) grupos[tema] = [];
        grupos[tema].push(itemContabilidad);
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
                    <div className="flex gap-2 mb-5 overflow-x-auto">
                        {years.map(year => (
                            <button
                                key={year}
                                onClick={() => { setActiveTab(year); setItemOffset(0); }}
                                className={`px-10 py-3 cursor-pointer rounded-3xl border font-garet-bold text-28 transition-colors flex-shrink-0 snap-start min-w-[120px] ${activeTab === year
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

                            const groupedBySubtema = items.reduce((grupos, archivo) => {
                                const subtemas = getSubtema(archivo);
                                const subtema = subtemas[0]?.titulo ?? 'Sin subtema';

                                if (!grupos[subtema]) grupos[subtema] = [];
                                grupos[subtema].push(archivo);
                                return grupos;
                            }, {});

                            const subtemas = Object.keys(groupedBySubtema);
                            const selectedSubtema = activeSubtema[tema] ?? subtemas[0] ?? null;

                            return (
                                <div key={tema} className='bg-card rounded-2xl mb-4 p-4'>
                                    <button
                                        onClick={() => toggleSubject(tema)}
                                        className="w-full flex justify-between items-center px-4 py-3 text-left text-28 text-primary font-garet-extra cursor-pointer"
                                    >
                                        <span className="">{tema}</span>
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
                                            {subtemas.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {subtemas.map((subtema) => (
                                                        <button
                                                            key={subtema}
                                                            type="button"
                                                            onClick={() => setActiveSubtema(prev => ({ ...prev, [tema]: subtema }))}
                                                            className={`px-4 py-2 rounded-full border font-bold text-18 transition-colors cursor-pointer ${selectedSubtema === subtema
                                                                ? 'bg-[#FFF2E5] text-tertiary border-tertiary'
                                                                : 'bg-[#F3EAFF] text-primary border-primary hover:border-tertiary hover:text-tertiary hover:bg-[#FFF2E5]'
                                                                }`}
                                                        >
                                                            {subtema}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {selectedSubtema && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {(groupedBySubtema[selectedSubtema] || []).map((archivo) => (
                                                        <TrackedLink
                                                            key={archivo.id}
                                                            to={archivo.archivo}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <div className='bg-white border border-card rounded-2xl p-5 group bg-etiqueta-sec hover:border-tertiary'>
                                                                <div className='flex'>
                                                                    <div className="col-span-1 group-hover:bg-tertiary bg-[#FF83004D] rounded-full w-[32px] h-[32px] p-1 flex items-center justify-center">
                                                                        <span className="material-symbols--download group-hover:bg-white!"></span>
                                                                    </div>
                                                                    <p className='ml-5 text-22 text-titulo group-hover:text-tertiary'>{archivo.titulo}</p>
                                                                </div>
                                                            </div>
                                                        </TrackedLink>
                                                    ))}
                                                </div>
                                            )}
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