import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';

export default function Flashes() {
    const [flashes, setFlashes] = useState([])
    const location = useLocation()
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'desc_jal', 'desc_nac', 'periocidad', 'link', 'fuente'];

    useEffect(() => {
        const fetchFlashes = async () => {
            const response = await api.get('/flashes')
            setFlashes(response.data.flashes)
        }
        fetchFlashes()
    }, [location])

    const filteredPosts = !searchTerm 
        ? flashes 
        : flashes.filter(post => {
            return keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], post);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    return (
        <div>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <hr />
            {filteredPosts.map(flash => (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-pink-500 rounded-lg p-4' key={flash.id}>
                    <div className='md:col-span-2'><h3>{flash.titulo}</h3></div>
                    <div className='border-2 border-gray-200 rounded-lg p-4'>
                        <h3>Jalisco</h3>
                        <p>{flash.desc_jal}</p>
                    </div>
                    <div className='border-2 border-gray-200 rounded-lg p-4'>
                        <h3>Nacional</h3>
                        <p>{flash.desc_nac}</p>
                    </div>
                    <div className='md:col-span-2 border-2 border-gray-200 rounded-lg p-4'>
                        <p>periocidad: {flash.periocidad}</p>
                        <p>Link: {flash.link}</p>
                        <p>Fuente: {flash.fuente}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}