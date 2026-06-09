import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import '../../blocks/styles/flash.css'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import TrackedLink from '@components/blocks/boton'

dayjs.locale('es')

export default function Flashes() {
    const [flashes, setFlashes] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchFlashes = async () => {
            const response = await api.get('/flashes/last')
            setFlashes(response.data)
        }
        
        fetchFlashes()
    }, [location])

    return (
        <div className="float-left w-full lg:w-10/12">
        <div className="bg-card rounded-3xl p-10 md:p-18 mb-5">
            {flashes.map(flash => (
                <div className='' key={flash.id}>
                    <div className='mb-5'>
                        <h3 className='text-22'>{flash.titulo}</h3>
                    </div>
                    <div>                        
                        <div dangerouslySetInnerHTML={{ __html: flash.desc_jal }}  className='flash_desc'/>
                    </div>
                    <div className='flex gap-4 mt-5'>
                        <p className='text-[11px] rounded-xl py-2 px-5 bg-etiqueta text-tertiary'>
                            {flash.periocidad}
                            </p>                        
                        <p className='text-[11px] rounded-xl py-2 px-5 bg-etiqueta-ter text-titulo'>
                            {dayjs(flash.fecha_publicacion).format('D [de] MMMM [de] YYYY')}
                        </p>
                    </div>
                </div>
            ))}
        </div>
        <TrackedLink to="/flashes" className="button2 block mx-auto w-[350px] text-center lg:float-left mt-3 text-tertiary hover:text-white border-tertiary hover:bg-tertiary">
            Quiero ver los datos más nuevos
        </TrackedLink>
        </div>
    )
}