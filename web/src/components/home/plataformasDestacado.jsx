import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'

export default function PlataformasDestacado() {
    const [plataformas, setPlataformas] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchPlataformas = async () => {
            const response = await api.get('/plataformas', { params: { destacado: true } })
            setPlataformas(response.data)
        }
        fetchPlataformas()
    }, [location])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {plataformas.map(plataforma => (
                <div key={plataforma.id}>
                    <a href={plataforma.url} target="_blank" rel="noopener noreferrer">
                        <img src={plataforma.imagen} alt={plataforma.titulo} />
                    </a>
                </div>
            ))}
        </div>
    )
}
            