import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'

export default function PlataformasDestacado() {
    const [plataformas, setPlataformas] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchPlataformas = async () => {
            const response = await api.get('/sistemas/destacados/')
            setPlataformas(response.data.sistemas)
        }
        fetchPlataformas()
    }, [location])

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-card mx-auto xl:w-11/12 order-1 xl:order-2 container 2xl:container xl:absolute top-0 z-10 xl:rounded-4xl xl:left-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2 place-items-center pt-3 pb-5 px-5">
            {plataformas.map(plataforma => (
                <div key={plataforma.id}>
                    <a href={plataforma.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                        <img src={plataforma.imagen} alt={plataforma.titulo} className="w-full object-cover group-hover:scale-110 rounded-full max-h-[150px] max-w-[150px]"/>
                        <h3 className="mt-2 text-center text-tertiary text-18">{plataforma.titulo}</h3>
                    </a>
                </div>
            ))}
        </div>
    )
}
            