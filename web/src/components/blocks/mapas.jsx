import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate'
import TrackedLink from '@components/blocks/boton'

// ─── Utilidad: mezcla aleatoria (Fisher-Yates) ────────────────────────────────
function shuffleArray(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 12
const DEBOUNCE_MS = 350
const SEARCH_KEYS = ['titulo', 'autor', 'area','escala', 'ubicacion', 'informacion', 'editor', 'edicion', 'medida']

export default function Mapas() {
    const [mapas, setMapas] = useState([])        // todos los mapas (orden aleatorio)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)

    // ── Filtros ───────────────────────────────────────────────────────────────
    const [keyword, setKeyword] = useState('')
    const [debouncedKeyword, setDebouncedKeyword] = useState('')
    const [filterAnyo, setFilterAnyo] = useState('')
    const [filterTipo, setFilterTipo] = useState('')

    // ── Paginación ────────────────────────────────────────────────────────────
    const [itemOffset, setItemOffset] = useState(0)

    // ── Debounce del campo de texto ───────────────────────────────────────────
    const debounceTimer = useRef(null)
    const handleKeywordChange = (e) => {
        const value = e.target.value
        setKeyword(value)
        clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(() => setDebouncedKeyword(value), DEBOUNCE_MS)
    }

    // ── Carga de datos ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchMapas = async () => {
            try {
                setLoadError(false)
                const response = await api.get('/mapas')
                const data = Array.isArray(response.data?.mapas) ? response.data.mapas : []
                setMapas(shuffleArray(data))    // orden aleatorio inicial
            } catch {
                setLoadError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchMapas()
    }, [])

    // ── Opciones únicas para selects (derivadas de los datos) ─────────────────
    const anyoOptions = useMemo(() => {
        const years = [...new Set(mapas.map(m => m.anyo).filter(Boolean))].sort((a, b) => b - a)
        return years
    }, [mapas])

    const tipoOptions = useMemo(() => {
        return [...new Set(mapas.map(m => m.tipo).filter(Boolean))].sort()
    }, [mapas])


    // ── Filtrado combinado ────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return mapas.filter(mapa => {
            // Texto libre (busca en múltiples campos)
            if (debouncedKeyword.trim()) {
                const term = debouncedKeyword.toLowerCase()
                const matchesKeyword = SEARCH_KEYS.some(key => {
                    const val = mapa[key]
                    return val?.toString().toLowerCase().includes(term)
                })
                if (!matchesKeyword) return false
            }
            // Año
            if (filterAnyo && String(mapa.anyo) !== filterAnyo) return false
            // Tipo
            if (filterTipo && mapa.tipo !== filterTipo) return false

            return true
        })
    }, [mapas, debouncedKeyword, filterAnyo, filterTipo])

    // Resetear paginación cuando cambian los filtros
    useEffect(() => {
        setItemOffset(0)
    }, [debouncedKeyword, filterAnyo, filterTipo])

    const endOffset = itemOffset + ITEMS_PER_PAGE
    const currentItems = filtered.slice(itemOffset, endOffset)
    const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE)

    const handlePageClick = (event) => {
        if (!filtered.length) { setItemOffset(0); return }
        const newOffset = (event.selected * ITEMS_PER_PAGE) % filtered.length
        setItemOffset(newOffset)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const hasActiveFilters = debouncedKeyword || filterAnyo || filterTipo

    const clearFilters = () => {
        setKeyword('')
        setDebouncedKeyword('')
        setFilterAnyo('')
        setFilterTipo('')
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="container mx-auto px-2 ">
            {/* ── Panel de filtros ── */}

            <div className="mx-auto container md:w-6/12 mb-15">
                        <input
                            type="search"
                            value={keyword}
                            onChange={handleKeywordChange}
                            placeholder="Filtrar por palabras clave"
                            className="w-full bg-transparent text-center border border-primary rounded-3xl px-4 py-2 text-titulo placeholder-titulo transition-all duration-200 outline-none focus-within:border-positivo focus-within:ring-1 focus-within:ring-positivo focus-within:ring-positivo"
                        />
                    </div>
            
                <div className="flex flex-col lg:flex-wrap lg:flex-row gap-5 mb-5">

                    {/* Filtro: Año */}
                    <div className="">
                        <label className='block text-14 text-primary'>
                            Año
                        </label>
                        <select
                            value={filterAnyo}
                            onChange={e => setFilterAnyo(e.target.value)}
                            className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                        >
                            <option value="" className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Todos</option>
                            {anyoOptions.map(y => (
                                <option key={y} value={y}className='w-full rounded-lg bg-card text-titulo px-4 py-2'>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro: Tipo */}
                    <div className="">
                        <label className='block text-14 text-primary'>
                            Tipo
                        </label>
                        <select
                            value={filterTipo}
                            onChange={e => setFilterTipo(e.target.value)}
                            className='w-full rounded-lg bg-card text-titulo px-4 py-2'
                        >
                            <option value="" className='w-full rounded-lg bg-card text-titulo px-4 py-2'>Todos</option>
                            {tipoOptions.map(tipo => (
                                <option key={tipo} value={tipo} className='w-full rounded-lg bg-card text-titulo px-4 py-2'>
                                    {tipo}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Botón limpiar filtros */}
                    {hasActiveFilters && (
                         <div className='flex items-end'>
                        <button
                            onClick={clearFilters}
                            className='w-full rounded-lg border border-titulo bg-card px-4 py-2 text-sm text-titulo cursor-pointer hover:text-tertiary'
                        >
                            Limpiar filtros
                        </button>
                        </div>
                    )}
                </div>

            

            {/* ── Estados: cargando / error / sin resultados ── */}
            {loading && (
                <p className="py-8 text-center text-sm text-gray-500 my-15">Cargando mapas...</p>
            )}
            {loadError && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 my-15">
                    No se pudieron cargar los mapas. Intenta recargar la página.
                </p>
            )}
            {!loading && !loadError && filtered.length === 0 && (
                <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 my-15">
                    No se encontraron mapas con los filtros seleccionados.
                </p>
            )}

            {/* ── Grid de resultados ── */}
            {!loading && currentItems.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 my-15">
                    {currentItems.map(mapa => (
                        <a href={`/mapas-historicos/${mapa.slug}`} key={mapa.id}>
                                            <div key={mapa.id} className="p-4 overflow-hidden mapa h-96 relative rounded-4xl">                    
                                                <img src={mapa.imagen ? mapa.imagen : "/demo.jpg"} alt={mapa.titulo} className='image-mapa rounded-4xl'/>
                                                <div className='info'>
                                                    <TrackedLink to={`/mapas-historicos/${mapa.slug}`} className="mt-2 inline-block text-sm text-[#6618a2]">
                                                        <h3 className='text-white'>{mapa.titulo}</h3>
                                                        
                                                        <div className='flex mb-4 gap-2'> 
                                                            {mapa.anyo ? (
                                                                <p className='bg-card text-titulo rounded-2xl px-4 py-2 text-14'>{mapa.anyo}</p>
                                                            ) : null}
                                                            {mapa.tipo ? (
                                                                <p className='bg-etiqueta-sec text-primary rounded-2xl px-4 py-2 text-14'>{mapa.tipo}</p>
                                                            ) : null}
                                                        </div>
                                                        
                                                    </TrackedLink>
                                                </div>
                                            </div>
                                        </a>
                    ))}
                </div>
            )}

            {/* ── Paginación ── */}
            {!loading && pageCount > 1 && (
                <ReactPaginate
                previousLabel={"<"}
                nextLabel={">"}
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
            )}
        </div>
    )
}