import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Snieg() {
    const [snieg, setSnieg] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchSnieg = async () => {
            const response = await api.get('/snieg')
            setSnieg(response.data.snieg)
        }
        fetchSnieg()
    }, [location])

    return (
        <div className="border-2 border-red-500">
            <h1>Snieg</h1>
            {snieg.map(snieg => (
                <div key={snieg.id}>
                    <h3>{snieg.titulo}</h3>
                    <p>{snieg.descripcion}</p>
                    <p>{snieg.enlace}</p>
                    {snieg.imagen && <img src={snieg.imagen} alt={snieg.titulo} />}
                </div>
            ))}
        </div>
    )
}