import { useEffect, useState } from 'react';
import api from '@services/apiService';
import Searcher from '../pageComponents/searcher';
import { format } from 'date-fns';
import TrackedLink from '@components/blocks/boton';

export default function Archivo() {
    const [archivos, setArchivos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(null);
    const [openSubjects, setOpenSubjects] = useState({});
    const [activeSubtema, setActiveSubtema] = useState({});
    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;

    const showData = async () => {
        const response = await api.get('/archivos/institucionales');
        setArchivos(response.data);
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        showData();
    }, []);

    const normalizeText = (text) =>
        text
            ?.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim() ?? '';

    const getTemaPadre = (archivo) => {
        const temas = archivo.temas ?? [];
        if (temas.length === 0) return null;

        const temaPadre = temas.find((tema) => {
            const parentId = Number(tema?.parent_id ?? 0);
            return !tema?.parent_id || parentId === 0 || Number.isNaN(parentId);
        });

        return temaPadre ?? temas[0];
    };

    const getSubtemasDelTemaPadre = (archivo, temaPadre) => {
        const temas = archivo.temas ?? [];
        if (!temaPadre) return [];

        return temas.filter((tema) => {
            if (!tema?.parent_id) return false;
            return Number(tema.parent_id) === Number(temaPadre.id);
        });
    };

    const filteredPosts = !searchTerm
        ? archivos
        : archivos.filter(post => {
            const term = searchTerm.toLowerCase();
            if (post.titulo?.toLowerCase().includes(term)) return true;
            if (post.archivo?.toLowerCase().includes(term)) return true;
            if (post.temas?.some(t => t.titulo?.toLowerCase().includes(term))) return true;
            return false;
        });

    const years = [...new Set(
        filteredPosts.map(a => format(new Date(a.fecha), 'yyyy'))
    )].sort((a, b) => b - a);

    const effectiveActiveYear = activeTab ?? years[0] ?? null;
    const postsByYear = effectiveActiveYear
        ? filteredPosts.filter(a => format(new Date(a.fecha), 'yyyy') === effectiveActiveYear)
        : [];

    const groupedBySubject = postsByYear.reduce((grupos, archivo) => {
        const temaPadre = getTemaPadre(archivo);
        const clave = temaPadre?.titulo ?? 'Sin tema';

        if (!grupos[clave]) grupos[clave] = [];
        grupos[clave].push(archivo);
        return grupos;
    }, {});

    const subjectOrder = {
        'instrumentos de control y consulta archivistica': 0,
        'planeacion y normatividad archivistica institucional': 1,
        'grupo interdisciplinario de archivos': 2,
    };

    const subjects = Object.keys(groupedBySubject).sort((a, b) => {
        const orderA = subjectOrder[normalizeText(a)] ?? 999;
        const orderB = subjectOrder[normalizeText(b)] ?? 999;

        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });

    const endOffset = itemOffset + itemsPerPage;
    const currentSubjects = subjects.slice(itemOffset, endOffset);

    const toggleSubject = (tema) => {
        setOpenSubjects(prev => ({ ...prev, [tema]: !prev[tema] }));
    };

    const handleYearChange = (year) => {
        setActiveTab(year);
        setItemOffset(0);
    };

    return (
        <div>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="¿Qué archivo quieres buscar?" />

            <div className='mx-auto px-2 container my-15'>
                <div className="flex gap-2 mb-5 overflow-x-auto">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => handleYearChange(year)}
                            className={`px-10 py-3 cursor-pointer rounded-3xl border font-extrabold text-28 transition-colors flex-shrink-0 snap-start min-w-[120px] ${effectiveActiveYear === year
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
                            const temaPadre = getTemaPadre(archivo);
                            const subtemas = getSubtemasDelTemaPadre(archivo, temaPadre);
                            const subtema = subtemas[0]?.titulo ?? 'Sin subtema';

                            if (!grupos[subtema]) grupos[subtema] = [];
                            grupos[subtema].push(archivo);
                            return grupos;
                        }, {});

                        const subtemas = Object.keys(groupedBySubtema);
                        const selectedSubtema = activeSubtema[tema] ?? subtemas[0] ?? null;
                        const temaNormalized = normalizeText(tema);

                        const obtenerNombreSubtema = (subtema, temaPadreNorm) => {
                            if (temaPadreNorm.includes('planeacion y normatividad')) {
                                return null;
                            }

                            if (temaPadreNorm.includes('grupo interdisciplinario')) {
                                return (subtema && subtema !== 'Sin subtema') ? subtema : 'Reglas de operación';
                            }

                            if (temaPadreNorm.includes('instrumentos de control')) {
                                return (subtema && subtema !== 'Sin subtema') ? subtema : 'Gestión archivística';
                            }

                            if (subtema === 'Sin subtema') {
                                return null;
                            }

                            return subtema;
                        };

                        const esPlaneacion = temaNormalized.includes('planeacion y normatividad');

                        return (
                            <div key={tema} className='bg-card rounded-2xl mb-4 p-4'>
                                <button
                                    onClick={() => toggleSubject(tema)}
                                    className="w-full flex justify-between items-center px-4 py-3 text-left text-28 text-primary font-extrabold cursor-pointer"
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
                                        {esPlaneacion ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {items.map((archivo) => (
                                                    <TrackedLink to={archivo.archivo} target="_blank" rel="noopener noreferrer">
                                                    <div key={archivo.id} className='bg-white border border-card rounded-2xl p-5 group bg-etiqueta-sec hover:border-tertiary'>
                                                        <div className='flex'>
                                                            
                                                                <div className="col-span-1 group-hover:bg-tertiary group-hover:rounded-full w-[32px] h-[32px] p-1 flex items-center justify-center">
                                                                    <span className="material-symbols--download group-hover:bg-white!"></span>
                                                                </div>
                                                            
                                                            <p className='ml-5 text-22 text-titulo group-hover:text-tertiary'>{archivo.titulo}</p>
                                                        </div>
                                                    </div>
                                                    </TrackedLink>
                                                ))}
                                            </div>
                                        ) : (
                                            <>
                                                {subtemas.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {subtemas.map((subtema) => {
                                                            const isActive = selectedSubtema === subtema;
                                                            const textoBoton = obtenerNombreSubtema(subtema, temaNormalized);

                                                            if (!textoBoton) return null;

                                                            return (
                                                                <button
                                                                    key={subtema}
                                                                    type="button"
                                                                    onClick={() => setActiveSubtema(prev => ({ ...prev, [tema]: subtema }))}
                                                                    className={`px-4 py-2 rounded-full border font-bold text-18 transition-colors cursor-pointer ${
                                                                        isActive
                                                                            ? 'bg-[#FFF2E5] text-tertiary border-tertiary'
                                                                            : 'bg-[#F3EAFF] text-primary border-primary hover:border-tertiary hover:text-tertiary'
                                                                    }`}
                                                                >
                                                                    {textoBoton}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {selectedSubtema && (() => {
                                                    const tituloSeccion = obtenerNombreSubtema(selectedSubtema, temaNormalized);

                                                    return (
                                                        <div>
                                                            {tituloSeccion && (
                                                                <div className='mb-3 text-20 font-bold text-primary'>
                                                                    {tituloSeccion}
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {(groupedBySubtema[selectedSubtema] || []).map((archivo) => (
                                                                    <TrackedLink to={archivo.archivo} target="_blank" rel="noopener noreferrer">
                                                                    <div key={archivo.id} className='bg-white border border-card rounded-2xl p-5 group bg-etiqueta-sec hover:border-tertiary'>
                                                                        <div className='flex'>
                                                                            
                                                                                <div className="col-span-1 group-hover:bg-tertiary group-hover:rounded-full w-[32px] h-[32px] p-1 flex items-center justify-center">
                                                                                    <span className="material-symbols--download group-hover:bg-white!"></span>
                                                                                </div>
                                                                            
                                                                            <p className='ml-5 text-22 text-titulo group-hover:text-tertiary'>{archivo.titulo}</p>
                                                                        </div>
                                                                    </div>
                                                                    </TrackedLink>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}