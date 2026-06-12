import { useEffect, useMemo, useRef, useState } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate'

// ─── Constantes ───────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 12
const DEBOUNCE_MS = 350
const SEARCH_KEYS = ['titulo', 'descripcion', 'claves', 'tipo']

export default function Sistemas() {
    const [sistemas, setSistemas] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)

    // ── Filtros ───────────────────────────────────────────────────────────────
    const [keyword, setKeyword] = useState('')
    const [debouncedKeyword, setDebouncedKeyword] = useState('')
    const [filterTema, setFilterTema] = useState('')
    const [filterSubtema, setFilterSubtema] = useState('')

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
        const fetchSistemas = async () => {
            try {
                setLoadError(false)
                const response = await api.get('/sistemas')
                const data = Array.isArray(response.data?.sistemas) ? response.data.sistemas : []
                
                // Ordenar inicialmente por 'orden' de menor a mayor (nulls al final)
                const sortedData = data.sort((a, b) => {
                    const ordA = a.orden != null ? a.orden : Infinity
                    const ordB = b.orden != null ? b.orden : Infinity
                    return ordA - ordB
                })
                
                setSistemas(sortedData)
            } catch {
                setLoadError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchSistemas()
    }, [])

    // ── Extraer temas y subtemas únicos de los datos ──────────────────────────
    const { parentTemas, availableSubtemas } = useMemo(() => {
        const allTemasMap = new Map()
        sistemas.forEach(s => {
            (s.temas || []).forEach(t => {
                if (!allTemasMap.has(t.id)) {
                    allTemasMap.set(t.id, t)
                }
            })
        })
        
        const allTemas = Array.from(allTemasMap.values())
        const parents = allTemas.filter(t => !t.parent_id).sort((a, b) => a.titulo.localeCompare(b.titulo))
        
        let subtemas = []
        if (filterTema) {
            subtemas = allTemas.filter(t => t.parent_id === Number(filterTema)).sort((a, b) => a.titulo.localeCompare(b.titulo))
        }
        
        return { parentTemas: parents, availableSubtemas: subtemas }
    }, [sistemas, filterTema])

    // Resetear el subtema si el tema cambia y el subtema seleccionado ya no es válido
    useEffect(() => {
        if (filterSubtema) {
            const stillValid = availableSubtemas.some(st => st.id === Number(filterSubtema))
            if (!stillValid) setFilterSubtema('')
        }
    }, [filterTema, availableSubtemas, filterSubtema])

    // ── Filtrado combinado ────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return sistemas.filter(sistema => {
            // Texto libre (busca en múltiples campos)
            if (debouncedKeyword.trim()) {
                const term = debouncedKeyword.toLowerCase()
                const matchesKeyword = SEARCH_KEYS.some(key => {
                    const val = sistema[key]
                    return val?.toString().toLowerCase().includes(term)
                })
                // También buscar en los nombres de los temas
                const matchesTemaName = (sistema.temas || []).some(t => t.titulo.toLowerCase().includes(term))
                
                if (!matchesKeyword && !matchesTemaName) return false
            }
            
            // Tema
            if (filterTema) {
                const hasTema = (sistema.temas || []).some(t => t.id === Number(filterTema))
                // Si el sistema solo tiene el subtema asignado (y no el tema padre directamente),
                // consideramos que pertenece al tema si alguno de sus temas tiene parent_id === filterTema
                const hasSubtemaOfTema = (sistema.temas || []).some(t => t.parent_id === Number(filterTema))
                
                if (!hasTema && !hasSubtemaOfTema) return false
            }
            
            // Subtema
            if (filterSubtema) {
                const hasSubtema = (sistema.temas || []).some(t => t.id === Number(filterSubtema))
                if (!hasSubtema) return false
            }

            return true
        })
    }, [sistemas, debouncedKeyword, filterTema, filterSubtema])

    // Resetear paginación cuando cambian los filtros
    useEffect(() => {
        setItemOffset(0)
    }, [debouncedKeyword, filterTema, filterSubtema])

    const endOffset = itemOffset + ITEMS_PER_PAGE
    const currentItems = filtered.slice(itemOffset, endOffset)
    const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE)

    const handlePageClick = (event) => {
        if (!filtered.length) { setItemOffset(0); return }
        const newOffset = (event.selected * ITEMS_PER_PAGE) % filtered.length
        setItemOffset(newOffset)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const hasActiveFilters = debouncedKeyword || filterTema || filterSubtema

    const clearFilters = () => {
        setKeyword('')
        setDebouncedKeyword('')
        setFilterTema('')
        setFilterSubtema('')
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div>
            {/* ── Panel de filtros ── */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-end gap-3">

                    {/* Búsqueda por palabra clave */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="mb-1 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Palabra clave
                        </label>
                        <input
                            type="search"
                            value={keyword}
                            onChange={handleKeywordChange}
                            placeholder="Título, descripción..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#6618a2] focus:outline-none focus:ring-2 focus:ring-[#6618a2]/20"
                        />
                    </div>

                    {/* Filtro: Tema */}
                    {parentTemas.length > 0 && (
                        <div className="min-w-[160px]">
                            <label className="mb-1 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Tema
                            </label>
                            <select
                                value={filterTema}
                                onChange={e => setFilterTema(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#6618a2] focus:outline-none focus:ring-2 focus:ring-[#6618a2]/20"
                            >
                                <option value="">Todos los temas</option>
                                {parentTemas.map(t => (
                                    <option key={t.id} value={t.id}>{t.titulo}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Filtro: Subtema (Solo visible si hay subtemas para el tema seleccionado) */}
                    {filterTema && availableSubtemas.length > 0 && (
                        <div className="min-w-[160px]">
                            <label className="mb-1 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Subtema
                            </label>
                            <select
                                value={filterSubtema}
                                onChange={e => setFilterSubtema(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#6618a2] focus:outline-none focus:ring-2 focus:ring-[#6618a2]/20"
                            >
                                <option value="">Todos los subtemas</option>
                                {availableSubtemas.map(st => (
                                    <option key={st.id} value={st.id}>{st.titulo}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Botón limpiar filtros */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                        >
                            ✕ Limpiar
                        </button>
                    )}
                </div>

                {/* Contador de resultados */}
                {!loading && (
                    <p className="mt-3 text-xs text-gray-500">
                        {hasActiveFilters
                            ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
                            : `${sistemas.length} sistemas en total`
                        }
                    </p>
                )}
            </div>

            {/* ── Estados: cargando / error / sin resultados ── */}
            {loading && (
                <p className="py-8 text-center text-sm text-gray-500">Cargando sistemas...</p>
            )}
            {loadError && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    No se pudieron cargar los sistemas. Intenta recargar la página.
                </p>
            )}
            {!loading && !loadError && filtered.length === 0 && (
                <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    No se encontraron sistemas con los filtros seleccionados.
                </p>
            )}

            {/* ── Grid de resultados ── */}
            {!loading && currentItems.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {currentItems.map(sistema => (
                        <div key={sistema.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition flex flex-col">
                            {sistema.imagen && (
                                <img
                                    src={sistema.imagen}
                                    alt={sistema.titulo}
                                    className="mb-3 h-40 w-full rounded-lg object-cover"
                                />
                            )}
                            <h3 className="mb-2 text-lg font-bold text-gray-900 leading-snug">
                                {sistema.titulo}
                            </h3>
                            
                            {/* Mostrar tipo como etiqueta si existe */}
                            {sistema.tipo && (
                                <div className="mb-2">
                                    <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                        {sistema.tipo.replace('-', ' ')}
                                    </span>
                                </div>
                            )}

                            {/* Mostrar descripción truncada */}
                            {sistema.descripcion && (
                                <div className="text-sm text-gray-600 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: sistema.descripcion }} />
                            )}
                            
                            <div className="mt-auto pt-2">
                                {sistema.link && (
                                    <a
                                        href={sistema.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-sm font-medium text-[#6618a2] hover:underline"
                                    >
                                        Ir al sistema <span className="ml-1 text-lg leading-none">›</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Paginación ── */}
            {!loading && pageCount > 1 && (
                <ReactPaginate
                    breakLabel="..."
                    nextLabel="Siguiente ›"
                    previousLabel="‹ Anterior"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={5}
                    pageCount={pageCount}
                    renderOnZeroPageCount={null}
                    containerClassName="mt-6 flex flex-wrap justify-center gap-1"
                    pageClassName="page-item"
                    pageLinkClassName="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-sm hover:bg-gray-100"
                    previousClassName="page-item"
                    previousLinkClassName="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                    nextClassName="page-item"
                    nextLinkClassName="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                    activeClassName="active"
                    activeLinkClassName="!bg-[#6618a2] !text-white !border-[#6618a2]"
                    disabledLinkClassName="opacity-40 cursor-not-allowed"
                />
            )}
        </div>
    )
}