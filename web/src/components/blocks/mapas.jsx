import { useEffect, useMemo, useRef, useState } from 'react'
import api from '@services/apiService'
import ReactPaginate from 'react-paginate'

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
const SEARCH_KEYS = ['titulo', 'autor', 'escala', 'ubicacion', 'informacion', 'editor', 'edicion', 'medida']

export default function Mapas() {
    const [mapas, setMapas] = useState([])        // todos los mapas (orden aleatorio)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(false)

    // ── Filtros ───────────────────────────────────────────────────────────────
    const [keyword, setKeyword] = useState('')
    const [debouncedKeyword, setDebouncedKeyword] = useState('')
    const [filterAnyo, setFilterAnyo] = useState('')
    const [filterEditor, setFilterEditor] = useState('')
    const [filterEdicion, setFilterEdicion] = useState('')

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

    const editorOptions = useMemo(() => {
        return [...new Set(mapas.map(m => m.editor).filter(Boolean))].sort()
    }, [mapas])

    const edicionOptions = useMemo(() => {
        return [...new Set(mapas.map(m => m.edicion).filter(Boolean))].sort()
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
            // Editor
            if (filterEditor && mapa.editor !== filterEditor) return false
            // Edición
            if (filterEdicion && mapa.edicion !== filterEdicion) return false

            return true
        })
    }, [mapas, debouncedKeyword, filterAnyo, filterEditor, filterEdicion])

    // Resetear paginación cuando cambian los filtros
    useEffect(() => {
        setItemOffset(0)
    }, [debouncedKeyword, filterAnyo, filterEditor, filterEdicion])

    const endOffset = itemOffset + ITEMS_PER_PAGE
    const currentItems = filtered.slice(itemOffset, endOffset)
    const pageCount = Math.ceil(filtered.length / ITEMS_PER_PAGE)

    const handlePageClick = (event) => {
        if (!filtered.length) { setItemOffset(0); return }
        const newOffset = (event.selected * ITEMS_PER_PAGE) % filtered.length
        setItemOffset(newOffset)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const hasActiveFilters = debouncedKeyword || filterAnyo || filterEditor || filterEdicion

    const clearFilters = () => {
        setKeyword('')
        setDebouncedKeyword('')
        setFilterAnyo('')
        setFilterEditor('')
        setFilterEdicion('')
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
                            placeholder="Título, autor, ubicación..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#6618a2] focus:outline-none focus:ring-2 focus:ring-[#6618a2]/20"
                        />
                    </div>

                    {/* Filtro: Año */}
                    <div className="min-w-[130px]">
                        <label className="mb-1 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Año
                        </label>
                        <select
                            value={filterAnyo}
                            onChange={e => setFilterAnyo(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#6618a2] focus:outline-none focus:ring-2 focus:ring-[#6618a2]/20"
                        >
                            <option value="">Todos</option>
                            {anyoOptions.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro: Editor */}
                    <div className="min-w-[160px]">
                        <label className="mb-1 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Editor
                        </label>
                        <select
                            value={filterEditor}
                            onChange={e => setFilterEditor(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#6618a2] focus:outline-none focus:ring-2 focus:ring-[#6618a2]/20"
                        >
                            <option value="">Todos</option>
                            {editorOptions.map(ed => (
                                <option key={ed} value={ed}>{ed}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro: Edición */}
                    <div className="min-w-[160px]">
                        <label className="mb-1 block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Edición
                        </label>
                        <select
                            value={filterEdicion}
                            onChange={e => setFilterEdicion(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#6618a2] focus:outline-none focus:ring-2 focus:ring-[#6618a2]/20"
                        >
                            <option value="">Todas</option>
                            {edicionOptions.map(ed => (
                                <option key={ed} value={ed}>{ed}</option>
                            ))}
                        </select>
                    </div>

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
                            : `${mapas.length} mapas en total`
                        }
                    </p>
                )}
            </div>

            {/* ── Estados: cargando / error / sin resultados ── */}
            {loading && (
                <p className="py-8 text-center text-sm text-gray-500">Cargando mapas...</p>
            )}
            {loadError && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    No se pudieron cargar los mapas. Intenta recargar la página.
                </p>
            )}
            {!loading && !loadError && filtered.length === 0 && (
                <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    No se encontraron mapas con los filtros seleccionados.
                </p>
            )}

            {/* ── Grid de resultados ── */}
            {!loading && currentItems.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {currentItems.map(mapa => (
                        <div key={mapa.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                            {mapa.imagen && (
                                <img
                                    src={mapa.imagen}
                                    alt={mapa.titulo}
                                    className="mb-3 h-40 w-full rounded-lg object-cover"
                                />
                            )}
                            <h3 className="mb-1 text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                                {mapa.titulo}
                            </h3>
                            {mapa.anyo && <p className="text-xs text-gray-500">📅 {mapa.anyo}</p>}
                            {mapa.autor && <p className="text-xs text-gray-500">✍️ {mapa.autor}</p>}
                            {mapa.ubicacion && <p className="text-xs text-gray-500">📍 {mapa.ubicacion}</p>}
                            {mapa.escala && <p className="text-xs text-gray-500">🗺 Escala: {mapa.escala}</p>}
                            {mapa.editor && <p className="text-xs text-gray-400 mt-1">{mapa.editor}</p>}
                            {mapa.archivo && (
                                <a
                                    href={mapa.archivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block text-xs font-medium text-[#6618a2] hover:underline"
                                >
                                    Ver archivo →
                                </a>
                            )}
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