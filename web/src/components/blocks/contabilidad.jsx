import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Contabilidad() {
    const [contabilidad, setContabilidad] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchContabilidad = async () => {
            const response = await api.get('/archivos/contabilidad')
            setContabilidad(response.data)
        }
        fetchContabilidad()
    }, [location])

    return (
        <div>
            <h1>Contabilidad</h1>
            <ul>
                {contabilidad.map((archivo) => (
                    <li key={archivo.id}>
                        <a href={archivo.archivo} target="_blank" rel="noopener noreferrer">
                            {archivo.titulo}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}