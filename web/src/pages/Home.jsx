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
            const res = await api.get('/paginas/slug/home/')
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
                <meta property="og:image" content={page?.postlink ? page?.postlink : "/demo.jpg"} />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={page?.title || 'Instituto de Información Estadística y Geográfica - IIEG'} />
                <meta name="twitter:description" content={page?.description_meta || 'Conoce Jalisco, nuestro territorio y sus recursos naturales; las características de su población y las condiciones en las que vive; así como su situación económica y las oportunidades que ofrece nuestro estado, sus municipios y los diferentes ordenes de gobierno.'} />
                <meta name="twitter:image" content={page?.postlink ? page?.postlink : "/demo.jpg"} />
            </Helmet>
            <section className="h-auto md:h-[565px] lg:h-[580px] xl:h-[592px]  2xl:h-[925px] " role="banner">                
                <BlockRenderer block={{ type: 'banners' }} />
            </section>            
            <section className="container-fluid relative grid">
                <div className="relative z-0 order-2 xl:order-1 min-h-[475px] lg:min-h-[555px] xl:min-h-[530px] 2xl:min-h-auto">                    
                    <div className='bg-primary text-center z-10 mx-auto absolute top-[50%] lg:top-[60%] 2xl:top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-10 py-11 rounded-2xl w-11/12 lg:w-10/12 xl:w-7/12 extra:max-w-[1220px]'>
                        <img src="/ico_mapalab.png" alt="MapaLab" className="inline-block mr-2" />
                        <p className='text-center text-white my-8 text-22'>Explora el territorio de Jalisco con datos geoespaciales</p>
                        <TrackedLink to="https://iieg.jalisco.gob.mx/mapalab/" className="button bg-medio hover:bg-tertiary text-base block max-w-[395px] mx-auto">
                            Quiero explorar MapaLab
                        </TrackedLink>
                    </div>
                    <img src="/img_mapalab.png" alt="MapaLab" className="w-full h-full object-cover" />
                </div>
                <BlockRenderer block={{ type: 'plataformasDestacado' }} />
            </section>
            <section className="w-full bg-primary pt-15 pb-32">
                <div className="container mx-auto grid grid-cols-1 lg:grid-cols-6 gap-4 px-5 xl:px-5 2xl:px-0">
                    <div className='lg:col-span-6'>
                        <h2 className="text-white text-center">Conoce los datos más relevantes</h2>
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

            <section className="w-11/12 mx-auto rounded-4xl -mt-18 pt-10 pb-15 bg-card px-8 extra:max-w-[1980px]">
                <h2 className="text-titulo text-center my-10">Visita nuestras plataformas interactivas</h2>
                <BlockRenderer block={{ type: 'plataformas_slider' }} />
                <TrackedLink to="/nuestros-productos" className="button2 sm:w-[350px] text-base text-center block mx-auto mt-3 text-primary hover:text-white border-primary hover:bg-primary mt-5">
                    Conoce todos nuestros productos
                </TrackedLink>

            </section>

            <section className="w-11/12 mx-auto relative my-15">
                <h2 className="text-titulo text-center mb-14 text-44 font-extrabold">Conoce los mapas históricos de Jalisco</h2>
                <BlockRenderer block={{ type: 'mapas' }} />
                <TrackedLink 
                to="/mapas-historicos" 
                target="_self"
                className="button2 block w-[350px] text-center mx-auto mt-14 text-primary hover:text-white border-primary hover:bg-primary">
                    Quiero ver todos los mapas
                </TrackedLink>
            </section>
            <section className="container-fluid relative bg-card py-20">
                <div className="container mx-auto grid grid-cols-2 md:grid-cols-6 xl:grid-cols-5 gap-10 px-5">
                
                <TrackedLink 
                to="https://transparencia.jalisco.gob.mx/informacion_fundamental/214" 
                target="_blank"
                className="text-primary hover:text-tertiary text-center md:col-span-2 xl:col-span-1 group relative">
                    <div className='relative z-2'>                        
                    <img src="/ico_transparencia_normal.png" alt="Transparencia" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2 text-22">Transparencia</span>
                    </div>                    
                    <div className='bg-etiqueta-sec w-25 h-25 rounded-full z-0 absolute group-hover:scale-110 left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-12'></div>
                </TrackedLink>

                 <TrackedLink 
                to="https://analisis.jalisco.gob.mx/adquis" 
                target="_blank"
                className="text-primary hover:text-tertiary text-center md:col-span-2 xl:col-span-1 group relative">
                    <div className='relative z-2'>                        
                    <img src="/ico_licitaciones_normal.png" alt="Licitaciones" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2 text-22">Licitaciones</span>
                    </div>                    
                    <div className='bg-etiqueta-sec w-25 h-25 rounded-full z-0 absolute group-hover:scale-110 left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-12'></div>
                </TrackedLink>

                 <TrackedLink 
                to="/contabilidad-gubernamental" 
                target="_self"
                className="text-primary hover:text-tertiary text-center md:col-span-2 xl:col-span-1 group relative">
                    <div className='relative z-2'>                        
                    <img src="/ico_contabilidad_normal.png" alt="Contabilidad Gubernamental" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2 text-22">Contabilidad gubernamental</span>
                    </div>                    
                    <div className='bg-etiqueta-sec w-25 h-25 rounded-full z-0 absolute group-hover:scale-110 left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-12'></div>
                </TrackedLink>

                <TrackedLink 
                to="/educacion-continua" 
                target="_self"
                className="text-primary hover:text-tertiary text-center col-span-1 md:col-span-2 md:col-start-2 xl:col-span-1 group relative">
                    <div className='relative z-2'>                        
                    <img src="/ico_capacitaciones_normal.png" alt="Educación continua" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2 text-22">Educación continua</span>
                    </div>                    
                    <div className='bg-etiqueta-sec w-25 h-25 rounded-full z-0 absolute group-hover:scale-110 left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-12'></div>
                </TrackedLink>

                <TrackedLink 
                to="/comunicacion-institucional" 
                target="_self"
                className="text-primary hover:text-tertiary text-center col-span-2 md:col-span-2 xl:col-span-1 group relative">
                    <div className='relative z-2'>                        
                    <img src="/ico_noticias_normal.png" alt="Comunicación Institucional" className="w-25 h-25 object-cover mx-auto mb-5" />
                    <span className="block mt-2 text-22">Comunicación Institucional</span>                    
                    </div>                    
                    <div className='bg-etiqueta-sec w-25 h-25 rounded-full z-0 absolute group-hover:scale-110 left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-12'></div>
                </TrackedLink>

                </div>
            </section>
            <section className="container-fluid mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 extra:max-w-[1980px] mx-auto">
                <BlockRenderer block={{ type: 'contacto' }} />
            </section>
        </>
    )
}

export default HomePage

