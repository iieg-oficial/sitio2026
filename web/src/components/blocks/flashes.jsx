import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import api from '@services/apiService'
import Searcher from '../pageComponents/searcher';

export default function Flashes() {
    const [flashes, setFlashes] = useState([])
    const [searchTerm, setSearchTerm] = useState("");
    const keys = ['titulo', 'desc_jal', 'desc_nac', 'periocidad', 'fuente', 'subject.titulo'];
    const [activeTab, setActiveTab] = useState("Todos");

    const fetchFlashes = async () => {
        const response = await api.get('/flashes')
        setFlashes(response.data.flashes)
    }

    useEffect(() => {
        fetchFlashes()
    }, []);

    const filteredFlashes = !searchTerm 
        ? flashes 
        : flashes.filter(post => {
            return keys.some(key => {
                const value = key.split('.').reduce((obj, part) => obj?.[part], post);
                return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });

    const types = [...new Set(
        filteredFlashes.map(post => post.subject.titulo)
    )].sort();

    const filteredFlashesByType = activeTab === "Todos"
        ? filteredFlashes
        : filteredFlashes.filter(post => post.subject.titulo === activeTab);

        const [itemOffset, setItemOffset] = useState(0);
        const itemsPerPage = 12;

        const endOffset = itemOffset + itemsPerPage;
        const currentFlashes = filteredFlashesByType.slice(itemOffset, endOffset);
        const pageCount = Math.ceil(filteredFlashesByType.length / itemsPerPage);

        const handlePageClick = (event) => {
            const newOffset = (event.selected * itemsPerPage) % filteredFlashesByType.length;
            setItemOffset(newOffset);
        };

        useEffect(() => {
            setItemOffset(0);
        }, [searchTerm, activeTab]);

        const handleTabClick = (tab) => {
            setActiveTab(tab);
            setItemOffset(0);
        };

        useEffect(() => {
            setItemOffset(0);
        }, [searchTerm, activeTab]);

    return (
        <div>
            <Searcher searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <hr />
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => { setActiveTab("Todos"); setItemOffset(0); }}
                    className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === "Todos"
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                    }`}
                >
                    Todos
                </button>
                {types.map(type => (
                    <button
                        key={type}
                        onClick={() => { setActiveTab(type); setItemOffset(0); } }
                        className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${activeTab === type
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
            {currentFlashes.map(flash => (
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