import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Valores() {
    const [valores, setValores] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchValores = async () => {
            const response = await api.get('/docs_iieg/tipo/valor')
            setValores(response.data.docs_iieg)
        }
        fetchValores()
    }, [location])

    return (
        <div className="container-fuid py-15 px-2">
            <h1 className="font-bold text-3xl text-center">Valores</h1>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {valores.map(valor => (
                <div key={valor.id} className="bg-gray-100 rounded-lg p-4 my-4 grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                        <img src={valor.imagen ? valor.imagen : "/default.png"} alt={valor.nombre} className='w-[50px] h-auto float-right'/>
                    </div>
                    <div className="col-span-10">
                        <h3 className="col-span-12">{valor.nombre}</h3>
                        <div className="col-span-12" dangerouslySetInnerHTML={{ __html: valor.descripcion }} />
                    </div>
                </div>
            ))}
            </div>
        </div>
    )
}
    