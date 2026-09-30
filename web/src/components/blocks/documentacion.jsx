import { useEffect, useMemo, useState, useCallback } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';
import TrackedLink from '@components/blocks/boton'
import Searcher from '../pageComponents/searcher';

export default function Documentacion() {
    const [documentaciones, setDocumentaciones] = useState([])
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTemaId, setSelectedTemaId] = useState("");
    const [selectedSubtemaId, setSelectedSubtemaId] = useState("");
    const [selectedTipo, setSelectedTipo] = useState("");
    const [selectedProyecto, setSelectedProyecto] = useState("");
    const keys = ['titulo', 'descripcion', 'claves', 'subject.titulo', 'temas.titulo'];

    const fetchDocumentaciones = useCallback(async (isMounted = true) => {
        try {
            // Se envía _t timestamp para bypass de caché
            const response = await api.get('/documentacion', {
                params: { _t: new Date().getTime() }
            });
            if (isMounted) {
                const data = Array.isArray(response.data)
                    ? response.data
                    : (response.data.documentaciones || []);
                setDocumentaciones(data);
            }
        } catch (error) {
            console.error("Error al cargar documentación:", error);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        
        // Carga inicial
        fetchDocumentaciones(isMounted);

        // Re-consultar la API automáticamente cuando el usuario regresa a la pestaña
        const handleFocus = () => fetchDocumentaciones(isMounted);
        window.addEventListener('focus', handleFocus);

        return () => {
            isMounted = false;
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchDocumentaciones]);

    const tipos = useMemo(() => (
        [...new Set(
            documentaciones
                .map(documentacion => documentacion.tipo)
                .filter(Boolean)
        )]
    ), [documentaciones]);

    const proyectos = useMemo(() => {
        const map = new Map();
        documentaciones.forEach(doc => {
            doc.sistemas?.forEach(proyecto => {
                if (!map.has(proyecto.id)) {
                    map.set(proyecto.id, proyecto)
                }
            })
        })
        return Array.from(map.values())
    }, [documentaciones]);

    const temas = useMemo(() => {
        const map = new Map();
        documentaciones.forEach(doc => {
            doc.temas?.filter(tema => !tema.parent_id).forEach(tema => {
                if (!map.has(tema.id)) {
                    map.set(tema.id, tema)
                }
            })
        })
        return Array.from(map.values())
    }, [documentaciones])

    const subtemas = useMemo(() => {
        if (!selectedTemaId) return []

        const map = new Map();
        documentaciones.forEach(doc => {
            doc.temas?.filter(tema => tema.parent_id === Number(selectedTemaId)).forEach(subtema => {
                if (!map.has(subtema.id)) {
                    map.set(subtema.id, subtema)
                }
            })
        })
        return Array.from(map.values())
    }, [documentaciones, selectedTemaId])

    const getValuesByPath = (obj, path) => {
        return path.split('.').reduce((current, part) => {
            if (current == null) return undefined
            if (Array.isArray(current)) {
                return current.flatMap(item => {
                    const value = item?.[part]
                    return value == null ? [] : Array.isArray(value) ? value : [value]
                })
            }
            return current[part]
        }, obj)
    }

    const filteredDocumentaciones = useMemo(() => {
        const normalizedSearch = searchTerm.toLowerCase().trim();

        const result = documentaciones.filter(post => {
            const matchesSearch = !normalizedSearch || keys.some(key => {
                const value = getValuesByPath(post, key);
                if (Array.isArray(value)) {
                    return value.some(item => item?.toString().toLowerCase().includes(normalizedSearch));
                }
                return value?.toString().toLowerCase().includes(normalizedSearch);
            });

            const matchesTema = !selectedTemaId || post.temas?.some(tema => !tema.parent_id && tema.id === Number(selectedTemaId));
            const matchesSubtema = !selectedSubtemaId || post.temas?.some(tema => tema.id === Number(selectedSubtemaId));
            const matchesTipo = !selectedTipo || post.tipo === selectedTipo;
            const matchesProyecto = !selectedProyecto || post.sistemas?.some(proyecto => proyecto.id === Number(selectedProyecto));

            return matchesSearch && matchesTema && matchesSubtema && matchesTipo && matchesProyecto;
        });

        // Ordenar de forma segura en JS: 1° Año (Mayor a Menor) -> 2° ID (Más nuevo al más viejo)
        return result.sort((a, b) => {
            const yearA = a.anyo ? parseInt(a.anyo, 10) : 0;
            const yearB = b.anyo ? parseInt(b.anyo, 10) : 0;

            if (yearB !== yearA) {
                return yearB - yearA;
            }

            return (b.id || 0) - (a.id || 0);
        });
    }, [documentaciones, searchTerm, selectedTemaId, selectedSubtemaId, selectedTipo, selectedProyecto]);

    const itemsPerPage = 12;
    const itemOffset = currentPage * itemsPerPage;
    const pageCount = Math.ceil(filteredDocumentaciones.length / itemsPerPage);

    const handlePageClick = (event) => {
         setCurrentPage(event.selected);
    };

    useEffect(() => {
    if (currentPage > 0 && currentPage >= pageCount) {
        setCurrentPage(0);
    }
    }, [pageCount, currentPage]);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, selectedTemaId, selectedSubtemaId, selectedTipo, selectedProyecto]);

    const currentItems = useMemo(() => (
        filteredDocumentaciones.slice(itemOffset, itemOffset + itemsPerPage)
    ), [filteredDocumentaciones, itemOffset]);

    const resetFilters = () => {
        setSelectedTemaId("")
        setSelectedSubtemaId("")
        setSelectedTipo("")
        setSelectedProyecto("")
    }

    const hasActiveFilter = Boolean(selectedTemaId || selectedSubtemaId || selectedTipo || selectedProyecto)

    return (
        <div>

            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="¿Qué quieres buscar?" />
            

            <div className='mx-auto px-2 container my-15'>
                <div className='flex flex-col lg:flex-wrap lg:flex-row gap-5 mb-5'>
                    
                        <div className=''>
                            <label className='block text-14 text-primary'>Tema</label>
                            <select
                                value={selectedTemaId}
                                onChange={(e) => {
                                    setSelectedTemaId(e.target.value)
                                    setSelectedSubtemaId("")
                                }}
                                className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                            >
                                <option value='' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Todos los temas</option>
                                {temas.map(tema => (
                                    <option key={tema.id} value={tema.id} className='w-full rounded-lg bg-card text-titulo px-4 py-2'>{tema.titulo}</option>
                                ))}
                            </select>
                        </div>

                        {selectedTemaId && subtemas.length > 0 && (
                            <div className=''>
                                <label className='block text-14 text-primary'>Subtema</label>
                                <select
                                    value={selectedSubtemaId}
                                    onChange={(e) => setSelectedSubtemaId(e.target.value)}
                                    className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                                >
                                    <option value='' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Todos los subtemas</option>
                                    {subtemas.map(subtema => (
                                        <option key={subtema.id} value={subtema.id} className='w-full rounded-lg bg-card text-titulo px-4 py-2'>{subtema.titulo}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className=''>
                            <label className='block text-14 text-primary'>Tipo de documento</label>
                            <select
                                value={selectedTipo}
                                onChange={(e) => setSelectedTipo(e.target.value)}
                                className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                            >
                                <option value='' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Todos</option>
                                {tipos.map(tipo => (
                                    <option key={tipo} value={tipo} className='w-full rounded-lg bg-card text-titulo px-4 py-2'>{tipo}</option>
                                ))}
                            </select>
                        </div>

                        <div className=''>
                            <label className='block text-14 text-primary'>Proyecto</label>
                            <select
                                value={selectedProyecto}
                                onChange={(e) => setSelectedProyecto(e.target.value)}
                                className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                            >
                                <option value='' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Todos</option>
                                {proyectos.map(proyecto => (
                                    <option key={proyecto.id} value={proyecto.id} className='w-full rounded-lg bg-card text-titulo px-4 py-2'>{proyecto.titulo}</option>
                                ))}
                            </select>
                        </div>
                    

                    {hasActiveFilter && (
                        <div className='flex items-end'>
                        <button
                            type='button'
                            onClick={resetFilters}
                            className='w-full rounded-lg border border-titulo bg-card px-4 py-2 text-sm text-titulo cursor-pointer hover:text-tertiary'
                        >
                            Limpiar filtros
                        </button>
                        </div>
                    )}
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mx-auto px-2 container my-15'>
                {currentItems.map(documentacion => (
                    <TrackedLink to={documentacion.archivo} className="" target="_blank" download key={documentacion.id}> 
                        <div className='rounded-2xl bg-card p-8 hover:border hover:border-tertiary group'>   
                            {documentacion.temas
                                .filter(tema => !tema.parent_id)
                                .map(tema => (
                                    <div key={tema.id}>
                                       {/* <span className='text-18'>{tema.titulo}</span>

                                        documentacion.temas
                                            .filter(subtema => subtema.parent_id === tema.id)
                                            .map(subtema => (
                                                <span key={subtema.id} className='text-16'> | {subtema.titulo}</span>
                                            ))
                                        */}
                                    </div>
                                ))
                            }
                            <div className='flex justify-between'>
                                <h3 className='text-titulos font-garet-bold text-18'>{documentacion.titulo}</h3>               
                                <div className="group-hover:bg-tertiary bg-[#FF83004D] rounded-full w-[32px] h-[32px] p-1">
                                    <span className="material-symbols--download group-hover:bg-white!"></span>
                                </div> 
                            </div>                                                        
                            <div className='flex flex-wrap gap-4 mt-10'>
                                {documentacion.tipo && (
                                    <span className='font-garet-bold text-tertiary text-[12px] capitalize border border-tertiary bg-etiqueta-sec p-2 rounded-xl'>{documentacion.tipo}</span>
                                )}
                                {documentacion.anyo && (
                                    <span className='font-garet-boldtext-primary text-[12px] capitalize border border-[#5C24724D] bg-[#F3EAFF] p-2 rounded-xl'>{documentacion.anyo}</span>
                                )}
                            </div>
                        </div>
                    </TrackedLink>
                ))}
            </div>

            {pageCount > 1 && (
                        <ReactPaginate
                            previousLabel={'<'}
                            nextLabel={'>'}
                            breakLabel={'...'}
                            pageCount={pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageClick}
                            containerClassName={'pagination'}
                            activeClassName={'active'}
                            forcePage={currentPage}
                        />
                    )}
        </div>
    )
}
