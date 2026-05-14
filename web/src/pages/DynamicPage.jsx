import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router'
import BlockRenderer from '@components/BlockRenderer'
import api from '@services/apiService'

export default function DynamicPage() {
    const { '*': slug } = useParams()
    const location = useLocation()
    const [page, setPage] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    
    // Si queremos obtener query params como "preview", podemos usar useSearchParams o parsear location.search.
    const previewToken = new URLSearchParams(location.search).get('preview')

    useEffect(() => {
        const loadPage = async () => {
            setLoading(true)
            setError(false)

            const response = await api.get(`/paginas/${slug}`)
            setPage(response.data)
            setLoading(false)
        }
        loadPage()
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Página no encontrada</h1>
                <p className="text-gray-600">La página que buscas no existe o aún no tiene contenido.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">            
            {previewToken && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#faad14', color: '#000', textAlign: 'center', padding: '8px 16px', fontWeight: 600, fontSize: 14 }}>
                    Modo vista previa — este contenido no está publicado
                </div>
            )}
            <article>
                <main>
                    <div style={previewToken ? { paddingTop: 37 } : undefined}>
                        {(page.title || []).map((block, index) => (
                            <BlockRenderer key={block.id || index} block={block} />
                        ))}
                    </div>
                </main>
            </article>
        </div>
    )
}
