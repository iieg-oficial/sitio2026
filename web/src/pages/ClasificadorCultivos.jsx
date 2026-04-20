import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router'

export default function ClasificadorCultivos() {
    return (
        <>
        <section className="container mx-auto grid grid-cols-1 md:grid-cols-2">
            <div>
                <img src="/logo_iieg.svg" alt="MapaLab" className="w-full h-full object-cover" />
            </div>
            <div>
                <h1>Clasificador de Cultivos</h1>
                <p>Este instrumento ofrece una representación geoespacial de los cultivos en Jalisco del año 2021. A través de un mapa interactivo, integra información procesada con modelos de inteligencia artificial que identifican el tipo de cultivo y su ubicación mediante el análisis de imágenes satelitales.</p>
                <Link to="/clasificador-cultivos/descargar">Descargar</Link>
            </div>
        </section>
        <section className="container mx-auto grid grid-cols-1 md:grid-cols-3">
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
            <h2>Clasificador de cultivos en cifras</h2>
            <div className="grid grid-cols-1 md:grid-cols-3">
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
        <section>
            <h2>Imágenes de la plataforma</h2>
            <div className="grid grid-cols-1 md:grid-cols-3">
                <div>
                    <img src="/logo_iieg.svg" alt="MapaLab" className="w-full h-full object-cover" />
                </div>
                <div>
                    <img src="/logo_iieg.svg" alt="MapaLab" className="w-full h-full object-cover" />
                </div>
                <div>
                    <img src="/logo_iieg.svg" alt="MapaLab" className="w-full h-full object-cover" />
                </div>
            </div>
        </section>
        <section>
            <h2>Papers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div>
                    <img src="/logo_iieg.svg" alt="MapaLab" className="w-full h-full object-cover" />
                </div>
                <div>
                    <img src="/logo_iieg.svg" alt="MapaLab" className="w-full h-full object-cover" />
                </div>                
            </div>
            <Link to="/clasificador-cultivos/paper">Ver artículo completo</Link>
        </section>
        </>
    )
}

