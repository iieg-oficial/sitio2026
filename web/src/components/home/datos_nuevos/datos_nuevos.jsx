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

    const colores = {
    sube:   "/ico_menos.svg",
    baja: "/ico_flecha negativo.svg",
    igual:  "/ico_igual.svg",
    };

    return (
        <div className="grid grid-cols-12 gap-4 my-10">
            {datosNuevos.map(datoNuevo => (
                <div key={datoNuevo.id} className="bg-cardrounded-3xl p-4 col-span-1">
                    <h3 className='text-tertiary'>{datoNuevo.cifras}</h3>
                    <div dangerouslySetInnerHTML={{ __html: datoNuevo.descripcion }}  className='text-titulos text-18'/>
                </div>
                <div className="col-span-2">
                    <img src={colores[datoNuevo.tipo]} alt={datoNuevo.cifras} className="w-full h-auto object-center object-cover" />
                </div>
            ))}
        </div>
    )
}