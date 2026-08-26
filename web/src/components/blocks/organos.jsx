import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import TrackedLink from '@components/blocks/boton'
import ConditionalLink from '../pageComponents/ConditionalLink'
import { SafeHtml } from '@components/SafeHtml';

export default function Organos() {
    const [organos, setOrganos] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchOrganos = async () => {
            const response = await api.get('/organos')
            setOrganos(response.data.organos)
        }
        fetchOrganos()
    }, [location])

    return (
        <div className='container mx-auto px-2 mb-15'>
        {organos.map(organo => (
            <ConditionalLink
            key={organo.id}
            link={organo.link}
            target="_blank"
            rel="noopener noreferrer"
            >
            <div className={`bg-card group rounded-[45px] px-10 py-5 md:px-15 md:px-15 xl:px-20 xl:py-5 mb-10 ${organo.link ? "hover:border-2 hover:border-primary" : ""}`}>
                <h2 className='text-primary font-extrabold'>{organo.titulo}</h2>
                
                <SafeHtml htmlContent={organo.descripcion} className='diez my-5' />
                {organo.link && (
                <div className='mb-4 h-10'>
                    <div className='group-hover:bg-tertiary col-span-1 bg-white shadow-lg h-[40px] w-[40px] rounded-full flex items-center justify-center transition-shadow duration-300 hover:shadow-xl float-right'>
                    <span className="quill--link-out text-tertiary group-hover:bg-white!"></span>
                    </div>
                </div>
                )}
            </div>
            </ConditionalLink>
        ))}
        </div>
    )
}