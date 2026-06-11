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
            <h2 className="text-center mb-15">Valores</h2>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {valores.map(valor => (
                <div key={valor.id} className="bg-card rounded-xl px-4 py-6 my-4 grid grid-cols-12 gap-4">
                    <div className="col-span-2">
                        <img src={valor.imagen ? valor.imagen : "/default.png"} alt={valor.nombre} className='w-[50px] h-auto float-right'/>
                    </div>
                    <div className="col-span-10">
                        <h5 className="col-span-12 text-primary">{valor.nombre}</h5>
                        <div className="col-span-12 mt-5 diez" dangerouslySetInnerHTML={{ __html: valor.descripcion }} />
                    </div>
                </div>
            ))}
            </div>
        </div>
    )
}
    