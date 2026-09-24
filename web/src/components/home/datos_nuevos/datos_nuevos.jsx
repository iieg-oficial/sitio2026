import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import './datos_nuevos.css'
import { SafeHtml } from '@components/SafeHtml';

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

    {/*const imagenes = {
    sube:   "/ico_flecha_positivo.png",
    baja: "/ico_flecha_negativo.png",
    igual:  "/ico_igual.png",
    };*/}

    return (
        <div className="">
            {datosNuevos.map(datoNuevo => (
                <div className="grid grid-cols-12 gap-4 my-4 md:my-10 bg-card rounded-3xl p-4" key={datoNuevo.id}>
                    <div className="col-span-12 bg-cardrounded-3xl p-4 pr-0">
                        <h3 className='text-tertiary text-44 font-extrabold'>{datoNuevo.cifras}</h3>
                        <SafeHtml htmlContent={datoNuevo.descripcion} className='datosn text-titulo font-900 font-extrabold' />
                    </div>
                </div>
            ))}
        </div>
    )
}