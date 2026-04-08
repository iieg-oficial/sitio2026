import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import api from '@services/apiService'

export default function Directorio() {
    const [directorio, setDirectorio] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchDirectorio = async () => {
            const response = await api.get('/directorio', { params: { director: true } })
            setDirectorio(response.data)
        }
        fetchDirectorio()
    }, [location])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <h1>director</h1>
            {directorio.map(directorio => (
                <div key={directorio.id}>
                    <p>{directorio.nombre}</p>
                    <p>{directorio.cargo}</p>
                </div>
            ))}
        </div>
    )
}