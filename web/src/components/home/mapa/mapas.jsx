import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import './mapas.css'

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
                <div key={mapa.id} className="border rounded-lg p-4 overflow-hidden mapa">
                    <h3>{mapa.titulo}</h3>
                    <p>{mapa.ubicacion}</p>
                    {mapa.anyo && <p><strong>Año:</strong> {mapa.anyo}</p>}
                    <img src={mapa.imagen ? mapa.imagen : "/demo.jpg"} alt={mapa.titulo} className='image-mapa'/>
                    <Link to={`/mapas-historicos/${mapa.slug}`} className="mt-2 inline-block text-sm text-[#6618a2] hover:underline">
                        Ver mapa
                    </Link>
                </div>
            ))}
        </div>
    )
}