import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Organos() {
    const [organos, setOrganos] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchOrganos = async () => {
            const response = await api.get('/organos')
            setOrganos(response.data)
        }
        fetchOrganos()
    }, [location])

    return (
        <div>
            <h1>Organos</h1>
            {organos.map(organo => (
                <div key={organo.id}>
                    <p>{organo.nombre}</p>
                    <p>{organo.descripcion}</p>
                    <a href={organo.url}>Ver más</a>
                </div>
            ))}
        </div>
    )
}