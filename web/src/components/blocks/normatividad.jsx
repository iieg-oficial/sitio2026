import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Normatividad() {
    const [normatividad, setNormatividad] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchNormatividad = async () => {
            const response = await api.get('/docs_iieg/tipo/normatividad')
            setNormatividad(response.data.docs_iieg)
        }
        fetchNormatividad()
    }, [location])

    return (
        <div className="container-fuid py-15 px-2 bg-card">
            <h2 className="text-titulo text-center">Normatividad</h2>
            <div className="container mx-auto mt-8">
                    {normatividad.map(normatividad => (
                        <div key={normatividad.id} className="flex items-center gap-2 mb-4 p-4 border border-[#E6EEFF] rounded-3xl group bg-white hover:border-tertiary">
                            <a href={normatividad.documento} target="_blank" rel="noopener noreferrer" download className='flex gap-4'>
                                <span class="material-symbols--download"></span> <p className='text-22 text-titulo group-hover:text-tertiary'>{normatividad.nombre}</p>
                            </a>
                        </div> 
                    ))}
            </div>
        </div>
    )
}
    