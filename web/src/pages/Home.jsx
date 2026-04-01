import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import { getPageBySlug, getPreviewPage } from '@services/pageService'
import BlockRenderer from '@components/BlockRenderer'

function HomePage() {
    const [searchParams] = useSearchParams()
    const previewToken = searchParams.get('preview')
    const [page, setPage] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPage = previewToken
            ? getPreviewPage(previewToken)
            : getPageBySlug('home')

        loadPage
            .then(data => {
                if (data && data.sections && data.sections.length > 0) {
                    setPage(data)
                }
            })
            .catch(err => {
                console.error("Failed to load home page config", err)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [previewToken])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900"></div>
            </div>
        )
    }


    if (page && page.sections && page.sections.length > 0) {
        return (
            <div className="min-h-screen">
                {previewToken && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#faad14', color: '#000', textAlign: 'center', padding: '8px 16px', fontWeight: 600, fontSize: 14 }}>
                        Modo vista previa — este contenido no está publicado
                    </div>
                )}
                <div style={previewToken ? { paddingTop: 37 } : undefined}>
                    {page.sections.map((block, index) => (
                        <BlockRenderer key={block.id || index} block={block} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <>
            <section className="min-h-screen" role="banner">
                <h1>Home</h1>
                <div style={{ paddingTop: 37 }}>
                    <BlockRenderer block={{ type: 'banner' }} />
                </div>
            </section>
            <section className="container mx-auto border rounded-lg">
                <BlockRenderer block={{ type: 'plataformasDestacado' }} />
            </section>
            <section className="container-fluid relative">
                <Link to="/mapalab" className="btn btn-primary z-10">Quiero explorar MapaLab</Link>
                <img src="/images/mapalab.png" alt="MapaLab" className="absolute top-0 left-0 w-full h-full object-cover" />
            </section>
            <section className="w-10/12 mx-auto">
                <BlockRenderer block={{ type: 'datos_nuevos' }} />
            </section>
            <section className="w-8/12 mx-auto">
                <BlockRenderer block={{ type: 'flashes' }} />
                <Link to="/flashes" className="btn btn-primary">Ver todos los flashes</Link>
            </section>
            <section className="w-11/12 mx-auto border rounded-lg">
                <BlockRenderer block={{ type: 'plataformas_slider' }} />
            </section>
            <section className="w-8/12 mx-auto">
                <BlockRenderer block={{ type: 'mapas' }} />
                <Link to="/mapas" className="btn btn-primary">Ver todos los mapas</Link>
            </section>
            <section className="container-fluid mx-auto grid grid-cols-3">
                <Link to="/transparencia" className="btn btn-primary">Transparencia</Link>
                <Link to="/licitaciones" className="btn btn-primary">Licitaciones</Link>
                <Link to="/contabilidad-gubernamental" className="btn btn-primary">Contabilidad Gubernamental</Link>
            </section>
            <section className="container-fluid mx-auto grid grid-cols-2">
                <BlockRenderer block={{ type: 'contacto' }} />
            </section>
        </>
    )
}

export default HomePage

