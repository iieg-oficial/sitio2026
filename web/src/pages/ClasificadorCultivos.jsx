import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Helmet } from 'react-helmet-async'
import api from '@services/apiService'
import Backlink from '../components/pageComponents/Backlink'
import TrackedLink from '@components/blocks/boton'

export default function ClasificadorCultivos() {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true)

    const fetchPageHome = async () => {
        setLoading(true)
        try {            
            const res = await api.get('/paginas/slug/clasificador-de-cultivos')
            setPage(res.data) 
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
                <title>{page?.title || 'Clasificador de Cultivos - IIEG'}</title>
                {page?.description_meta && <meta name="description" content={page.description_meta} />}
                {page?.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
                <meta property="og:image" content="https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:type" content="article" />
                {/* Twitter Cards (Específico para X / Twitter) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={page?.title || 'Clasificador de Cultivos - IIEG'} />
                <meta name="twitter:description" content={page?.description_meta || 'Este instrumento ofrece una representación geoespacial de los cultivos en Jalisco del año 2021. A través de un mapa interactivo, integra información procesada con modelos de inteligencia artificial que identifican el tipo de cultivo y su ubicación mediante el análisis de imágenes satelitales.'} />
                <meta name="twitter:image" content="https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png" />
            </Helmet>
            <div className='mx-auto container mb-15 px-5 2xl:px-0'>
                <div className='mt-5'>
                    <Backlink />
                </div>
                <section className="container mx-auto grid grid-cols-1 lg:grid-cols-6 gap-10 px-2">
                    <div className="lg:col-span-2">
                        <img src="/cultivos/ico_clasificador_cultivos.svg" alt={page?.title} className='w-[60%] mx-auto md:w-[35%] lg:w-[80%]'/>
                    </div>
                    <div className="lg:col-span-4">
                        <h1>{page?.title || 'Clasificador de Cultivos'}</h1>
                        <p className="my-5 leading-10">Este instrumento ofrece una representación geoespacial de los cultivos en Jalisco del año 2021. A través de un mapa interactivo, integra información procesada con modelos de inteligencia artificial que identifican el tipo de cultivo y su ubicación mediante el análisis de imágenes satelitales.</p>
                        <TrackedLink to={`/clasificador-cultivos/documentacion`} className="mt-2 inline-block text-base rounded-4xl border px-6 py-3 font-garet-extra bg-[#8838AB] text-white hover:bg-white hover:text-[#8837AA]  hover:border-[#8837AA] transition-all duration-200">
                            Ver la documetación del proyecto                                
                        </TrackedLink>
                    </div>
                </section>
                <section className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-10 sm:my-20 xl:my-25 gap-12 text-center diez">
                    <div>
                        <img src="/cultivos/ico_cultivos_01.png" alt={page?.title} className='align-center text-center mx-auto mb-5 w-[60%]'/>
                        <p>Se detectaron y clasificaron, a gran escala, cultivos agrícolas, a través de la interpretación de imágenes satelitales por medio del entrenamiento de modelos de IA.</p>
                    </div>
                    <div>
                        <img src="/cultivos/ico_cultivos_02.png" alt={page?.title} className='align-center text-center mx-auto mb-5 w-[60%]'/>
                        <p>Se realizaron dos macroprocesos, uno fue la segmentación de las parcelas. Fueron identificados sus límites utilizando las imágenes satelitales del Programa NICFI.</p>
                    </div>
                    <div>
                        <img src="/cultivos/ico_cultivos_03.png" alt={page?.title} className='align-center text-center mx-auto mb-5 w-[60%]'/>
                        <p>En el segundo macroproceso nuestros modelos trabajaron con series de tiempo de imágenes satelitales de Sentinel-1 y Sentinel-2, para la clasificación del tipo de cultivo dentro de cada parcela.</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-primary text-center font-extrabold">Clasificador de cultivos en cifras</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-15 mb-25 text-center">
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>80,000 km²</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Área de estudio</p>
                        </div>
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>81%</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Precisión general</p>
                        </div>
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>F1-score ≥ 90 %</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Rendimiento de los modelos de IA en la detección de cultivos</p>
                        </div>
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>+9.9%</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Mejora en IoU (de 0.668 a 0.734) <br /> mejora en IoU (5-ch vs. 3-ch ConvNet)</p>
                        </div>
                        <div className="text-center bg-card rounded-3xl p-5 border-[#E6EEFF] border">
                            <b className='text-44 text-tertiary font-garet-extra'>+5.8%</b><br></br>
                            <p className='text-18 text-titulo font-garet-bold'>Mejora en Average Precision (AP) <br /> Mejora en AP (5-ch vs. 3-ch ConvNet)</p>
                        </div>
                    </div>
                </section>
                <section className="px-2 mt-50">
                    <h2 className="text-primary text-center font-extrabold">Imágenes de la plataforma</h2>
                    <div className="grid grid-cols-1 gap-4 mt-15 mb-25 text-center">
                        <div>
                            <img src="/cultivos/g1.png" alt={page?.titulo} className='image-mapa rounded-4xl'/>
                        </div>
                        <div>
                            <img src="/cultivos/g2.png" alt={page?.titulo} className='image-mapa rounded-4xl'/>
                        </div>
                    </div>
                </section>

            </div>
        </>
    )
}

