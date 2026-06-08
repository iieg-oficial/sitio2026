import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

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
        <div className="grid grid-cols-1 gap-4 mb-4">
            {flashes.map(flash => (
                <div className='bg-card rounded-3xl p-4' key={flash.id}>
                    <div><h3>{flash.titulo}</h3></div>
                    <div>
                        <h3>Jalisco</h3>
                        <div dangerouslySetInnerHTML={{ __html: flash.desc_jal }}  />
                    </div>
                    <div>
                        <p>periocidad: {flash.periocidad}</p>
                        <p>Link: {flash.link}</p>
                        <p>Fuente: {flash.fuente}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}