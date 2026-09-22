import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import TrackedLink from '@components/blocks/boton'
import ConditionalLink from '../pageComponents/ConditionalLink'
import { SafeHtml } from '@components/SafeHtml';

export default function Snieg() {
    const [snieg, setSnieg] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchSnieg = async () => {
            const response = await api.get('/snieg')
            setSnieg(response.data.snieg)
        }
        fetchSnieg()
    }, [location])

    return (
        <div className='container mx-auto px-2 mb-15'>
            
            {snieg.map(snieg => {

                const original = snieg.imagen                

                return (
                    <ConditionalLink
                    key={snieg.id}
                    link={snieg.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <div key={snieg.id} className={`bg-card rounded-3xl p-6 mb-5 group grid md:grid-cols-6 gap-4 ${ snieg.enlace ? "hover:border-1 hover:border-tertiary" : ""} `}>
                        <div className='md:col-span-2'>
                            <img src={snieg.imagen ? snieg.imagen : "https://iieg.jalisco.gob.mx/acervo/portal/img_postlink.png"} alt={snieg.titulo} />                            
                        </div>
                        <div className='lg:col-span-4'>
                            <h2 className='text-36 text-titulo font-garet-extra font-extrabold'>{snieg.titulo}</h2>
                            
                            <SafeHtml htmlContent={snieg.descripcion} className='mt-5 diez'/>
                            { snieg.enlace ?
                                                <div className='mb-4 h-10'>
                                                <TrackedLink to={snieg.enlace} className="" target="_blank" rel="noopener noreferrer">
                                                <div className='group-hover:bg-tertiary col-span-1 bg-white shadow-lg h-[40px] w-[40px] rounded-full flex items-center justify-center transition-shadow duration-300 hover:shadow-xl float-right'>
                                                    <span className="quill--link-out text-tertiary group-hover:bg-white!"></span>
                                                </div>
                                                </TrackedLink>
                                                </div>
                                            : null }
                        
                        </div>
                        
                    </div>
                    </ConditionalLink>
                );
            })}
        </div>
    )
}