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
                <title>{page?.title || 'Inicio - IIEG'}</title>
                {page?.description_meta && <meta name="description" content={page.description_meta} />}
                {page?.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
            </Helmet>
            <section className="h-[450px] md:h-[550px] lg:h-[800px]" role="banner">                
                <BlockRenderer block={{ type: 'banners' }} />
            </section>            
            <section className="container-fluid relative grid">
                <div className="relative z-0 order-2 md:order-1 min-h-[370px] md:min-h-auto">                    
                    <div className='bg-primary text-center z-10 mx-auto absolute top-6/12 md:top-8/12 xl:top-9/12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-5 py-14 rounded-2xl w-11/12 md:w-9/12 xl:w-auto'>
                        <img src="/ico_mapalab.svg" alt="MapaLab" className="w-8 h-8 inline-block mr-2" />
                        <p className='text-center text-white my-8 text-22'>Explora el territorio de Jalisco con datos geoespaciales</p>
                        <TrackedLink to="/mapalab" className="button bg-medio hover:bg-tertiary text-base">
                            Quiero explorar MapaLab
                        </TrackedLink>
                    </div>
                    <img src="/demo.jpg" alt="MapaLab" className="w-full h-full object-cover" />
                </div>
                <BlockRenderer block={{ type: 'plataformasDestacado' }} />
            </section>
            <section className="w-full bg-primary pt-10 pb-32">
                <div className="container mx-auto grid grid-cols-1 lg:grid-cols-6 gap-4 px-2">
                    <div className='lg:col-span-6'>
                        <h2 className="text-white text-center">Conoce los datos más recientes</h2>
                    </div>
                    <div className='lg:col-span-2'>                        
                        <BlockRenderer block={{ type: 'datos_nuevos' }} />
                    </div>                    
                    <div className='lg:col-span-4 pt-4 lg:pt-10 flex'>        
                        <div className='hidden lg:grid content-center'>
                            <div className='border border-white h-80 w-[1px] float-left mx-15 content-center'></div>
                        </div>                
                        <BlockRenderer block={{ type: 'flashes' }} />                                       
                    </div>
                </div>
            </section>

            <section className="w-11/12 mx-auto rounded-lg bg-white -mt-18 pt-10">
                <h2 className="text-titulo text-center my-10">Visita nuestras plataformas interactivas</h2>
                <BlockRenderer block={{ type: 'plataformas_slider' }} />
                <TrackedLink to="/flashes" className="button2 w-[350px] text-base text-center block mx-auto mt-3 text-primary hover:text-white border-primary hover:bg-primary mt-5">
                    Quiero ver todas las plataformas
                </TrackedLink>
            </section>
            <section className="w-11/12 mx-auto relative my-14">
                <h2 className="text-titulo text-center mb-10">Conoce los mapas de Jalisco</h2>
                <BlockRenderer block={{ type: 'mapas' }} />
                <TrackedLink 
                to="/mapas-historicos" 
                target="_self"
                className="button2 block w-[350px] text-center mx-auto mt-3 text-primary hover:text-white border-primary hover:bg-primary mt-5">
                    Quiero ver todos los mapas
                </TrackedLink>
            </section>
            <section className="container-fluid mx-auto grid grid-cols-2 md:grid-cols-6 xl:grid-cols-5 my-14 gap-4 relative bg-card">
                
                <TrackedLink 
                to="/transparencia" 
                target="_blank"
                className="text-primary hover:text-tertiary text-center md:col-span-2 xl:col-span-1">
                    <img src="/ico_transparencia_normal.svg" alt="Transparencia" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2">Transparencia</span>
                </TrackedLink>

                 <TrackedLink 
                to="/licitaciones" 
                target="_blank"
                className="text-primary hover:text-tertiary text-center md:col-span-2 xl:col-span-1">
                    <img src="/ico_licitaciones_normal.svg" alt="Licitaciones" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2">Licitaciones</span>
                </TrackedLink>

                 <TrackedLink 
                to="/contabilidad-gubernamental" 
                target="_self"
                className="text-primary hover:text-tertiary text-center md:col-span-2 xl:col-span-1">
                    <img src="/ico_contabilidad_normal.svg" alt="Contabilidad Gubernamental" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2">Contabilidad Gubernamental</span>
                </TrackedLink>

                <TrackedLink 
                to="/capacitaciones" 
                target="_self"
                className="text-primary hover:text-tertiary text-center col-span-1 md:col-span-2 md:col-start-2 xl:col-span-1">
                    <img src="/ico_capacitaciones_normal.svg" alt="Capacitaciones" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2">Capacitaciones</span>
                </TrackedLink>

                <TrackedLink 
                to="/comunidad" 
                target="_self"
                className="text-primary hover:text-tertiary text-center col-span-2 md:col-span-2 xl:col-span-1">
                    <img src="/ico_noticias_normal.png" alt="Comunidad" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2">Comunidad</span>
                </TrackedLink>
            </section>
            <section className="container-fluid mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <BlockRenderer block={{ type: 'contacto' }} />
            </section>
        </>
    )
}

export default HomePage

