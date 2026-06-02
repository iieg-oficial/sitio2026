import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Valores() {
    const [valores, setValores] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchValores = async () => {
            const response = await api.get('/docs_iieg/tipo/valor')
            setValores(response.data.docs_iieg)
        }
        fetchValores()
    }, [location])

    return (
        <div className="container-fuid py-15">
            <h1 className="font-bold text-3xl text-center">Valores</h1>
            {valores.map(valor => (
                <div key={valor.id}>
                    <h3>{valor.nombre}</h3>
                    <p>{valor.descripcion}</p>
                </div>
            ))}
        </div>
    )
}
    