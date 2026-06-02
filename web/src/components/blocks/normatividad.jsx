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
        <div className="container-fuid py-15 px-2">
            <h1 className="font-bold text-3xl text-center">Normatividad</h1>
            <div className="container mx-auto mt-8">
                    {normatividad.map(normatividad => (
                        <div key={normatividad.id} className="flex items-center gap-2 mb-4 p-4 border rounded-lg">
                            <img src={normatividad.imagen ? normatividad.imagen : "/default.png"} alt={normatividad.nombre} className='w-[50px] h-auto mb-5'/>
                            <h3>{normatividad.nombre}</h3>
                        </div>
                    ))}
            </div>
        </div>
    )
}
    