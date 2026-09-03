import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import api from '@services/apiService'
import Backlink from '../components/pageComponents/Backlink'
import TrackedLink from '@components/blocks/boton'

export default function Sieej() {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true)

    const fetchPageHome = async () => {
        setLoading(true)
        try {            
            const res = await api.get('/paginas/slug/siiej')
            setPage(res.data)
            console.log('Page data:', res.data)  
        } catch (err) {
            console.error("Error fetching page:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPageHome()
    }, [])

    return (
        <>
            <Helmet>
                <title>{page?.title || 'SIEEJ - IIEG'}</title>
                {page?.description_meta && <meta name="description" content={page.description_meta} />}
                {page?.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
                <meta property="og:image" content="https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={page?.title || 'SIEEJ - IIEG'} />
                <meta name="twitter:description" content={page?.description_meta || 'Este instrumento ofrece una representación geoespacial de los cultivos en Jalisco del año 2021. A través de un mapa interactivo, integra información procesada con modelos de inteligencia artificial que identifican el tipo de cultivo y su ubicación mediante el análisis de imágenes satelitales.'} />
                <meta name="twitter:image" content="https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png" />
            </Helmet>
            <div className='mx-auto container mb-15 px-5 2xl:px-0'>
                <div className='mt-5'>
                    <Backlink />
                </div>
                <section className="container mx-auto grid grid-cols-1 lg:grid-cols-6 gap-10 px-2">
                    <div className="lg:col-span-2">
                        <img src="/siiej/siiej.png" alt={page?.title} className='w-[60%] mx-auto md:w-[35%] lg:w-[80%]'/>
                    </div>
                    <div className="lg:col-span-4">
                        <h1>{page?.title || 'SIEEJ'}</h1>
                        <p className="my-5 leading-10">El Sistema de Información Estratégica del Estado de Jalisco es un conjunto de herramientas tecnológicas que recopilan , procesan , transforman y almacenan la información estratégica estatal , a través de datos provenientes de dependencias estatales y/o federales.</p>
                    </div>
                </section>
                <section className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-10 sm:my-20 xl:my-25 gap-12 text-center diez">
                    <div>
                        <img src="/siiej/ico_SIEEJ_01.png" alt={page?.title} className='align-center text-center mx-auto mb-5 w-[60%]'/>
                        <p>Establecer mecanismos confiables y periódicos para la captación y recopilación de los datos públicos estratégicos provenientes de las dependencias estatales y de las fuentes federales.</p>
                    </div>
                    <div>
                        <img src="/siiej/ico_SIEEJ_02.png" alt={page?.title} className='align-center text-center mx-auto mb-5 w-[60%]'/>
                        <p>Garantizar la calidad, integridad, conservación y actualización de los datos y de la información estadística generada o validada por el IIEG, mediante procesos de validación, transformación y almacenamiento.</p>
                    </div>
                    <div>
                        <img src="/siiej/ico_SIEEJ_03.png" alt={page?.title} className='align-center text-center mx-auto mb-5 w-[60%]'/>
                        <p>Generar y poner a disposición información clara, accesible y útil a través de los productos y plataformas del IIEG, para la toma de decisiones, políticas públicas y la atención de las necesidades de la sociedad.</p>
                    </div>
                </section>
                <section className="mb-50">
                    <h2 className="text-primary text-center font-extrabold">SIIEJ en cifras</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-15 mb-25 text-center">
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>33</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Bases de datos en producción</p>
                        </div>
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>4/29</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Fuentes estatales / Fuentes Federales</p>
                        </div>
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>137</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Vistas listas para análisis</p>
                        </div>
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>47</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Vistas materializadas en MapaLab</p>
                        </div>
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>10</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Bases de datos en MapaLab</p>
                        </div>
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>16,9 M</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Registros ingestados automáticamente</p>
                        </div>                        
                    </div>
                </section>
                

            </div>
        </>
    )
}

