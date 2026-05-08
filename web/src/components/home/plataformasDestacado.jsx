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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-48 bg-amber-300 mx-auto container absolute top-0 z-10 rounded-3xl">
            {plataformas.map(plataforma => (
                <div key={plataforma.id} className="flex flex-col items-center">
                    <a href={plataforma.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                        <img src={plataforma.imagen} alt={plataforma.titulo} className="w-full object-cover"/>
                        <h3 className="mt-2 text-center">{plataforma.titulo}</h3>
                    </a>
                </div>
            ))}
        </div>
    )
}
            