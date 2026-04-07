import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Valores() {
    const [valores, setValores] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchValores = async () => {
            const response = await api.get('/valores')
            setValores(response.data.valores)
        }
        fetchValores()
    }, [location])

    return (
        <div className="border-2 border-red-500">
            <h1>Valores</h1>
            {valores.map(valor => (
                <div key={valor.id}>
                    <h3>{valor.nombre}</h3>
                    <p>{valor.descripcion}</p>
                </div>
            ))}
        </div>
    )
}
    