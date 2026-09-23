import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import '../../blocks/styles/flash.css'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import TrackedLink from '@components/blocks/boton'
import { SafeHtml } from '@components/SafeHtml';

dayjs.locale('es')

export default function Flashes() {
    const [flashes, setFlashes] = useState([])
    const location = useLocation()

    const fetchFlashes = useCallback(async (isMounted = true) => {
        try {
            const response = await api.get('/flashes/last', {
                params: { _t: new Date().getTime() } // Evita caché del navegador/Axios
            });
            if (isMounted) {
                setFlashes(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error("Error al cargar el último flash:", error);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Carga inicial al cambiar de ubicación/ruta
        fetchFlashes(isMounted);

        // Re-consultar automáticamente cuando el usuario regresa a la pestaña
        const handleFocus = () => fetchFlashes(isMounted);
        window.addEventListener('focus', handleFocus);

        return () => {
            isMounted = false;
            window.removeEventListener('focus', handleFocus);
        };
    }, [location, fetchFlashes]);

    return (
        <div className="float-left w-full lg:w-10/12">
        <div className="bg-card rounded-3xl p-10 md:px-20 md:py-18 mb-5">
            {flashes.map(flash => (
                <div className='' key={flash.id}>
                    <div className='mb-5'>
                        <h3 className='text-22'>{flash.titulo}</h3>
                    </div>
                    <div>                        
                        <SafeHtml htmlContent={flash.desc_jal} className='flash_desc'/>
                    </div>
                    <div className='flex flex-wrap gap-4 mt-10'>
                        <p className='font-garet-bold capitalize text-[12px] font-bold rounded-xl py-3 px-5 bg-etiqueta-ter text-titulo border border-[#162A554D]'>
                            {flash.periocidad}
                        </p>                        
                        <p className='font-garet-bold capitalize text-[12px] font-bold rounded-xl py-3 px-5 bg-[#FFF2E5] text-tertiary border border-[#FF83004D]'>
                            {dayjs(flash.fecha_publicacion).format('D [de] MMMM [de] YYYY')}
                        </p>
                    </div>
                </div>
            ))}
        </div>
        <TrackedLink to="/datos-expres" className="button2 block mx-auto w-full sm:w-[350px] text-center lg:float-left mt-7 lg:mt-10 text-tertiary hover:text-white border-tertiary hover:bg-tertiary">
            Quiero ver los datos más nuevos
        </TrackedLink>
        </div>
    )
}