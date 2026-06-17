import { useEffect, useMemo, useState } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate';

export default function Documentacion() {
    const [documentaciones, setDocumentaciones] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTemaId, setSelectedTemaId] = useState("");
    const [selectedSubtemaId, setSelectedSubtemaId] = useState("");
    const [selectedTipo, setSelectedTipo] = useState("");
    const keys = ['titulo', 'descripcion', 'claves', 'subject.titulo', 'temas.titulo'];

    const fetchDocumentaciones = async () => {
        const response = await api.get('/documentacion')
        setDocumentaciones(response.data.documentaciones)        
    }

    useEffect(() => {
        fetchDocumentaciones()
    }, []);

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

        return documentaciones.filter(post => {
            const matchesSearch = !normalizedSearch || keys.some(key => {
                const value = getValuesByPath(post, key)
                if (Array.isArray(value)) {
                    return value.some(item => item?.toString().toLowerCase().includes(normalizedSearch))
                }
                return value?.toString().toLowerCase().includes(normalizedSearch)
            });

            const matchesTema = !selectedTemaId || post.temas?.some(tema => !tema.parent_id && tema.id === Number(selectedTemaId));
            const matchesSubtema = !selectedSubtemaId || post.temas?.some(tema => tema.id === Number(selectedSubtemaId));
            const matchesTipo = !selectedTipo || post.tipo === selectedTipo;

            return matchesSearch && matchesTema && matchesSubtema && matchesTipo;
        })
    }, [documentaciones, searchTerm, selectedTemaId, selectedSubtemaId, selectedTipo])

    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 12;
    const pageCount = Math.ceil(filteredDocumentaciones.length / itemsPerPage);

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % Math.max(filteredDocumentaciones.length, 1);
        setItemOffset(newOffset);
    };

    useEffect(() => {
        setItemOffset(0);
    }, [searchTerm, selectedTemaId, selectedSubtemaId, selectedTipo]);

    const resetFilters = () => {
        setSelectedTemaId("")
        setSelectedSubtemaId("")
        setSelectedTipo("")
    }

    const hasActiveFilter = Boolean(selectedTemaId || selectedSubtemaId || selectedTipo)

    return (
        <div>

            <div className='mx-auto px-2 container my-15'>
                <div className='flex flex-col lg:flex-wrap lg:flex-row md:justify-between gap-5 mb-5'>
                    <div>
                        <label className='block text-14 text-primary'>Palabra clave</label>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Busca por ..."
                            className="w-full bg-transparent text-center border border-primary rounded-3xl px-4 py-2 text-titulo placeholder-titulo transition-all duration-200 outline-none focus-within:border-positivo focus-within:ring-1 focus-within:ring-positivo focus-within:ring-positivo"
                        />
                    </div>
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
                                <option value='Informes' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Informes</option>
                                <option value='Análisis estadísticos' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Análisis estadísticos</option>
                                <option value='Publicaciones institucionales' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Publicaciones institucionales</option>
                                <option value='Documentación de censos' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Documentación de censos</option>
                                <option value='Documentos normativos' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Documentos normativos</option>
                                <option value='Metodologia' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Metodología</option>
                                <option value='Código' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Código</option>
                                <option value='Manuales' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Manuales</option>
                                <option value='Guías' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Guías</option>
                                <option value='FAQs' className='w-full rounded-lg bg-card text-titulo px-4 py-2'>FAQs</option>
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
                {filteredDocumentaciones.map(documentacion => (
                    <div className='rounded-2xl bg-card p-8' key={documentacion.id}>   
                        {documentacion.temas
                            .filter(tema => !tema.parent_id)
                            .map(tema => (
                                <div key={tema.id}>
                                    <span className='text-22'>{tema.titulo}</span>

                                    {documentacion.temas
                                        .filter(subtema => subtema.parent_id === tema.id)
                                        .map(subtema => (
                                            <span key={subtema.id} className='text-16'> | {subtema.titulo}</span>
                                        ))
                                    }
                                </div>
                            ))
                        }
                        <h3 className='text-primary'>{documentacion.titulo}</h3>
                        <div dangerouslySetInnerHTML={{__html: documentacion.descripcion}} className='mt-5 prose max-w-none my-5' />                                                
                        <div className='flex flex-wrap gap-4'>
                            {documentacion.tipo && (
                                <span className='rounded-2xl bg-body text-white text-18 px-5 py-2'>{documentacion.tipo}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ReactPaginate
                previousLabel={"Ant"}
                nextLabel={"Sig"}
                breakLabel={"..."}
                breakClassName={"break-me"}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active"}
                forcePage={Math.floor(itemOffset / itemsPerPage)}
            />
        </div>
    )
}
