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
            const response = await api.get('/flashes/last/')
            setFlashes(response.data)
        }
        
        fetchFlashes()
    }, [location])

    return (
        <div className="float-left w-full lg:w-10/12">
        <div className="bg-card rounded-3xl p-10 md:px-20 md:py-18 mb-5">
            {flashes.map(flash => (
                <div className='' key={flash.id}>
                    <div className='mb-5'>
                        <h3 className='text-22 text-tertiary font-extrabold font-900'>{flash.titulo}</h3>
                    </div>
                    <div>                        
                        <div dangerouslySetInnerHTML={{ __html: flash.desc_jal }}  className='flash_desc'/>
                    </div>
                    <div className='flex flex-wrap gap-4 mt-10'>
                        <p className='text-[12px] font-bold rounded-xl py-3 px-5 bg-etiqueta-ter text-titulo border border-[#162A554D]'>
                            {flash.periocidad}
                            </p>                        
                        <p className='text-[12px] font-bold rounded-xl py-3 px-5 bg-[#FFF2E5] text-tertiary border border-[#FF83004D]'>
                            {dayjs(flash.fecha_publicacion).format('D [de] MMMM [de] YYYY')}
                        </p>
                    </div>
                </div>
            ))}
        </div>
        <TrackedLink to="/datos-expres" className="button2 block mx-auto w-full sm:w-[350px] text-center lg:float-left mt-3 text-tertiary hover:text-white border-tertiary hover:bg-tertiary">
            Quiero ver los datos más nuevos
        </TrackedLink>
        </div>
    )
}