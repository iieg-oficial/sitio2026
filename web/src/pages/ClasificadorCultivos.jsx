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
                <title>{page?.title || 'Clasificador de Cultivos - IIEG'}</title>
                {page?.description_meta && <meta name="description" content={page.description_meta} />}
                {page?.keywords_meta && <meta name="keywords" content={page.keywords_meta} />}
            </Helmet>
            <div className='mx-auto container mb-15'>
                <div className='mx-auto w-full px-2 2xl:w-10/12 md:pt-5 mt-5'>
                    <Backlink />
                </div>
                <section className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
                    <div>
                        <img src="/demo.jpg" alt={page?.title} className='image-mapa rounded-4xl'/>
                    </div>
                    <div>
                        <h1>{page?.title || 'Clasificador de Cultivos'}</h1>
                        <p className="my-5 leading-10">Este instrumento ofrece una representación geoespacial de los cultivos en Jalisco del año 2021. A través de un mapa interactivo, integra información procesada con modelos de inteligencia artificial que identifican el tipo de cultivo y su ubicación mediante el análisis de imágenes satelitales.</p>
                        <TrackedLink to={`/clasificador-cultivos/documentacion`} className="mt-2 inline-block text-18 text-card bg-[#454545] rounded-2xl px-4 py-2">
                            Ver la documetación del proyecto                                
                        </TrackedLink>
                    </div>
                </section>
                <section className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-25 gap-10 text-center diez">
                    <div>
                        <p>Modelos de IA detectan y clasifican a gran escala, cultivos a través de la interpretación de imágenes satelitales.</p>
                    </div>
                    <div>
                        <p>Segmentación de parcelas: identifica los límites de las parcelas agrícolas con ayuda de imágenes satelitales del Programa NICFI</p>
                    </div>
                    <div>
                        <p>Clasificación del tipo de cultivo: clasifica el tipo de cultivo dentro de cada parcela identificada, utilizando series de tiempo de imágenes satelitales provenientes de Sentinel-1 y Sentinel-2.</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-primary text-center">Clasificador de cultivos en cifras</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-15 mb-25 text-center">
                        <div>
                            <b>80,000 kilómetros cuadrados</b><br></br>
                            <p>Área de estudio</p>
                        </div>
                        <div>
                            <b>81%</b><br></br>
                            <p>Precisión general (usando ConvNet + InceptionTime)</p>
                        </div>
                        <div>
                            <b>+3% de precisión general (segmentación ConvNet)</b><br></br>
                            <p>Mejora en Precisión (ConvNet vs. MSC)</p>
                        </div>
                        <div>
                            <b>+9.9% de mejora en IoU (de 0.668 a 0.734)</b><br></br>
                            <p>Mejora en IoU (5-ch vs. 3-ch ConvNet)</p>
                        </div>
                        <div>
                            <b>+5.8% de mejora en Average Precision (AP)</b><br></br>
                            <p>Mejora en AP (5-ch vs. 3-ch ConvNet)</p>
                        </div>
                    </div>
                </section>
                <section className="px-2">
                    <h2 className="text-primary text-center">Imágenes de la plataforma</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-15 mb-25 text-center">
                        <div>
                            <img src={page?.imagen ? page.imagen : "/demo.jpg"} alt={page?.titulo} className='image-mapa rounded-4xl'/>
                        </div>
                        <div>
                            <img src={page?.imagen ? page.imagen : "/demo.jpg"} alt={page?.titulo} className='image-mapa rounded-4xl'/>
                        </div>
                        <div>
                            <img src={page?.imagen ? page.imagen : "/demo.jpg"} alt={page?.titulo} className='image-mapa rounded-4xl'/>
                        </div>
                    </div>
                </section>
                <section className="px-2">
                    <h2 className="text-primary text-center">Papers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-15 mb-25 text-center">
                        <div>
                            <img src={page?.imagen ? page.imagen : "/demo.jpg"} alt={page?.titulo} className='image-mapa rounded-4xl'/>
                        </div>
                        <div>
                            <img src={page?.imagen ? page.imagen : "/demo.jpg"} alt={page?.titulo} className='image-mapa rounded-4xl'/>
                        </div>                
                    </div>
                    <TrackedLink to="/clasificador-cultivos/paper"className="mt-2 block mx-auto text-18 text-card bg-[#454545] rounded-2xl px-4 py-2 text-center w-[350px]">Ver artículo completo</TrackedLink>
                </section>
            </div>
        </>
    )
}

