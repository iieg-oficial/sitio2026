import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function DatosNuevos() {
    const [datosNuevos, setDatosNuevos] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchDatosNuevos = async () => {
            const response = await api.get('/datos-nuevos')
            setDatosNuevos(response.data.datos_nuevos)
        }
        fetchDatosNuevos()
    }, [location])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10">
            {datosNuevos.map(datoNuevo => (
                <div key={datoNuevo.id} className="border border-gray-300 rounded-3xl p-4">
                    <h3>{datoNuevo.cifras}</h3>
                    <div dangerouslySetInnerHTML={{ __html: datoNuevo.descripcion }}  />
                </div>
            ))}
        </div>
    )
}