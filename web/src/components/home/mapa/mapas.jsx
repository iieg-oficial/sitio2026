import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'
import './mapas.css'
import TrackedLink from '@components/blocks/boton'

export default function Mapas() {
    const [mapas, setMapas] = useState([])
    const location = useLocation()
    const [isMobile, setIsMobile] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchMapas = async () => {
            const response = await api.get('/mapas/random/')
            if (Array.isArray(response.data?.mapas)) {
                    setMapas(response.data.mapas)
                } else if (Array.isArray(response.data)) {
                    setMapas(response.data)
                }
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


    if (loading || !mapas || mapas.length === 0) {
        return null // O puedes retornar un skeleton / loader
    }

    const mapasFiltrados = isMobile ? mapas.slice(0, 1) : mapas
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-15 extra:max-w-[1980px] mx-auto w-full">
            {mapasFiltrados.map((mapa) => {
                if (!mapa) return null
                
                const thumb = mapa.imagen 
                            ? mapa.imagen.substring(mapa.imagen.lastIndexOf('/') + 1) 
                            : null;
                const titulo = mapa?.titulo ?? '';

                return (
                <TrackedLink to={`/mapas-historicos/${mapa.slug}`} key={mapa.id}>
                    <div key={mapa.id} className="overflow-hidden mapa h-60 xl:h-96 relative rounded-4xl">  
                
                        <img 
                            src={thumb ? `https://iieg.jalisco.gob.mx/acervo/thumb/portal/mapas/${thumb}?w=400` : "/demo.jpg"} 
                            alt={mapa.titulo} 
                            className='w-full h-full object-cover'
                            onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = `https://iieg.jalisco.gob.mx/acervo/portal/mapas/${thumb}`;
                                }}
                            />
                        <div className='info px-5 mt-2 inline-block text-sm text-[#6618a2]'>
                            
                                {titulo && <h3 className='text-white text-22 font-garet-bold font-800'>{titulo}</h3>}
                                
                                <div className='flex mb-5 mt-8 gap-2'>  
                                    {mapa.anyo ? <p className='text-14 font-bold rounded-xl py-2 px-5 bg-etiqueta text-tertiary border border-[#FF83004D]'>{mapa.anyo}</p> : null}                        
                                    {mapa.tipo ? <p className='text-14 font-bold rounded-xl py-2 px-5 bg-etiqueta-ter text-titulo border border-[#162A554D]'>{mapa.tipo}</p> : null}                                    
                                </div>
                                
                            
                        </div>
                    </div>
                </TrackedLink>
                );
            })}
        </div>
    )
}