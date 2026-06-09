import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import './mapas.css'
import TrackedLink from '@components/blocks/boton'

export default function Mapas() {
    const [mapas, setMapas] = useState([])
    const location = useLocation()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const fetchMapas = async () => {
            const response = await api.get('/mapas/random')
            setMapas(response.data.mapas)
        }
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        handleResize()
        window.addEventListener('resize', handleResize)

        fetchMapas()
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [location])

    const mapasFiltrados = isMobile ? mapas.slice(0, 1) : mapas
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mapasFiltrados.map(mapa => (
                <div key={mapa.id} className="p-4 overflow-hidden mapa">                    
                    <img src={mapa.imagen ? mapa.imagen : "/demo.jpg"} alt={mapa.titulo} className='image-mapa'/>
                    <div>
                        <TrackedLink to={`/mapas-historicos/${mapa.slug}`} className="mt-2 inline-block text-sm text-[#6618a2]">
                            <h3 className='text-white'>{mapa.titulo}</h3>
                            
                            <div className='flex'>                            
                                <p className='bg-card text-titulo rounded-2xl px-1 text-14'>{mapa.anyo}</p>
                                <p className='bg-etiqueta-sec text-primary rounded-2xl px-1 text-14'>{mapa.tipo}</p>
                            </div>
                            
                        </TrackedLink>
                    </div>
                </div>
            ))}
        </div>
    )
}