import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function DatosNuevos() {
    const [datosNuevos, setDatosNuevos] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchDatosNuevos = async () => {
            const response = await api.get('/datos-nuevos')
            setDatosNuevos(response.data)
        }
        fetchDatosNuevos()
    }, [location])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {datosNuevos.map(datoNuevo => (
                <div key={datoNuevo.id}>
                    <h3>{datoNuevo.numero}</h3>
                    <p>{datoNuevo.descripcion}</p>
                </div>
            ))}
        </div>
    )
}