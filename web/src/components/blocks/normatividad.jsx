import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Normatividad() {
    const [normatividad, setNormatividad] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchNormatividad = async () => {
            const response = await api.get('/docs_iieg/tipo/normatividad')
            setNormatividad(response.data.docs_iieg)
        }
        fetchNormatividad()
    }, [location])

    return (
        <div className="border-2 border-red-500">
            <h1>Normatividad</h1>
            {normatividad.map(normatividad => (
                <div key={normatividad.id}>
                    <h3>{normatividad.nombre}</h3>
                    <p>{normatividad.descripcion}</p>
                </div>
            ))}
        </div>
    )
}
    