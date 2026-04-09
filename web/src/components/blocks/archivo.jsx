import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Archivo() {
    const [archivos, setArchivos] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchArchivos = async () => {
            const response = await api.get('/archivos/institucionales')
            setArchivos(response.data)
        }
        fetchArchivos()
    }, [location])

    return (
        <div>
            <h1>Archivo</h1>
            <ul>
                {archivos.map((archivo) => (
                    <li key={archivo.id}>
                        <a href={archivo.archivo} target="_blank" rel="noopener noreferrer">
                            {archivo.titulo}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
            