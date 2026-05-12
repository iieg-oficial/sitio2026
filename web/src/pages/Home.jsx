import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import { getPageBySlug, getPreviewPage } from '@services/pageService'
import BlockRenderer from '@components/BlockRenderer'
import TrackedLink from '@components/blocks/boton'
import { Helmet } from 'react-helmet-async'
import api from '@services/apiService'

function HomePage() {
    const [searchParams] = useSearchParams()
    const previewToken = searchParams.get('preview')
    const [page, setPage] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchPageHome = async () => {
        setLoading(true)
        try {
            const res = await api.get('/paginas/slug/home')
            setPage(res.data)            
        } catch (err) {
            console.error("Error fetching page home:", err)
        }
        finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        const loadPage = previewToken
            ? getPreviewPage(previewToken)
            : fetchPageHome()

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
            <Helmet>
                <title>{page.title}</title>
                {page.description_meta && <meta name="description" content={page.description_meta} />}
                {page.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
            </Helmet>
            <section className="" role="banner">                
                <div style={{ paddingTop: 37 }}>
                    <BlockRenderer block={{ type: 'banners' }} />
                </div>
            </section>            
            <section className="container-fluid relative">
                <div className="relative z-0 pt-12">                    
                    <TrackedLink to="/mapalab" className="bg-blue-500 text-white z-10 mx-auto absolute top-11/12 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        Quiero explorar MapaLab
                    </TrackedLink>
                    <img src="/demo.jpg" alt="MapaLab" className="w-full h-full object-cover" />
                </div>
                <BlockRenderer block={{ type: 'plataformasDestacado' }} />
            </section>
            <section className="w-10/12 mx-auto h-96 bg-pink-300 ">
                <BlockRenderer block={{ type: 'datos_nuevos' }} />
            </section>
            <section className="w-8/12 mx-auto h-96 bg-green-300 relative">
                <BlockRenderer block={{ type: 'flashes' }} />               
                <TrackedLink to="/flashes" className="bg-red-500 text-white z-10 mx-auto absolute top-11/12 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    Ver todos los flashes
                </TrackedLink>
            </section>
            <section className="w-11/12 mx-auto border rounded-lg bg-amber-300 h-5 ">
                <BlockRenderer block={{ type: 'plataformas_slider' }} />
            </section>
            <section className="w-11/12 mx-auto h-96 bg-blue-300 relative">
            <h2>Mapas</h2>
                <BlockRenderer block={{ type: 'mapas' }} />
                <Link to="/mapas" className="bg-blue-500 text-white z-10 mx-auto absolute top-11/12 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Ver todos los mapas</Link>
            </section>
            <section className="container-fluid mx-auto grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 my-14 gap-4 relative">
                
                <Link to="/transparencia" className="btn btn-primary text-center">
                    <img src="/demo.jpg" alt="Transparencia" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2">Transparencia</span>
                </Link>
                
                <Link to="/licitaciones" className="btn btn-primary text-center">
                    <img src="/demo.jpg" alt="Transparencia" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2">Licitaciones</span>
                </Link>
                
                <Link to="/contabilidad-gubernamental" className="btn btn-primary text-center">
                    <img src="/demo.jpg" alt="Transparencia" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2">Contabilidad Gubernamental</span>
                </Link>
                
                <Link to="/capacitaciones" className="btn btn-primary md:col-start-2 md:col-span-1 xl:col-start-4 text-center">
                    <img src="/demo.jpg" alt="Transparencia" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2">Capacitaciones</span>
                </Link>
                <Link to="/comunidad" className="btn btn-primary text-center">
                    <img src="/demo.jpg" alt="Transparencia" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2">Comunidad</span>
                </Link>
            </section>
            <section className="container-fluid mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <BlockRenderer block={{ type: 'contacto' }} />
            </section>
        </>
    )
}

export default HomePage

