import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'

export default function Flashes() {
    const [flashes, setFlashes] = useState([])
    const location = useLocation()

    useEffect(() => {
        const fetchFlashes = async () => {
            const response = await api.get('/flashes')
            setFlashes(response.data.flashes)
        }
        console.log(flashes)
        fetchFlashes()
    }, [location])

    return (
        <div className="">
            {flashes.map(flash => (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4' key={flash.id}>
                    <div className='md:col-span-2'><h3>{flash.titulo}</h3></div>
                    <div>
                        <h3>Jalisco</h3>
                        <p>{flash.desc_jal}</p>
                    </div>
                    <div>
                        <h3>Nacional</h3>
                        <p>{flash.desc_nac}</p>
                    </div>
                    <div className='md:col-span-2'>
                        <p>periocidad: {flash.periocidad}</p>
                        <p>Link: {flash.link}</p>
                        <p>Fuente: {flash.fuente}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}