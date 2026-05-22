import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Helmet } from 'react-helmet-async'
import HeaderSearch from '@components/HeaderSearch'
import { searchSiteContent } from '@services/globalSearchService'
import { useDebounce } from '@hooks/useDebounce'

function BusquedaGlobal() {
    const [searchParams, setSearchParams] = useSearchParams()
    const query = searchParams.get('q') ?? ''
    const debouncedQuery = useDebounce(query, 400)

    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let isMounted = true

        const loadResults = async () => {
            if (!debouncedQuery.trim()) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const data = await searchSiteContent(debouncedQuery)
                if (isMounted) {
                    setResults(data)
                }
            } catch (error) {
                if (isMounted) {
                    setResults([])
                }
                console.error('Error ejecutando busqueda global:', error)
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        loadResults()

        return () => {
            isMounted = false
        }
    }, [query])

    const groupedByType = useMemo(() => {
        return results.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1
            return acc
        }, {})
    }, [results])

    const handleSearchSubmit = (term) => {
        if (!term) {
            setSearchParams({})
            return
        }

        setSearchParams({ q: term })
    }

    return (
        <section className="container mx-auto px-4 py-8">
            <Helmet>
                <title>Busqueda general del sitio</title>
                <meta name="description" content="Resultados del buscador global del portal" />
            </Helmet>

            <h1 className="mb-2 text-3xl font-bold text-gray-900">Busqueda general</h1>
            <p className="mb-6 text-gray-600">Encuentra paginas, publicaciones y cuadernillos desde un solo lugar.</p>

            <div className="mb-6 max-w-2xl">
                <HeaderSearch initialValue={query} onSubmit={handleSearchSubmit} />
            </div>

            {query && (
                <p className="mb-4 text-sm text-gray-500">
                    Mostrando resultados para: <strong>{query}</strong>
                </p>
            )}

            {Object.keys(groupedByType).length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {Object.entries(groupedByType).map(([type, count]) => (
                        <span key={type} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                            {type}: {count}
                        </span>
                    ))}
                </div>
            )}

            {loading && <p className="text-gray-600">Buscando resultados...</p>}

            {!loading && query && results.length === 0 && (
                <p className="rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-700">
                    No se encontraron coincidencias. Intenta con otra palabra clave.
                </p>
            )}

            {!loading && !query && (
                <p className="rounded-md border border-gray-200 bg-gray-50 p-4 text-gray-700">
                    Escribe una palabra para iniciar la busqueda.
                </p>
            )}

            {!loading && results.length > 0 && (
                <ul className="space-y-4">
                    {results.map((result) => (
                        <li key={result.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6618a2]">{result.type}</p>

                            {result.external ? (
                                <a
                                    href={result.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-lg font-semibold text-gray-900 hover:text-[#6618a2]"
                                >
                                    {result.title}
                                </a>
                            ) : (
                                <Link to={result.url} className="text-lg font-semibold text-gray-900 hover:text-[#6618a2]">
                                    {result.title}
                                </Link>
                            )}

                            {result.description && <p className="mt-2 text-sm text-gray-600">{result.description}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

export default BusquedaGlobal
