import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import './datos_nuevos.css'

export default function DatosNuevos() {
    const [datosNuevos, setDatosNuevos] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchDatosNuevos = async () => {
            const response = await api.get('/datos-nuevos/')
            setDatosNuevos(response.data.datos_nuevos)
        }
        fetchDatosNuevos()
    }, [location])

    const imagenes = {
    sube:   "/ico_flecha_positivo.png",
    baja: "/ico_flecha_negativo.png",
    igual:  "/ico_igual.png",
    };

    return (
        <div className="">
            {datosNuevos.map(datoNuevo => (
                <div className="grid grid-cols-12 gap-4 my-4 md:my-10 bg-card rounded-3xl p-4" key={datoNuevo.id}>
                    <div className="col-span-9 bg-cardrounded-3xl p-4 col-span-1">
                        <h3 className='text-tertiary text-44 font-extrabold'>{datoNuevo.cifras}</h3>
                        <div dangerouslySetInnerHTML={{ __html: datoNuevo.descripcion }} className='datosn' />
                    </div>
                    <div className="col-span-3 content-center md:px-4">
                            <img src={imagenes[datoNuevo.tipo]} alt={datoNuevo.cifras} className="object-center object-cover mx-auto" />
                    </div>
                </div>
            ))}
        </div>
    )
}