import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import './datos_nuevos.css'

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

    const imagenes = {
    sube:   "/ico_flecha_positivo.png",
    baja: "/ico_flecha_negativo.png",
    igual:  "/ico_igual.png",
    };

    return (
        <div className="">
            {datosNuevos.map(datoNuevo => (
                <div className="grid grid-cols-12 gap-4 my-4 md:my-10 bg-card rounded-3xl p-4" key={datoNuevo.id}>
                    <div className="col-span-10 bg-cardrounded-3xl p-4 pr-0">
                        <h3 className='text-tertiary text-44 font-extrabold'>{datoNuevo.cifras}</h3>
                        <div dangerouslySetInnerHTML={{ __html: datoNuevo.descripcion }} className='datosn text-titulo font-900' />
                    </div>
                    <div className="col-span-2 pt-4">
                            <img src={imagenes[datoNuevo.tipo]} alt={datoNuevo.cifras} className="object-center object-cover mx-auto pt-2 xl:pt-4" />
                    </div>
                </div>
            ))}
        </div>
    )
}