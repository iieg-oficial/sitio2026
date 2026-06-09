import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'

export default function PlataformasDestacado() {
    const [plataformas, setPlataformas] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchPlataformas = async () => {
            const response = await api.get('/sistemas/destacados')
            setPlataformas(response.data.sistemas)
        }
        fetchPlataformas()
    }, [location])

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-48 bg-card mx-auto w-11/12 order-1 md:order-2 container md:w-11/12 2xl:container md:absolute top-0 z-10 md:rounded-3xl md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 place-items-center">
            {plataformas.map(plataforma => (
                <div key={plataforma.id}>
                    <a href={plataforma.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                        <img src={plataforma.imagen} alt={plataforma.titulo} className="w-full object-cover"/>
                        <h3 className="mt-2 text-center text-terciary text-22">{plataforma.titulo}</h3>
                    </a>
                </div>
            ))}
        </div>
    )
}
            