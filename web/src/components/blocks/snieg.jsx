import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import TrackedLink from '@components/blocks/boton'
import ConditionalLink from '../pageComponents/ConditionalLink'

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
                const thumb = original.substring(original.lastIndexOf('/') + 1);

                return (
                    <ConditionalLink
                    key={snieg.id}
                    link={snieg.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <div key={snieg.id} className={`bg-card rounded-3xl px-10 px-20 mb-5 grid md:grid-cols-6 gap-5 ${ snieg.enlace ? "hover:border-1 hover:border-tertiary" : ""} `}>
                        <div className='md:col-span-2'>
                            <img src={snieg.imagen ? snieg.imagen : "/demo.jpg"} alt={snieg.titulo} />
                            {/*<img src={snieg.imagen ? `https://iieg.jalisco.gob.mx/acervo/thumb/portal/snieg/${thumb}?w=400` : "/demo.jpg"} alt={snieg.titulo} /> */}
                        </div>
                        <div className='md:col-span-4'>
                            <h2 className='text-titulo font-extrabold'>{snieg.titulo}</h2>
                            <div dangerouslySetInnerHTML={{__html: snieg.descripcion}} className='diez mt-5' />
                            { snieg.enlace ?
                                                <div className='mb-4 h-10'>
                                                <TrackedLink to={snieg.enlace} className="" target="_blank" rel="noopener noreferrer">
                                                <div className='col-span-1 bg-white shadow-lg h-[40px] w-[40px] rounded-full flex items-center justify-center transition-shadow duration-300 hover:shadow-xl float-right'>
                                                    <span className="quill--link-out text-tertiary"></span>
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